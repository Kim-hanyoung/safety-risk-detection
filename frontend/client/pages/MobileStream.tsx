import { useEffect, useRef, useState } from "react";

const wsPushUrl = () => {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${location.host}/api/stream/push`;
};

export default function MobileStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [fps, setFps] = useState(6); // iOS에서 안전한 전송 FPS

  async function start() {
    // 1) 카메라 열기 (iOS: HTTPS + 사용자 제스처 + muted + playsInline 필수)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 },
      },
      audio: false,
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      // iOS 자동재생을 위해 muted/playsInline 필요 (video 태그에 설정)
      await videoRef.current.play().catch(() => {});
    }

    // 2) WebSocket 연결
    const ws = new WebSocket(wsPushUrl());
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    // 3) 캔버스 루프: 각 프레임을 JPEG로 만들어 WS로 전송
    setSending(true);
    const loop = async () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const v = videoRef.current!;
      if (!v || v.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const canvas =
        canvasRef.current || (canvasRef.current = document.createElement("canvas"));
      canvas.width = v.videoWidth || 640;
      canvas.height = v.videoHeight || 480;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

      const blob: Blob = await new Promise((res) =>
        canvas.toBlob((b) => res(b!), "image/jpeg", 0.8)
      );
      if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
        const buf = await blob.arrayBuffer();
        wsRef.current.send(buf); // ← 바이너리로 전송 (백엔드가 bytes로 수신)
      }

      // 전송 FPS 제한 (간단 딜레이 후 다음 rAF)
      setTimeout(() => {
        rafRef.current = requestAnimationFrame(loop);
      }, Math.max(0, 1000 / Math.max(1, fps) - 16));
    };
    rafRef.current = requestAnimationFrame(loop);
  }

  function stop() {
    setSending(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    wsRef.current?.close();
    const s = streamRef.current;
    s?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  useEffect(() => () => stop(), []);

  return (
    <div className="container mx-auto max-w-3xl py-6 space-y-3">
      <h1 className="text-2xl font-bold">Mobile Stream</h1>

      <video
        ref={videoRef}
        autoPlay
        muted        // iOS 자동재생 필수
        playsInline  // iOS 전체화면 방지
        className="w-full rounded bg-black"
      />

      <div className="flex items-center gap-3">
        {!sending ? (
          <button className="px-4 py-2 rounded bg-orange-500 text-white" onClick={start}>
            Start
          </button>
        ) : (
          <button className="px-4 py-2 rounded border" onClick={stop}>
            Stop
          </button>
        )}
        <label className="text-sm flex items-center gap-2">
          FPS
          <input
            type="number"
            min={1}
            max={15}
            value={fps}
            onChange={(e) => setFps(Number(e.target.value) || 6)}
            className="w-16 border rounded px-2 py-1"
          />
        </label>
        <span className="text-sm">{connected ? "WS Connected" : "WS Disconnected"}</span>
      </div>

      <p className="text-sm text-muted-foreground">
        iOS는 <b>HTTPS</b> + <b>사용자 제스처</b>(버튼 클릭)가 있어야 카메라 사용이 됩니다.
        화면이 꺼지면 전송이 멈출 수 있어요(실험 중엔 “자동 잠금” 해제 권장).
      </p>
    </div>
  );
}
