from fastapi import FastAPI

app = FastAPI(title="Safety Risk Detection API")

@app.get("/health")
def health():
    return {"ok": True}
