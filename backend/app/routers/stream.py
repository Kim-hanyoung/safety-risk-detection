# app/routers/stream.py
import asyncio
import base64
import re
from typing import List, Optional, Set, Tuple, Dict, Any

import cv2
import numpy as np
from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
)
from pydantic import BaseModel

from ..utils.vision import YoloService
from .detect import compute_risk, get_service  # detect.py의 유틸 재사용

router = APIRouter(prefix="/stream", tags=["stream"])

# ============================================================== 
# 시청자(WebSocket) 관리 및 브로드캐스트
# ==============================================================
watchers: Set[WebSocket] = set()

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
    """데스크톱(또는 다른 클라이언트)에서 주석 프레임을 '구독'하는 채널."""
    await ws.accept()
    watchers.add(ws)
    try:
        # 클라이언트가 보낸 ping 텍스트를 받아 연결 유지
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        watchers.discard(ws)

# ============================================================== 
# 공통 유틸: 디텍션 정규화/그리기
# ==============================================================

# ⚠️ 필요시 여기서 숨길 PPE 라벨 지정 (화면 지저분한 보조 라벨 숨김)
PPE_HIDE = {"Person", "Safety Vest", "Safety Cone", "machinery", "vehicle", "Mask", "Hardhat"}
SHOW_PPE_ONLY_WARNINGS = True  # True면 NO- 계열만 노출

FIRE_COLOR  = (255,   0,   0)  # BGR 파랑
PPE_COLOR   = (  0, 255, 255)  # BGR 노랑
DBG_COLOR   = (255, 255, 255)

def _to_dict(d: Any) -> Dict[str, Any]:
    """YOLO 결과 객체/딕셔너리를 안전하게 직렬화"""
    if isinstance(d, dict):
        label = d.get("label")
        conf  = float(d.get("conf", 0.0))
        bbox  = d.get("bbox")
    else:
        label = getattr(d, "label", None)
        conf  = float(getattr(d, "conf", 0.0))
        bbox  = getattr(d, "bbox", None)
    if isinstance(bbox, (list, tuple)):
        bbox = [float(x) for x in bbox]
    return {"label": str(label), "conf": conf, "bbox": bbox}

def _split_detections(out: Dict[str, Any]) -> Tuple[List[Dict], List[Dict]]:
    """infer 결과에서 fire/ppe 디텍션 분리"""
    fire_dets: List[Dict] = []
    ppe_dets:  List[Dict] = []

    if "fire" in out and out["fire"] and "detections" in out["fire"]:
        fire_dets = [_to_dict(d) for d in out["fire"]["detections"]]

    if "ppe" in out and out["ppe"] and "detections" in out["ppe"]:
        ppe_dets = [_to_dict(d) for d in out["ppe"]["detections"]]

    # PPE 필터링
    if SHOW_PPE_ONLY_WARNINGS:
        ppe_dets = [d for d in ppe_dets
                    if str(d["label"]).upper().startswith("NO-") and d["bbox"]]
    else:
        ppe_dets = [d for d in ppe_dets
                    if d["bbox"] and str(d["label"]) not in PPE_HIDE]

    fire_dets = [d for d in fire_dets if d["bbox"]]
    return fire_dets, ppe_dets

def _draw_boxes(img: np.ndarray, dets: List[Dict], color: Tuple[int, int, int]) -> None:
    for d in dets:
        x1, y1, x2, y2 = map(int, d["bbox"])
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
        label = f'{d["label"]} {d["conf"]:.2f}'
        cv2.putText(img, label, (x1, max(12, y1 - 6)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

def _draw_debug_hud(img: np.ndarray, fire_cnt: int, ppe_cnt: int, fire_loaded: bool, ppe_loaded: bool) -> None:
    """좌상단에 카운터/타임스탬프 찍어서 '정말로 매 프레임 바뀌는지' 육안 확인용"""
    ts = cv2.getTickCount() / cv2.getTickFrequency()
    text = f"F:{fire_cnt}  P:{ppe_cnt}  loaded(F:{int(fire_loaded)}/P:{int(ppe_loaded)})  t:{ts:.1f}"
    cv2.putText(img, text, (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, DBG_COLOR, 2)

def _render_overlay(frame: np.ndarray, fire_dets: List[Dict], ppe_dets: List[Dict],
                    fire_loaded: bool, ppe_loaded: bool) -> np.ndarray:
    """한 프레임에 fire(파랑), ppe(노랑) 겹쳐 그리기 + 디버그 HUD"""
    view = frame.copy()
    _draw_boxes(view, fire_dets, FIRE_COLOR)
    _draw_boxes(view, ppe_dets, PPE_COLOR)
    _draw_debug_hud(view, len(fire_dets), len(ppe_dets), fire_loaded, ppe_loaded)
    return view

def _encode_data_url(img_bgr: np.ndarray) -> str:
    ok, jpg = cv2.imencode(".jpg", img_bgr)
    if not ok:
        raise RuntimeError("encode failed")
    return "data:image/jpeg;base64," + base64.b64encode(jpg.tobytes()).decode()

# ✨ 핵심: both일 때 두 모델을 **명시적으로 각각** 실행해 합친다
def _infer_both_forced(svc: YoloService, frame: np.ndarray, kind: str) -> Dict[str, Any]:
    kind = (kind or "both").lower()
    result: Dict[str, Any] = {}

    if kind in ("fire", "both") and getattr(svc, "fire", None) is not None:
        try:
            o = svc.infer(frame, kind="fire")  # ndarray 직접
            if isinstance(o, dict) and "fire" in o:
                result["fire"] = o["fire"]
        except Exception:
            pass

    if kind in ("ppe", "both") and getattr(svc, "ppe", None) is not None:
        try:
            o = svc.infer(frame, kind="ppe")
            if isinstance(o, dict) and "ppe" in o:
                result["ppe"] = o["ppe"]
        except Exception:
            pass

    return result

# ============================================================== 
# IP 카메라 Pull 모드 (백그라운드 루프)
# ==============================================================
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
    """IP 카메라에서 프레임을 당겨와 추론 후 시청자에게 방송"""
    svc: YoloService = get_service()
    url: Optional[str] = _state.get("url")
    kind: str = _state.get("kind", "both")
    if not url:
        return

    cap = cv2.VideoCapture(url)
    if not cap.isOpened():
        await _broadcast({"type": "error", "message": "cannot open stream"})
        return

    fire_loaded = bool(getattr(svc, "fire", None))
    ppe_loaded  = bool(getattr(svc, "ppe", None))

    try:
        while not _stop.is_set():
            ok, frame = cap.read()
            if not ok:
                await asyncio.sleep(0.2)
                continue

            try:
                out = _infer_both_forced(svc, frame, kind)
                fire_dets, ppe_dets = _split_detections(out)
                all_dets = fire_dets + ppe_dets
                risk = compute_risk(all_dets)

                view = _render_overlay(frame, fire_dets, ppe_dets, fire_loaded, ppe_loaded)
                data_url = _encode_data_url(view)

                if risk["level"] in ("High", "Critical"):
                    await _broadcast({
                        "type": "alert",
                        "severity": risk["level"],
                        "message": "위험 감지",
                        "risk": risk,
                        "detections": all_dets,
                    })

                await _broadcast({
                    "type": "frame",
                    "image": data_url,
                    "detections": all_dets,
                    "risk": risk,
                })

            except Exception as e:
                await _broadcast({"type": "error", "message": str(e)})

            await asyncio.sleep(0.1)  # ~10 FPS
    finally:
        cap.release()

# ============================================================== 
# 모바일 Push (HTTP: dataURL JPEG) — iOS 대응용 폴백
# ==============================================================
_DATAURL_RE = re.compile(r"^data:image\/jpeg;base64,(.+)$", re.I)

class PushBody(BaseModel):
    image: str                 # "data:image/jpeg;base64,...."
    kind: str = "both"         # "fire" | "ppe" | "both" | "fire/smoke"

@router.post("/push")
async def push_frame_http(body: PushBody):
    """모바일이 dataURL(JPEG)을 HTTP POST로 푸시"""
    svc: YoloService = get_service()
    kind = "fire" if body.kind.lower() == "fire/smoke" else body.kind.lower()

    m = _DATAURL_RE.match(body.image or "")
    if not m:
        raise HTTPException(400, "invalid dataURL")

    b = base64.b64decode(m.group(1))
    arr = np.frombuffer(b, np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(400, "decode failed")

    out = _infer_both_forced(svc, frame, kind)
    fire_dets, ppe_dets = _split_detections(out)
    all_dets = fire_dets + ppe_dets
    risk = compute_risk(all_dets)

    view = _render_overlay(frame, fire_dets, ppe_dets,
                           bool(getattr(svc, "fire", None)),
                           bool(getattr(svc, "ppe", None)))
    data_url = _encode_data_url(view)

    await _broadcast({"type": "frame", "image": data_url, "detections": all_dets, "risk": risk})
    if risk["level"] in ("High", "Critical"):
        await _broadcast({"type": "alert", "severity": risk["level"], "message": "실시간 위험 감지", "risk": risk})

    return {"ok": True, "risk": risk}

# ============================================================== 
# 모바일 Push (WebSocket: 바이너리 JPEG) — 고성능
# ==============================================================
@router.websocket("/push-ws")
async def ws_push(ws: WebSocket):
    """모바일이 캔버스->JPEG 바이너리를 WebSocket으로 푸시"""
    await ws.accept()
    svc: YoloService = get_service()

    try:
        while True:
            data: bytes = await ws.receive_bytes()

            arr = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if frame is None:
                continue

            out = _infer_both_forced(svc, frame, "both")
            fire_dets, ppe_dets = _split_detections(out)
            all_dets = fire_dets + ppe_dets
            risk = compute_risk(all_dets)

            view = _render_overlay(frame, fire_dets, ppe_dets,
                                   bool(getattr(svc, "fire", None)),
                                   bool(getattr(svc, "ppe", None)))
            data_url = _encode_data_url(view)

            payload = {"type": "frame", "image": data_url, "detections": all_dets, "risk": risk}
            await _broadcast(payload)     # 시청자들에게 전달
            await ws.send_json(payload)   # 보낸 클라이언트에도 회신(미리보기)

            if risk["level"] in ("High", "Critical"):
                await _broadcast(
                    {
                        "type": "alert",
                        "severity": risk["level"],
                        "message": "실시간 위험 감지",
                        "risk": risk,
                        "detections": all_dets,
                    }
                )

    except WebSocketDisconnect:
        pass
