import asyncio, base64, cv2, numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..utils.vision import YoloService
from ..core.config import settings
from .detect import compute_risk, get_service
from ..models.alert import Alert

router = APIRouter(prefix="/stream", tags=["stream"])

clients: set[WebSocket] = set()
_stop = asyncio.Event()
_state = {"url": None, "kind": "both"}  # 현재 실행중인 소스

# 시청자(브라우저)로 주석 프레임/알림 브로드캐스트
watchers: set[WebSocket] = set()

async def _broadcast(msg: dict):
    dead = []
    for ws in list(watchers):
        try:
            await ws.send_json(msg)
        except Exception:
            dead.append(ws)
    for ws in dead:
        watchers.discard(ws)

@router.post("/start")
async def start_stream(url: str, kind: str = "both"):
    _state["url"] = url; _state["kind"] = kind
    _stop.clear()
    asyncio.create_task(_loop())  # 백그라운드 시작
    return {"ok": True}

@router.post("/stop")
async def stop_stream():
    _stop.set()
    return {"ok": True}

@router.websocket("/ws")
async def ws_watch(ws: WebSocket):
    await ws.accept()
    watchers.add(ws)
    try:
        while True:
            await ws.receive_text()  # 클라 ping 등
    except WebSocketDisconnect:
        watchers.discard(ws)

# ⬇⬇ iPhone/브라우저가 프레임을 푸시하는 엔드포인트
@router.websocket("/push")
async def ws_push(ws: WebSocket, db: Session = Depends(get_db)):
    await ws.accept()
    svc: YoloService = get_service()
    try:
        while True:
            msg = await ws.receive()

            # 브라우저에서 보낸 JPEG 바이너리 프레임 받기
            data = msg.get("bytes")
            if not data:
                continue
            buf = np.frombuffer(data, dtype=np.uint8)
            img = cv2.imdecode(buf, cv2.IMREAD_COLOR)
            if img is None:
                continue

            # 추론
            out = svc.infer(img, kind="both")
            detections = []
            annotated = img
            for k in ("fire", "ppe"):
                if k in out:
                    detections += [
                        {"label": d.label, "conf": float(d.conf), "bbox": [float(x) for x in d.bbox]}
                        for d in out[k]["detections"]
                    ]
                    annotated = out[k]["annotated"]  # 마지막 주석본 사용

            risk = compute_risk(detections)

            # 주석 프레임 인코딩 후 브로드캐스트(시청자들에게)
            ok, jpg = cv2.imencode(".jpg", annotated)
            if ok:
                b64 = base64.b64encode(jpg.tobytes()).decode()
                payload = {
                    "type": "frame",
                    "image": "data:image/jpeg;base64," + b64,
                    "detections": detections,
                    "risk": risk,
                }
                await _broadcast(payload)
                # 푸시한 본인에게도 회신(선택)
                await ws.send_json(payload)

            # 위험 알림(간단 임계치)
            if risk["level"] in ("High", "Critical"):
                await _broadcast({
                    "type": "alert",
                    "severity": risk["level"],
                    "message": "실시간 위험 감지",
                    "risk": risk,
                    "detections": detections
                })

    except WebSocketDisconnect:
        pass

async def _loop():
    svc: YoloService = get_service()
    url = _state["url"]; kind = _state["kind"]
    if not url: return
    cap = cv2.VideoCapture(url)
    if not cap.isOpened():
        await _broadcast({"type":"error","message":"cannot open stream"})
        return

    # 간단히 5~10 FPS 근처
    while not _stop.is_set():
        ok, frame = cap.read()
        if not ok:
            await asyncio.sleep(0.2); continue
        try:
            out = svc.infer(frame, kind=kind)
            detections = []
            annotated = None
            for k in ("fire","ppe"):
                if k in out:
                    detections += [
                        {"label": d.label, "conf": float(d.conf), "bbox": [float(x) for x in d.bbox]}
                        for d in out[k]["detections"]
                    ]
                    annotated = out[k]["annotated"]  # 마지막 주석본 사용

            # 프레임 인코딩
            view = annotated if annotated is not None else frame
            ok, jpg = cv2.imencode(".jpg", view)
            if not ok: continue
            b64 = base64.b64encode(jpg.tobytes()).decode()

            risk = compute_risk(detections)

            # 위험 임계치면 알림 브로드캐스트(+DB 저장)
            if risk["level"] in ("High","Critical"):
                await _broadcast({"type":"alert","severity":risk["level"],"message":"위험 감지","risk":risk,"detections":detections})

            await _broadcast({
                "type":"frame",
                "image":"data:image/jpeg;base64,"+b64,
                "detections":detections,
                "risk":risk
            })
        except Exception as e:
            await _broadcast({"type":"error","message":str(e)})
        await asyncio.sleep(0.1)  # ~10 FPS
    cap.release()
