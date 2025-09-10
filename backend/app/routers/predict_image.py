# backend/app/routers/predict_image.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from collections import Counter
from PIL import Image
import io, os, logging

from ..utils.model_loader import get_model

# ------------ 설정/로깅 ------------
from dotenv import load_dotenv  # type: ignore
load_dotenv()

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("predict_image")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
USE_GEMINI = bool(GEMINI_API_KEY)
if USE_GEMINI:
    try:
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_MODEL = genai.GenerativeModel("gemini-1.5-flash")
        log.info("Gemini enabled.")
    except Exception as e:
        USE_GEMINI = False
        GEMINI_MODEL = None  # type: ignore
        log.error(f"Gemini init failed: {e}")
else:
    GEMINI_MODEL = None  # type: ignore
    log.info("Gemini disabled (GEMINI_API_KEY not set).")

# ------------ 스키마 ------------
class Item(BaseModel):
    label: str
    severity: str    # "low" | "medium" | "high"
    description: str

class AnalyzeResponse(BaseModel):
    items: List[Item]
    llm_summary: Optional[str] = None

# ------------ 유틸/맵 ------------
def _norm(label: str) -> str:
    return label.strip().lower().replace("_", "-").replace(" ", "-")

SEVERITY_MAP = {
    "no-helmet": "high",
    "no-hardhat": "high",
    "no-vest": "medium",
    "person-fall": "high",
    "intrusion": "high",
    "blocked-path": "medium",
    "helmet": "low",
    "hardhat": "low",
    "vest": "low",
    "mask": "low",
    "no-mask": "medium",
    "person": "medium",
}

# ------------ 엔드포인트 ------------
router = APIRouter()

@router.post("/image/analyze", response_model=AnalyzeResponse)
async def analyze_image(file: UploadFile = File(...)) -> AnalyzeResponse:
    # 1) 이미지 로드
    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    # 2) YOLO 추론
    model = get_model()
    results = model.predict(image, conf=0.25, verbose=False)
    r = results[0]
    names = r.names  # {id: name}

    items: list[Item] = []
    norms: list[str] = []

    if getattr(r, "boxes", None) is not None and len(r.boxes) > 0:
        for b in r.boxes:
            cls_id = int(b.cls.item())
            conf = float(b.conf.item())
            raw_label = names.get(cls_id, f"class_{cls_id}")
            key = _norm(raw_label)
            norms.append(key)
            severity = SEVERITY_MAP.get(key, "medium")
            items.append(Item(
                label=raw_label,
                severity=severity,
                description=f"Detected '{raw_label}' (conf {conf:.2f})"
            ))
    else:
        items.append(Item(
            label="No findings",
            severity="low",
            description="No hazards detected above the threshold."
        ))

    # 3) PPE 집계 (안전모/마스크)
    cnt = Counter(norms)
    person = cnt.get("person", 0)
    hardhat_worn = cnt.get("hardhat", 0) + cnt.get("helmet", 0)
    hardhat_miss_explicit = cnt.get("no-hardhat", 0) + cnt.get("no-helmet", 0)
    hardhat_missing = hardhat_miss_explicit if hardhat_miss_explicit > 0 else max(person - hardhat_worn, 0)
    mask_missing = cnt.get("no-mask", 0)

    # 4) LLM 요약 (한국어) — 실패/비활성 시 이유가 summary에 담기게 함
    llm_summary: Optional[str]
    if USE_GEMINI and GEMINI_MODEL is not None:
        try:
            prompt = f"""
너는 산업안전 담당자다. 아래 디텍션을 바탕으로
- PPE(안전모/마스크) 착용 현황을 인원수 기준으로 간결히 보고하고,
- 주요 위험요인과 권장 조치를 2~3개 bullet로 제시하라.
- 불확실한 값은 '추정'이라고 표기하라.
- 한국어, 최대 6줄.

[요약 수치]
- 인원수: {person}
- 안전모 착용: {hardhat_worn}명
- 안전모 미착용(추정): {hardhat_missing}명
- 마스크 미착용: {mask_missing}명
"""
            resp = GEMINI_MODEL.generate_content(prompt)  # type: ignore
            text = getattr(resp, "text", None)
            llm_summary = text.strip() if text else "(LLM summary empty)"
        except Exception as e:
            log.error(f"Gemini generation failed: {e}")
            llm_summary = f"(LLM summary unavailable: {e})"
    else:
        llm_summary = "(LLM disabled: set GEMINI_API_KEY in environment)"

    return AnalyzeResponse(items=items, llm_summary=llm_summary)
