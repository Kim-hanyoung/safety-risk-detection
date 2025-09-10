import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function wsUrlPush() {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${location.host}/api/stream/push`;
}

export default function MobileStream() {
  const [fps, setFps] = useState(6);
  const [running, setRunning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);

  async function start() {
    // iOS: HTTPS + 사용자 제스처 필요, playsInline/muted 필수
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }, audio: false,
    });
    const v = videoRef.current!;
    v.srcObject = stream;
    await v.play();

    const ws = new WebSocket(wsUrlPush());
    wsRef.current = ws;

    ws.onopen = () => {
      setRunning(true);
      const sendFrame = async () => {
        const v = videoRef.current, c = canvasRef.current;
        if (!v || !c) return;
        const w = 640;                     // 업로드 해상도 제한
        const h = Math.round((v.videoHeight / v.videoWidth) * w);
        c.width = w; c.height = h;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(v, 0, 0, w, h);
        // JPEG로 인코딩 → 바이너리 전송
        c.toBlob((blob) => {
          if (blob && ws.readyState === WebSocket.OPEN) {
            blob.arrayBuffer().then((buf) => ws.send(buf));
          }
        }, "image/jpeg", 0.8);
      };
      // FPS 주기로 전송
      const interval = Math.max(1000 / fps, 120);
      timerRef.current = window.setInterval(sendFrame, interval);
    };

    ws.onclose = () => stop();
    ws.onerror = () => stop();
  }

  function stop() {
    setRunning(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
    const v = videoRef.current;
    if (v?.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      v.srcObject = null;
    }
  }

  useEffect(() => () => stop(), []);

  return (
    <div className="container mx-auto max-w-md p-4 space-y-3">
      <h1 className="text-xl font-semibold">Mobile Camera Push</h1>
      <div className="flex items-center gap-2">
        <Input type="number" min={2} max={12} value={fps}
          onChange={(e)=>setFps(Number(e.target.value)||6)} className="w-24" />
        <span className="text-sm text-muted-foreground">FPS</span>
      </div>

      <video
        ref={videoRef}
        className="w-full rounded border"
        playsInline
        muted
        autoPlay
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-2">
        {!running ? (
          <Button onClick={start}>Start Camera</Button>
        ) : (
          <Button variant="outline" onClick={stop}>Stop</Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        iOS는 HTTPS에서만 카메라 접근이 됩니다. ngrok의 https 주소로 접속하세요.
      </p>
    </div>
  );
}
