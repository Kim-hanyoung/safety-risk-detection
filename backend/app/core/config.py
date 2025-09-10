# backend/app/core/config.py
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    JWT_SECRET: str = "dev_secret_change_me"
    DATABASE_URL: str = "sqlite:///./app.db"
    ALLOW_ORIGINS: List[str] = ["http://localhost:5173"]
    TABLEAU_URL: str = ""
    GEMINI_API_KEY: str = ""
    UPLOAD_DIR: str = "uploads"

    YOLO_FIRE_SMOKE_WEIGHTS: str = "weights/firesomkebest.pt"  
    YOLO_PPE_WEIGHTS: str = "weights/ppebest.pt"    

    YOLO_FIRE_SMOKE_LABELS_JSON: str = "weights/firesmokelabels.json"
    YOLO_PPE_LABELS_JSON: str = "weight/ppelabels.json"    
        
    # (선택) 기본 임계치
    YOLO_DEFAULT_CONF: float = 0.25

    # .env 자동 로드
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # ALLOW_ORIGINS를 콤마 구분 문자열로도 받을 수 있게 처리
    @field_validator("ALLOW_ORIGINS", mode="before")
    @classmethod
    def split_origins(cls, v):
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        return v

settings = Settings()
