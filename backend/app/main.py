from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Safety Risk Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .routers import predict_image
app.include_router(predict_image.router, prefix="/api")


# 라우터 등록 (파일 만들면 주석 해제)
# from .routers import predict_csv, predict_image, stream
# app.include_router(predict_csv.router, prefix="/api")
# app.include_router(predict_image.router, prefix="/api")
# app.include_router(stream.router, prefix="/api")

@app.get("/health")
def health():
    return {"ok": True}

