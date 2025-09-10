# backend/app/utils/model_loader.py
import os
from functools import lru_cache
from pathlib import Path
from ultralytics import YOLO

try:
    # 선택: python-dotenv가 있을 때 .env도 읽도록
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass

@lru_cache()
def get_model() -> YOLO:
    """
    모델 경로는 우선순위:
    1) 환경변수 PPE_MODEL_PATH
    2) backend/app/models/best.pt (기본)
    """
    default_model = Path(r"E:/safety-risk-detection/backend/models/best.pt")
    model_path = os.getenv("PPE_MODEL_PATH", str(default_model))

    p = Path(model_path)
    if not p.exists():
        raise FileNotFoundError(f"Model file not found: {p}")

    return YOLO(str(p))
