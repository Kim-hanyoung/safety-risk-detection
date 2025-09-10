# backend/app/utils/vision.py
from ultralytics import YOLO
from dataclasses import dataclass
from typing import Literal, Optional
import numpy as np, cv2, json, os

ModelKind = Literal["fire", "ppe"]

@dataclass
class Detection:
    label: str
    conf: float
    bbox: list[float]

# backend/app/utils/vision.py
def _load_labels(json_path: Optional[str]):
    """
    허용 형태:
    1) { "names": { "0": "smoke", "1": "fire" }, "thresholds": {...} }
    2) { "0": "smoke", "1": "fire" }  # 루트에 바로 매핑
    3) ["smoke","fire"]               # 리스트
    """
    if not json_path or not os.path.exists(json_path):
        return {"names": None, "thresholds": {}}

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    names = None
    thresholds = {}

    if isinstance(data, dict) and "names" in data:
        names = data["names"]
        thresholds = data.get("thresholds", {}) or {}
    elif isinstance(data, dict):
        # 루트에 "0": "label" 형태인지 감지
        if all(str(k).isdigit() for k in data.keys()):
            names = {str(k): v for k, v in data.items()}
        else:
            names = None  # 예상 못한 포맷이면 모델 내장 names 사용
    elif isinstance(data, list):
        names = {str(i): v for i, v in enumerate(data)}

    return {"names": names, "thresholds": thresholds}


class YoloService:
    def __init__(self, fire_path: str, ppe_path: str,
                 fire_labels_json: Optional[str] = None, ppe_labels_json: Optional[str] = None,
                 default_conf: float = 0.25):
        self.fire = YOLO(fire_path) if fire_path else None
        self.ppe  = YOLO(ppe_path) if ppe_path else None
        self.default_conf = default_conf

        self.fire_meta = _load_labels(fire_labels_json)
        self.ppe_meta  = _load_labels(ppe_labels_json)

    def _run(self, model: YOLO, img_bgr: np.ndarray, meta: dict) -> tuple[list[Detection], np.ndarray]:
        r = model.predict(source=img_bgr, imgsz=640, verbose=False)[0]
        model_names = model.names if hasattr(model, "names") else r.names
        custom_names = meta.get("names") or {}
        thresholds = meta.get("thresholds") or {}

        def label_of(cls_idx: int) -> str:
            return custom_names.get(str(cls_idx)) or model_names[int(cls_idx)]

        dets: list[Detection] = []
        if r.boxes is not None:
            for b in r.boxes:
                x1, y1, x2, y2 = b.xyxy[0].tolist()
                conf = float(b.conf[0])
                cls  = int(b.cls[0])
                label = label_of(cls)
                # per-class threshold
                thr = float(thresholds.get(label, thresholds.get("default", self.default_conf)))
                if conf < thr:
                    continue
                dets.append(Detection(label=label, conf=conf, bbox=[x1, y1, x2, y2]))
        annotated = r.plot()  # BGR
        return dets, annotated

    def infer(self, img_bytes: bytes, kind: ModelKind | Literal["both"] = "both"):
        arr = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        out = {}
        if kind in ("fire", "both") and self.fire:
            dets, ann = self._run(self.fire, img, self.fire_meta)
            out["fire"] = {"detections": dets, "annotated": ann}
        if kind in ("ppe", "both") and self.ppe:
            dets, ann = self._run(self.ppe, img, self.ppe_meta)
            out["ppe"] = {"detections": dets, "annotated": ann}
        return out
