from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Request
from pathlib import Path
from ..core.config import settings
from ..utils.vision import YoloService
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.post import Post
from datetime import datetime
import cv2, uuid, json, numpy as np
import logging

router = APIRouter(prefix="/detect", tags=["detect"])
log = logging.getLogger("app.detect")

# Service singleton
_service: YoloService | None = None
def get_service() -> YoloService:
    global _service
    if _service is None:
        # ✅ 가중치 존재 여부 선점 검증
        def _must_exist(p: str|None, name: str):
            if p and not Path(p).exists():
                raise RuntimeError(f"{name} weights not found: {p}")
        _must_exist(settings.YOLO_FIRE_SMOKE_WEIGHTS, "Fire/Smoke")
        _must_exist(settings.YOLO_PPE_WEIGHTS, "PPE")

        _service = YoloService(
            settings.YOLO_FIRE_SMOKE_WEIGHTS,
            settings.YOLO_PPE_WEIGHTS,
            fire_labels_json=getattr(settings, "YOLO_FIRE_SMOKE_LABELS_JSON", ""),
            ppe_labels_json=getattr(settings, "YOLO_PPE_LABELS_JSON", ""),
            default_conf=getattr(settings, "YOLO_DEFAULT_CONF", 0.25),
        )
    return _service

def _ensure_dirs(base: Path) -> None:
    (base / "orig").mkdir(parents=True, exist_ok=True)
    (base / "annot").mkdir(parents=True, exist_ok=True)

@router.post("/image", response_model=dict)
async def detect_image(
    file: UploadFile = File(...),
    model: str = Form("both"),            # "fire" | "ppe" | "both" | (허용: "fire/smoke")
    publish: bool = Form(False),
    title: str | None = Form(None),
    db: Session = Depends(get_db),
):
    svc = get_service()

    # ✅ 모델 옵션 정규화
    model = (model or "both").strip().lower()
    if model == "fire/smoke":
        model = "fire"
    if model not in ("fire", "ppe", "both"):
        model = "both"

    # ✅ 파일 읽기 + 이미지 파싱
    raw = await file.read()
    if not raw:
        raise HTTPException(400, "empty file")
    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(400, "unsupported image (try jpg/png); jfif는 jpg로 다시 저장 권장")

    # ✅ 업로드 경로 준비/원본 저장
    base = Path(settings.UPLOAD_DIR)
    _ensure_dirs(base)
    ext = (file.filename or "upload.jpg").split(".")[-1].lower()
    if ext == "jfif":
        ext = "jpg"  # 내부적으로 jpg로 취급
    stem = uuid.uuid4().hex
    orig_path = base / "orig" / f"{stem}.{ext}"
    with open(orig_path, "wb") as f:
        f.write(raw)

    detections = []
    annotated_urls = {}

    try:
        # ✅ 모델 존재 검증 (가중치 미설정/경로오류 시 친절 메시지)
        if model in ("fire", "both"):
            if not svc.fire:
                raise HTTPException(500, f"Fire/Smoke model not loaded. Check YOLO_FIRE_SMOKE_WEIGHTS in .env")
        if model in ("ppe", "both"):
            if not svc.ppe:
                raise HTTPException(500, f"PPE model not loaded. Check YOLO_PPE_WEIGHTS in .env")

        out = svc.infer(raw, kind=model)

        # ✅ 주석 이미지 저장
        for key in ("fire", "ppe"):
            if key in out:
                dets = [ {"label": d.label, "conf": float(d.conf), "bbox": [float(x) for x in d.bbox]} for d in out[key]["detections"] ]
                detections.extend(dets)
                ann = out[key]["annotated"]  # BGR ndarray
                ann_path = base / "annot" / f"{stem}_{key}.jpg"
                cv2.imwrite(str(ann_path), ann)
                annotated_urls[key] = f"/uploads/annot/{ann_path.name}"

    except HTTPException:
        raise
    except Exception as e:
        log.exception("detect failed")
        raise HTTPException(500, f"detect failed: {e!s}")

    resp = {
        "ok": True,
        "original_url": f"/uploads/orig/{orig_path.name}",
        "annotated": annotated_urls,
        "detections": detections,
        "model": model,
    }

    # (선택) publish 기능은 나중에 다시 켜도 됩니다. 지금은 비활성화 원하면 주석 처리하세요.
    # if publish:
    #     ...

    return resp
