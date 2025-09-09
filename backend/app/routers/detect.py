from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi import BackgroundTasks
from pathlib import Path
from ..core.config import settings
from ..utils.vision import YoloService
from ..core.security import current_sub
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.post import Post
from datetime import datetime
import cv2
import uuid
import os
import json

router = APIRouter(prefix="/detect", tags=["detect"])

# Service singleton
_service: YoloService | None = None
def get_service() -> YoloService:
    global _service
    if _service is None:
        _service = YoloService(settings.YOLO_FIRE_SMOKE_WEIGHTS, settings.YOLO_PPE_WEIGHTS)
    return _service

def _ensure_dirs() -> Path:
    root = Path(settings.UPLOAD_DIR)
    (root / "orig").mkdir(parents=True, exist_ok=True)
    (root / "annot").mkdir(parents=True, exist_ok=True)
    return root

def _save_image_bytes(img_bytes: bytes, suffix: str = "jpg") -> Path:
    root = _ensure_dirs()
    name = f"{uuid.uuid4().hex}.{suffix}"
    p = root / "orig" / name
    with open(p, "wb") as f: f.write(img_bytes)
    return p

def _save_annot(ann_img, stem: str) -> Path:
    root = _ensure_dirs()
    p = root / "annot" / f"{stem}.jpg"
    cv2.imwrite(str(p), ann_img)   # ann_img is BGR ndarray
    return p

def _summarize(dets: list[dict]) -> str:
    if not dets: return "- No detections"
    # label별 카운트
    from collections import Counter
    c = Counter([d["label"] for d in dets])
    lines = [f"- {lbl}: {cnt}" for lbl, cnt in c.most_common()]
    return "\n".join(lines)

@router.post("/image", response_model=dict)
async def detect_image(
    file: UploadFile = File(...),
    model: str = Form("both"),             # fire | ppe | both
    publish: bool = Form(False),
    title: str | None = Form(None),
    db: Session = Depends(get_db),
    sub: str | None = Depends(lambda: None)  # 토큰 없으면 None 허용 (publish만 보호)
):
    if publish and sub is None:
        # 보호: publish=true면 인증 필요
        sub = current_sub()  # raise 401

    svc = get_service()
    img_bytes = await file.read()

    # 저장 원본
    orig_path = _save_image_bytes(img_bytes, (file.filename or "upload.jpg").split(".")[-1])
    stem = orig_path.stem

    # 추론
    out = svc.infer(img_bytes, kind=model if model in ("fire","ppe","both") else "both")

    # 결과 수집 + 주석 이미지 저장
    det_all = []
    ann_urls = {}
    for key in ["fire","ppe"]:
        if key in out:
            dets = [ {"label": d.label, "conf": d.conf, "bbox": d.bbox} for d in out[key]["detections"] ]
            det_all.extend(dets)
            ann_path = _save_annot(out[key]["annotated"], f"{stem}_{key}")
            ann_urls[key] = f"/uploads/annot/{ann_path.name}"

    resp = {
        "ok": True,
        "original_url": f"/uploads/orig/{orig_path.name}",
        "annotated": ann_urls,         # { fire: url, ppe: url }
        "detections": det_all,         # list of {label, conf, bbox}
        "model": model,
    }

    if publish:
        # 게시글 자동 생성
        from ..models.user import User
        user = db.query(User).get(sub)
        if not user: raise HTTPException(404, "User not found")
        _title = title or f"Image analysis {datetime.now():%Y-%m-%d %H:%M}"
        summary = _summarize(resp["detections"])
        content_md = f"## Detection Summary\n{summary}\n\n" \
                     f"**Model**: {model}\n\n" \
                     f"**Original:** {resp['original_url']}\n\n" \
                     + "\n".join([f"**{k.upper()} Annotated:** {v}" for k,v in ann_urls.items()])

        p = Post(
            author_id=user.id,
            category="reports",
            title=_title,
            content_md=content_md,
            meta={
                "original_url": resp["original_url"],
                "annotated": ann_urls,
                "detections": resp["detections"],
                "model": model,
            },
        )
        db.add(p); db.commit(); db.refresh(p)
        resp["post_id"] = p.id

    return resp
