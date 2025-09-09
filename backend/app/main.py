from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db import Base, engine
from pathlib import Path

# 모델이 메타데이터에 등록되도록 import
from .models import user as _user   # noqa
from .models import post as _post   # 추가 (Post, Comment 등록)

from .routers import auth
from .routers import post
from .routers import detect

app = FastAPI(title="Safety Risk Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=getattr(settings, "allow_origins_list", settings.ALLOW_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 최초 실행 시 테이블 생성(MVP)
Base.metadata.create_all(bind=engine)

# 정적 업로드 서빙
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# 라우터 등록 (파일 만들면 주석 해제)
# from .routers import predict_csv, predict_image, stream
# app.include_router(predict_csv.router, prefix="/api")
# app.include_router(predict_image.router, prefix="/api")
# app.include_router(stream.router, prefix="/api")
app.include_router(auth.router)
app.include_router(post.router)
app.include_router(detect.router)

@app.get("/health")
def health():
    return {"ok": True}
