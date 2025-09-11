from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
from datetime import datetime
import uuid
import logging
import numpy as np
import cv2
import os

from ..db import get_db
from ..core.config import settings
from ..core.security import current_sub
from ..utils.vision import YoloService
from ..models.user import User
from ..models.post import Post
from ..services.llm import generate_report_md  # LLM 보고서

router = APIRouter(prefix="/detect", tags=["detect"])
log = logging.getLogger("app.detect")

UPLOAD_BASE = Path(settings.UPLOAD_DIR)

# -----------------------------
# YOLO Service singleton
# -----------------------------
_service: YoloService | None = None

def get_service() -> YoloService:
    """Load YOLO models once and reuse."""
    global _service
    if _service is None:
        def _must_exist(p: str | None, name: str):
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

def ensure_dirs() -> None:
    (UPLOAD_BASE / "orig").mkdir(parents=True, exist_ok=True)
    (UPLOAD_BASE / "annot").mkdir(parents=True, exist_ok=True)

def compute_risk(detections: list[dict]) -> dict:
    """간단 규칙 기반 위험도 산정"""
    labels = [d["label"].lower() for d in detections]
    score = 0
    if any("fire" in l for l in labels):   # 화재
        score += 40
    if any("smoke" in l for l in labels):  # 연기
        score += 20
    score += 10 * sum(1 for l in labels if l.startswith("no-"))  # PPE 미착용

    if score >= 60:
        level = "Critical"
    elif score >= 30:
        level = "High"
    elif score > 0:
        level = "Warning"
    else:
        level = "Normal"
    return {"score": score, "level": level}

@router.post("/image", response_model=dict)
async def detect_image(
    file: UploadFile = File(...),
    model: str = Form("both"),           # "fire" | "ppe" | "both" | "fire/smoke"
    publish: bool = Form(False),
    title: str | None = Form(None),
    db: Session = Depends(get_db),
    sub: str = Depends(current_sub),
):
    svc = get_service()

    # 모델 옵션 정규화
    model = (model or "both").strip().lower()
    if model == "fire/smoke":
        model = "fire"
    if model not in ("fire", "ppe", "both"):
        model = "both"

    # 파일 읽기
    raw = await file.read()
    if not raw:
        raise HTTPException(400, "empty file")

    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(400, "unsupported image (try jpg/png). jfif는 jpg로 저장 권장")

    # 저장 경로
    ensure_dirs()
    ext = (file.filename or "upload.jpg").split(".")[-1].lower()
    if ext == "jfif":
        ext = "jpg"
    stem = uuid.uuid4().hex
    orig_path = UPLOAD_BASE / "orig" / f"{stem}.{ext}"
    with open(orig_path, "wb") as f:
        f.write(raw)

    detections: list[dict] = []
    annotated_urls: dict[str, str] = {}

    # 추론
    try:
        if model in ("fire", "both") and not svc.fire:
            raise HTTPException(500, "Fire/Smoke model not loaded. Check YOLO_FIRE_SMOKE_WEIGHTS")
        if model in ("ppe", "both") and not svc.ppe:
            raise HTTPException(500, "PPE model not loaded. Check YOLO_PPE_WEIGHTS")

        out = svc.infer(raw, kind=model)

        for key in ("fire", "ppe"):
            if key in out:
                dets = [
                    {"label": d.label, "conf": float(d.conf), "bbox": [float(x) for x in d.bbox]}
                    for d in out[key]["detections"]
                ]
                detections.extend(dets)
                ann = out[key]["annotated"]  # BGR ndarray
                ann_path = UPLOAD_BASE / "annot" / f"{stem}_{key}.jpg"
                cv2.imwrite(str(ann_path), ann)
                annotated_urls[key] = f"/uploads/annot/{ann_path.name}"
    except HTTPException:
        raise
    except Exception as e:
        log.exception("detect failed")
        raise HTTPException(500, f"detect failed: {e!s}")

    risk = compute_risk(detections)

    # 응답 공통
    resp = {
        "ok": True,
        "original_url": f"/uploads/orig/{orig_path.name}",
        "annotated": annotated_urls,
        "detections": detections,
        "model": model,
        "risk": risk,
    }

    # 게시(LLM 리포트)
    if publish:
        user = db.query(User).get(sub)
        if not user:
            raise HTTPException(404, "User not found")

        md = None
        llm_used = False
        llm_error = None
        try:
            md = generate_report_md(detections, resp, lang="ko")
            llm_used = bool(md)
        except Exception as e:
            llm_error = str(e)
            llm_used = False

        if not md:
            from collections import Counter
            c = Counter([d["label"] for d in detections])
            summary = "\n".join([f"- {k}: {v}" for k, v in c.most_common()]) or "- No detections"
            imgs = [f"![Original]({resp['original_url']})"] + [
                f"![{k.upper()}]({v})" for k, v in (resp.get("annotated") or {}).items()
            ]
            md = f"## Detection Summary\n{summary}\n\n**Model**: {model}\n\n" + "\n".join(imgs)

        p = Post(
            author_id=user.id,
            category="reports",
            title=title or "AI 분석 리포트",
            content_md=md,
            meta={**resp, "llm": {"used": llm_used, "error": llm_error, "model": os.getenv("GEMINI_MODEL", "gemini-1.5-flash")}},
        )
        db.add(p); db.commit(); db.refresh(p)
        resp["post_id"] = p.id

    return resp

@router.get("/health", response_model=dict)
def detect_heath():
    svc = get_service()
    return {
        "fire_loaded": bool(getattr(svc, "fire", None)),
        "ppe_loaded": bool(getattr(svc, "ppe", None)),
        "fire_weights": getattr(svc, "fire_weights", None),
        "ppe_weights": getattr(svc, "ppe_weights", None),
    }