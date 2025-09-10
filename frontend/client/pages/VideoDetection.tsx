import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

type Risk = { level: string; score: number };

function wsUrl() {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  // Vite 프록시(/api → FastAPI) 사용
  return `${proto}://${location.host}/api/stream/ws`;
}

export default function VideoDetection() {
  // 풀 모드: MJPEG URL (예: http://<ip>:8080/video)
  const [url, setUrl] = useState("");
  const [running, setRunning] = useState(false);   // 서버 pull loop 상태
  const [connected, setConnected] = useState(false); // WS 연결 상태
  const [lastAlert, setLastAlert] = useState<string | null>(null);
  const [risk, setRisk] = useState<Risk | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  // -----------------------------
  // WebSocket: 시청자용(/api/stream/ws)
  // -----------------------------
  useEffect(() => {
    const ws = new WebSocket(wsUrl());
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "frame") {
          if (imgRef.current && typeof msg.image === "string") {
            imgRef.current.src = msg.image;
          }
          if (msg.risk) setRisk(msg.risk as Risk);
        } else if (msg.type === "alert") {
          setLastAlert(`${msg.severity}: ${msg.message}`);
          toast({
            title: `ALERT – ${msg.severity}`,
            description: msg.message ?? "위험 감지",
          });
        } else if (msg.type === "error") {
          toast({ title: "Stream Error", description: msg.message ?? "오류" });
        }
      } catch {
        /* ignore */
      }
    };

    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [toast]);

  // -----------------------------
  // 풀 모드 제어: /api/stream/start /stop
  // -----------------------------
  async function startPull() {
    if (!url.trim()) {
      toast({ title: "URL 필요", description: "MJPEG/HTTP 스트림 URL을 입력하세요." });
      return;
    }
    await fetch("/api/stream/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim(), kind: "both" }),
    });
    setRunning(true);
  }

  async function stopPull() {
    await fetch("/api/stream/stop", { method: "POST" });
    setRunning(false);
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm rounded border px-2 py-1">
          WS: {connected ? "Connected" : "Disconnected"}
        </span>
        <span className="text-sm rounded border px-2 py-1">
          Pull Loop: {running ? "Running" : "Stopped"}
        </span>
        {risk && (
          <span className="text-sm rounded border px-2 py-1">
            Risk: <b>{risk.level}</b> (score {risk.score})
          </span>
        )}
      </div>

      {/* 풀 모드 컨트롤 (IP 카메라 / MJPEG) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Stream URL (e.g., http://<ip>:8080/video)"
          className="sm:flex-1"
        />
        {!running ? (
          <Button onClick={startPull}>Start (Pull)</Button>
        ) : (
          <Button variant="outline" onClick={stopPull}>
            Stop (Pull)
          </Button>
        )}
      </div>

      {/* 실시간 프레임 */}
      <div className="rounded border p-2">
        <img ref={imgRef} alt="live" className="w-full rounded" />
      </div>

      {lastAlert && (
        <div className="text-sm text-red-600">
          Last alert: {lastAlert}
        </div>
      )}

      <div className="text-sm text-muted-foreground space-y-1">
        <div>
          • <b>iPhone 푸시 모드</b>: 핸드폰에서 <code>/mobile-stream</code> 페이지로 접속해
          <b> Start Camera</b>를 누르면 이 화면은 자동으로 실시간 프레임을 수신합니다(별도 URL 불필요).
        </div>
        <div>
          • <b>IP 카메라 풀 모드</b>: MJPEG/HTTP URL을 입력하고 <b>Start (Pull)</b>.
        </div>
      </div>
    </div>
  );
}
