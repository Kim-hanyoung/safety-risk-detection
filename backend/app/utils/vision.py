# backend/app/utils/vision.py
from __future__ import annotations

from ultralytics import YOLO
from dataclasses import dataclass
from typing import Literal, Optional, Union, Tuple, Dict, List, Any
import numpy as np
import cv2
import json
import os

ModelKind = Literal["fire", "ppe"]


@dataclass
class Detection:
    label: str
    conf: float
    bbox: list[float]  # [x1, y1, x2, y2] in pixels (xyxy)


def _load_labels(json_path: Optional[str]) -> dict:
    """
    라벨/임계치 메타 로더
      허용 형태:
        1) {"names": {"0":"smoke","1":"fire"}, "thresholds":{"default":0.25,"fire":0.2}}
        2) {"0":"smoke","1":"fire"}
        3) ["smoke","fire"]
    반환: {"names": dict|None, "thresholds": dict}
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
        if all(str(k).isdigit() for k in data.keys()):
            names = {str(k): v for k, v in data.items()}
        else:
            names = None  # 예상치 못한 포맷이면 모델 내장 names를 사용
    elif isinstance(data, list):
        names = {str(i): v for i, v in enumerate(data)}

    return {"names": names, "thresholds": thresholds}


def _decode_image(img: Union[bytes, np.ndarray]) -> np.ndarray:
    """
    bytes(JPEG/PNG) 또는 BGR ndarray 모두 허용해서 BGR ndarray로 반환.
    """
    if isinstance(img, (bytes, bytearray, memoryview)):
        arr = np.frombuffer(img, np.uint8)
        im = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    elif isinstance(img, np.ndarray):
        im = img
    else:
        raise TypeError(f"Unsupported image type: {type(img)}")

    if im is None:
        raise ValueError("image decode failed")
    return im


class YoloService:
    def __init__(
        self,
        fire_path: Optional[str],
        ppe_path: Optional[str],
        fire_labels_json: Optional[str] = None,
        ppe_labels_json: Optional[str] = None,
        default_conf: float = 0.25,
    ):
        """
        fire_path/ppe_path는 없을 수도 있음(None/빈문자열).
        """
        self.default_conf = float(default_conf)

        self.fire = YOLO(fire_path) if fire_path else None
        self.ppe  = YOLO(ppe_path)  if ppe_path  else None

        # 디버그 가시성용 필드
        self.fire_weights = fire_path
        self.ppe_weights  = ppe_path

        self.fire_meta = _load_labels(fire_labels_json)
        self.ppe_meta  = _load_labels(ppe_labels_json)

    # --- 내부 실행: 한 모델에 대해 예측 + per-class 임계치 필터링 ---
    def _run(self, model: YOLO, img_bgr: np.ndarray, meta: dict) -> Tuple[List[Detection], np.ndarray]:
        # YOLO는 BGR ndarray 입력 가능
        res = model.predict(source=img_bgr, imgsz=640, verbose=False)[0]

        # 모델 내장 names 우선, 메타 names가 있으면 override
        model_names = getattr(model, "names", None) or getattr(res, "names", None) or {}
        custom_names = meta.get("names") or {}
        thresholds = meta.get("thresholds") or {}

        def label_of(cls_idx: int) -> str:
            # 커스텀 라벨 매핑 우선
            return custom_names.get(str(cls_idx)) or model_names.get(int(cls_idx), str(cls_idx))

        dets: List[Detection] = []
        if res.boxes is not None:
            for b in res.boxes:
                x1, y1, x2, y2 = b.xyxy[0].tolist()
                conf = float(b.conf[0])
                cls  = int(b.cls[0])
                label = str(label_of(cls))

                # per-class threshold (없으면 default → service default_conf)
                thr = float(thresholds.get(label, thresholds.get("default", self.default_conf)))
                if conf < thr:
                    continue

                dets.append(Detection(label=label, conf=conf, bbox=[x1, y1, x2, y2]))

        annotated = res.plot()  # BGR annotated frame
        return dets, annotated

    # --- 공개 API: bytes/ndarray 상관없이 추론 ---
    def infer(
        self,
        img: Union[bytes, np.ndarray],
        kind: Literal["fire", "ppe", "both"] = "both",
    ) -> Dict[str, Dict[str, Any]]:
        """
        반환:
          {
            "fire": {"detections":[Detection...], "annotated": np.ndarray(BGR)},
            "ppe":  {"detections":[Detection...], "annotated": np.ndarray(BGR)}
          }
        둘 중 하나만 요청되면 해당 키만 존재.
        """
        img_bgr = _decode_image(img)
        out: Dict[str, Dict[str, Any]] = {}

        k = (kind or "both").lower()

        if k in ("fire", "both") and self.fire is not None:
            dets, ann = self._run(self.fire, img_bgr, self.fire_meta)
            out["fire"] = {"detections": dets, "annotated": ann}

        if k in ("ppe", "both") and self.ppe is not None:
            dets, ann = self._run(self.ppe, img_bgr, self.ppe_meta)
            out["ppe"] = {"detections": dets, "annotated": ann}

        return out
