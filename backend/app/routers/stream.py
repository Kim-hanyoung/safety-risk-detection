import asyncio
import base64
import re
from typing import Dict, List, Optional

import cv2
import numpy as np
from fastapi import (
    APIRouter, WebSocket, WebSocketDisconnect,
    Depends, HTTPException, Body
)
from pydantic import BaseModel

from ..db import get_db
from ..utils.vision import YoloService
from ..core.config import settings
from .detect import compute_risk, get_service  # 이미 detect.py에 구현된 함수 재사용

router = APIRouter(prefix="/stream", tags=["stream"])

# -------------------------------------------------------------------
# WebSocket 시청자 관리 (브로드캐스트)
# -------------------------------------------------------------------
watchers: set[WebSocket] = set()

async def _broadcast(msg: dict) -> None:
    dead: List[WebSocket] = []
    for ws in list(watchers):
        try:
            await ws.send_json(msg)
        except Exception:
            dead.append(ws)
    for ws in dead:
        watchers.discard(ws)

@router.websocket("/ws")
async def ws_watch(ws: WebSocket):
    await ws.accept()
    watchers.add(ws)
    try:
        # 시청자는 서버가 보내는 프레임을 받기만 해도 되지만,
        # 연결을 유지하기 위해 ping 텍스트를 기다리도록 둔다.
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        watchers.discard(ws)

# -------------------------------------------------------------------
# IP 카메라 Pull 루프
# -------------------------------------------------------------------
class StartBody(BaseModel):
    url: str
    kind: str = "both"  # "fire" | "ppe" | "both" | "fire/smoke"

_stop = asyncio.Event()
_state: dict = {"url": None, "kind": "both"}

@router.post("/start")
async def start_stream(body: StartBody):
    _state["url"] = body.url
    _state["kind"] = "fire" if body.kind.lower() == "fire/smoke" else body.kind.lower()
    _stop.clear()
    asyncio.create_task(_pull_loop())
    return {"ok": True}

@router.post("/stop")
async def stop_stream():
    _stop.set()
    return {"ok": True}

async def _pull_loop():
    svc: YoloService = get_service()
    url: Optional[str] = _state.get("url")
    kind: str = _state.get("kind", "both")
    if not url:
        return

    cap = cv2.VideoCapture(url)
    if not cap.isOpened():
        await _broadcast({"type": "error", "message": "cannot open stream"})
        return

    # 대략 10fps
    try:
        while not _stop.is_set():
            ok, frame = cap.read()
            if not ok:
                await asyncio.sleep(0.2)
                continue

            try:
                # 추론
                out = svc.infer(frame, kind=kind)
                detections: List[dict] = []
                annotated = None
                for k in ("fire", "ppe"):
                    if k in out:
                        dets = out[k]["detections"]
                        detections.extend([
                            {"label": d.label, "conf": float(d.conf), "bbox": [float(x) for x in d.bbox]}
                            for d in dets
                        ])
                        annotated = out[k]["annotated"]  # 마지막 주석 프레임 사용

                view = annotated if annotated is not None else frame

                ok2, jpg = cv2.imencode(".jpg", view)
                if not ok2:
                    continue
                data_url = "data:image/jpeg;base64," + base64.b64encode(jpg.tobytes()).decode()

                risk = compute_risk(detections)

                # 위험 알림
                if risk["level"] in ("High", "Critical"):
                    await _broadcast({
                        "type": "alert",
                        "severity": risk["level"],
                        "message": "위험 감지",
                        "risk": risk,
                        "detections": detections
                    })

                # 프레임 브로드캐스트
                await _broadcast({
                    "type": "frame",
                    "image": data_url,
                    "detections": detections,
                    "risk": risk,
                })
            except Exception as e:
                await _broadcast({"type": "error", "message": str(e)})

            await asyncio.sleep(0.1)
    finally:
        cap.release()

# -------------------------------------------------------------------
# 모바일 Push (HTTP: dataURL JPEG)
#   - 내가 제공한 MobileStream.tsx는 이 엔드포인트를 호출합니다.
#   - 이미지: "data:image/jpeg;base64,...."
# -------------------------------------------------------------------
_dataurl_re = re.compile(r"^data:image\/jpeg;base64,(.+)$", re.I)

class PushBody(BaseModel):
    image: str                 # dataURL
    kind: str = "both"         # "fire" | "ppe" | "both" | "fire/smoke"

@router.post("/push")
async def push_frame_http(body: PushBody, db=Depends(get_db)):
    svc: YoloService = get_service()
    kind = "fire" if body.kind.lower() == "fire/smoke" else body.kind.lower()

    m = _dataurl_re.match(body.image or "")
    if not m:
        raise HTTPException(400, "invalid dataURL")

    b = base64.b64decode(m.group(1))
    arr = np.frombuffer(b, np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(400, "decode failed")

    out = svc.infer(frame, kind=kind)

    detections: List[dict] = []
    annotated = frame
    for k in ("fire", "ppe"):
        if k in out:
            dets = out[k]["detections"]
            detections.extend([
                {"label": d.label, "conf": float(d.conf), "bbox": [float(x) for x in d.bbox]}
                for d in dets
            ])
            annotated = out[k]["annotated"]

    risk = compute_risk(detections)

    ok, jpg = cv2.imencode(".jpg", annotated)
    if not ok:
        raise HTTPException(500, "encode failed")
    data_url = "data:image/jpeg;base64," + base64.b64encode(jpg.tobytes()).decode()

    # 시청자에게 브로드캐스트
    await _broadcast({"type": "frame", "image": data_url, "detections": detections, "risk": risk})
    if risk["level"] in ("High", "Critical"):
        await _broadcast({"type": "alert", "severity": risk["level"], "message": "실시간 위험 감지", "risk": risk})

    return {"ok": True, "risk": risk}

# -------------------------------------------------------------------
# 모바일 Push (WebSocket: 바이너리 JPEG)  *선택*
#   - 고성능이 필요할 때 사용. 클라이언트가 바이너리 프레임을 ws로 보냄.
# -------------------------------------------------------------------
@router.websocket("/push-ws")
async def ws_push(ws: WebSocket):
    await ws.accept()
    svc: YoloService = get_service()
    try:
        while True:
            msg = await ws.receive()
            data = msg.get("bytes")
            if not data:
                continue

            arr = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if frame is None:
                continue

            out = svc.infer(frame, kind="both")

            detections: List[dict] = []
            annotated = frame
            for k in ("fire", "ppe"):
                if k in out:
                    dets = out[k]["detections"]
                    detections.extend([
                        {"label": d.label, "conf": float(d.conf), "bbox": [float(x) for x in d.bbox]}
                        for d in dets
                    ])
                    annotated = out[k]["annotated"]

            risk = compute_risk(detections)

            ok, jpg = cv2.imencode(".jpg", annotated)
            if not ok:
                continue
            data_url = "data:image/jpeg;base64," + base64.b64encode(jpg.tobytes()).decode()

            payload = {"type": "frame", "image": data_url, "detections": detections, "risk": risk}
            await _broadcast(payload)  # 시청자들에게
            await ws.send_json(payload)  # 푸시 보낸 본인에게 회신(선택)

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
