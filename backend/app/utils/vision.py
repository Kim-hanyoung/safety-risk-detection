from ultralytics import YOLO
from dataclasses import dataclass
import numpy as np
import cv2
from typing import Literal

ModelKind = Literal["fire", "ppe"]

@dataclass
class Detection:
    label: str
    conf: float
    bbox: list[float]  # [x1,y1,x2,y2]

class YoloService:
    def __init__(self, fire_path: str, ppe_path: str):
        self.fire = YOLO(fire_path) if fire_path else None
        self.ppe  = YOLO(ppe_path) if ppe_path else None

    def _run(self, model: YOLO, img_bgr: np.ndarray) -> tuple[list[Detection], np.ndarray]:
        r = model.predict(source=img_bgr, imgsz=640, verbose=False)[0]
        names = model.names if hasattr(model, "names") else r.names
        dets: list[Detection] = []
        if r.boxes is not None:
            for b in r.boxes:
                x1, y1, x2, y2 = b.xyxy[0].tolist()
                conf = float(b.conf[0])
                cls  = int(b.cls[0])
                dets.append(Detection(label=str(names[cls]), conf=conf, bbox=[x1,y1,x2,y2]))
        annotated = r.plot()  # BGR ndarray
        return dets, annotated

    def infer(self, img_bytes: bytes, kind: ModelKind | Literal["both"] = "both"):
        arr = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)  # BGR
        out = {}
        if kind in ("fire", "both") and self.fire:
            dets, ann = self._run(self.fire, img)
            out["fire"] = {"detections": dets, "annotated": ann}
        if kind in ("ppe", "both") and self.ppe:
            dets, ann = self._run(self.ppe, img)
            out["ppe"] = {"detections": dets, "annotated": ann}
        return out
