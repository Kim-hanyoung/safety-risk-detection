import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function wsWatchUrl() {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${location.host}/api/stream/ws`;
}

export default function VideoDetection() {
  // WS로 받은 최신 프레임(data URL) 보관
  const [frame, setFrame] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Pull 모드용
  const [pullUrl, setPullUrl] = useState("");
  const [pullRunning, setPullRunning] = useState(false);

  // 시청자 WS 연결 (브라우저 → 서버 /api/stream/ws)
  useEffect(() => {
    let alive = true;
    let ws: WebSocket | null = null;
    let pingTimer: number | null = null;

    const connect = () => {
      ws = new WebSocket(wsWatchUrl());
      ws.onopen = () => {
        if (!alive) return;
        setWsConnected(true);
        // 20초마다 ping(사파리/모바일에서 keepalive)
        pingTimer = window.setInterval(() => {
          try { ws?.send("ping"); } catch {}
        }, 20000);
      };
      ws.onmessage = (ev) => {
        if (!alive) return;
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "frame" && typeof msg.image === "string") {
            // 서버는 data:image/jpeg;base64,... 형식으로 전달
            setFrame(msg.image);
          } else if (msg.type === "alert") {
            // TODO: 토스트/배지 처리 가능
            // console.log("ALERT:", msg);
          }
        } catch {}
      };
      ws.onclose = () => {
        if (!alive) return;
        setWsConnected(false);
        if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
        // 2초 뒤 재연결
        setTimeout(connect, 2000);
      };
      ws.onerror = () => {
        try { ws?.close(); } catch {}
      };
    };

    connect();
    return () => {
      alive = false;
      if (pingTimer) clearInterval(pingTimer);
      try { ws?.close(); } catch {}
    };
  }, []);

  // Pull 모드 시작/중지 (IP 카메라/MJPEG 등)
  async function startPull() {
    if (!pullUrl.trim()) return;
    await fetch("/api/stream/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: pullUrl, kind: "both" }),
    });
    setPullRunning(true);
  }
  async function stopPull() {
    await fetch("/api/stream/stop", { method: "POST" });
    setPullRunning(false);
  }

  return (
    <div className="container mx-auto max-w-5xl py-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`px-2 py-1 rounded border text-sm ${wsConnected ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}`}>
          WS: {wsConnected ? "Connected" : "Disconnected"}
        </span>
        <span className={`px-2 py-1 rounded border text-sm ${pullRunning ? "border-blue-500 text-blue-600" : "border-gray-400 text-gray-500"}`}>
          Pull Loop: {pullRunning ? "Running" : "Stopped"}
        </span>
      </div>

      {/* Pull 모드 컨트롤 (IP 카메라/MJPEG) */}
      <div className="flex gap-2">
        <Input
          placeholder="Stream URL (e.g., http://<ip>:8080/video)"
          value={pullUrl}
          onChange={(e) => setPullUrl(e.target.value)}
        />
        {!pullRunning ? (
          <Button onClick={startPull}>Start (Pull)</Button>
        ) : (
          <Button variant="outline" onClick={stopPull}>Stop (Pull)</Button>
        )}
      </div>

      {/* 실제 프레임 표시: 반드시 data URL을 src로!! */}
      <div className="rounded border p-2">
        {frame ? (
          <img
            src={frame}
            alt="live"
            className="w-full h-auto rounded"
            style={{ objectFit: "contain", maxHeight: "80vh" }}
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            대기 중… (모바일에서 <code>/mobile-stream</code> → <b>Start</b> 를 누르거나 Pull을 시작하세요)
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        • iPhone 푸시 모드: 휴대폰에서 <code>/mobile-stream</code> 페이지 → <b>Start</b> 누르면 이 화면이 자동으로 프레임을 수신합니다(별도 URL 불필요).<br />
        • IP 카메라 풀 모드: MJPEG/HTTP URL을 입력하고 <b>Start (Pull)</b>.
      </div>
    </div>
  );
}
