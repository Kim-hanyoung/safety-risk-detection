// frontend/client/pages/ImageAnalysis.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { analyzeImage, DetectRes } from "@/lib/detect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import { Link } from "react-router-dom";

/**
 * 기존 API/타입(DetectRes, analyzeImage) 그대로 사용
 * UI만 투패널 카드형으로 재구성
 */
export default function ImageAnalysis() {
  const { user } = useAuth();

  // ── 상태
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [model, setModel] = useState<"fire" | "ppe" | "both">("both");
  const [publish, setPublish] = useState(false);
  const [title, setTitle] = useState("");

  const [res, setRes] = useState<DetectRes | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 진행바(시각효과)
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  // ── 미리보기 URL 관리
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ── 진행바 타이머
  useEffect(() => {
    if (loading) {
      setProgress(0);
      timerRef.current = window.setInterval(() => {
        setProgress((p) => Math.min(95, p + Math.random() * 8));
      }, 250);
      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
      };
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
  }, [loading]);

  // ── 제출
  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!file) { setErr("이미지를 선택하세요"); return; }
    if (publish && !user) { setErr("게시하려면 로그인하세요"); return; }

    setErr(null);
    setRes(null);
    setLoading(true);

    try {
      const out = await analyzeImage(file, model, publish, title || undefined);
      setRes(out);
    } catch (e: any) {
      setErr(e?.message ?? "분석 실패");
    } finally {
      setLoading(false);
      setProgress(100);
      // 살짝 후 진행바 초기화
      setTimeout(() => setProgress(0), 700);
    }
  }

  // 간단 안내문
  const helperText = useMemo(
    () => "Upload a photo to detect PPE and hazards.",
    []
  );

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        {/* ───────────────────────── 좌측: 업로드/옵션/실행 ───────────────────────── */}
        <div
          style={{
            background: "linear-gradient(135deg,#fff,#fde9d6)",
            borderRadius: 16,
            padding: 20,
            border: "1px solid #eee",
          }}
        >
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>Image Analysis</h2>
          <p style={{ marginTop: 0, color: "#666" }}>{helperText}</p>

          <form onSubmit={onSubmit} className="space-y-3" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                style={{ flex: 1 }}
              />
              <Button
                type="submit"
                disabled={!file || loading}
                variant="default"
                style={{
                  background: loading ? "#ddd" : "#f59e0b",
                  color: "#111",
                  border: "none",
                }}
              >
                {loading ? "Analyzing…" : "Run Analysis"}
              </Button>
            </div>

            {/* 모델 옵션 */}
            <div style={{ display: "flex", gap: 16, fontSize: 14, marginTop: 6 }}>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="model"
                  checked={model === "both"}
                  onChange={() => setModel("both")}
                />{" "}
                both
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="model"
                  checked={model === "fire"}
                  onChange={() => setModel("fire")}
                />{" "}
                fire/smoke
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="model"
                  checked={model === "ppe"}
                  onChange={() => setModel("ppe")}
                />{" "}
                PPE
              </label>
            </div>

            {/* 게시 옵션 */}
            <div style={{ marginTop: 6 }}>
              <label className="inline-flex items-center gap-2" style={{ fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                />
                분석 결과를 Reports 게시판에 자동 게시
              </label>

              {publish && (
                <div style={{ marginTop: 8 }}>
                  <Input
                    placeholder="게시글 제목 (선택)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* 진행바 */}
            <div
              style={{
                height: 10,
                background: "#f5f5f5",
                borderRadius: 8,
                marginTop: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "#fde68a",
                  transition: "width 0.25s linear",
                }}
              />
            </div>

            {err && (
              <div className="text-red-600 text-sm" style={{ marginTop: 8 }}>
                {err}
              </div>
            )}

            {/* 미리보기 */}
            {preview && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    maxWidth: "100%",
                    borderRadius: 12,
                    border: "1px solid #eee",
                  }}
                />
              </div>
            )}
          </form>
        </div>

        {/* ───────────────────────── 우측: 결과 패널 ───────────────────────── */}
        <div
          style={{
            background: "linear-gradient(135deg,#fff,#fdf1cf)",
            borderRadius: 16,
            padding: 20,
            border: "1px solid #eee",
            minHeight: 300,
          }}
        >
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>Results</h2>
          <p style={{ marginTop: 0, color: "#666" }}>
            Detected items and risk factors.
          </p>

          {/* 안내 */}
          {!loading && !res && (
            <p style={{ color: "#777", marginTop: 20 }}>
              이미지를 업로드한 뒤 <b>Run Analysis</b>를 클릭하세요.
            </p>
          )}

          {/* 결과 섹션 */}
          {res && (
            <div style={{ marginTop: 12, display: "grid", gap: 16 }}>
              {/* 원본/주석 이미지 그리드 */}
              <div className="grid md:grid-cols-2 gap-4" style={{ display: "grid", gap: 12 }}>
                <figure style={{ border: "1px solid #eee", borderRadius: 12, padding: 8 }}>
                  <figcaption style={{ fontSize: 12, marginBottom: 6 }}>Original</figcaption>
                  <img
                    src={res.original_url}
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                </figure>

                {Object.entries(res.annotated).map(([k, url]) => (
                  <figure
                    key={k}
                    style={{ border: "1px solid #eee", borderRadius: 12, padding: 8 }}
                  >
                    <figcaption style={{ fontSize: 12, marginBottom: 6 }}>
                      {k.toUpperCase()} annotated
                    </figcaption>
                    <img src={url} style={{ width: "100%", borderRadius: 8 }} />
                  </figure>
                ))}
              </div>

              {/* 디텍션 리스트 */}
              <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  Detections ({res.detections.length})
                </div>

                {res.detections.length === 0 ? (
                  <div style={{ color: "#777", fontSize: 14 }}>No detections</div>
                ) : (
                  <ul style={{ fontSize: 14, display: "grid", gap: 6, margin: 0, paddingLeft: 16 }}>
                    {res.detections.map((d, i) => (
                      <li key={i}>
                        {d.label} — {Math.round(d.conf * 100)}% [
                        {d.bbox.map((n) => n.toFixed(0)).join(", ")}]
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 게시 완료 링크 */}
              {res.post_id && (
                <div style={{ fontSize: 14 }}>
                  게시 완료:{" "}
                  <Link className="underline" to={`/forum/${res.post_id}?category=reports`}>
                    보고서 보기
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
