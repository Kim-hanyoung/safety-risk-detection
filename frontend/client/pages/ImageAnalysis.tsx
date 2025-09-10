// frontend/client/pages/ImageAnalysis.tsx
import React, { useEffect, useState } from "react";

type Item = {
  label: string;
  severity: "low" | "medium" | "high" | string;
  description: string;
};

type AnalyzeResponse = {
  items: Item[];
  llm_summary?: string | null;
};

const raw = (import.meta as any).env?.VITE_API_BASE?.toString().trim();
const API_BASE =
  raw && /^https?:\/\//i.test(raw) ? raw.replace(/\/+$/, "") : "http://127.0.0.1:8000";


export default function ImageAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Item[]>([]);
  const [summary, setSummary] = useState<string>("");

  // 파일 선택 시 미리보기 생성
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
  };

  const runAnalysis = async () => {
    if (!file) return;
    setAnalyzing(true);
    setProgress(0);
    setResults([]);
    setSummary("");

    // 진행바 시각효과
    const timer = setInterval(() => {
      setProgress((p) => Math.min(95, p + Math.random() * 8));
    }, 250);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${API_BASE}/api/image/analyze`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }

      const data: AnalyzeResponse = await res.json();
      setResults(data.items ?? []);
      setSummary(data.llm_summary ?? "");
    } catch (err: any) {
      setResults([
        {
          label: "Analysis failed",
          severity: "high",
          description: String(err?.message || err),
        },
      ]);
    } finally {
      clearInterval(timer);
      setProgress(100);
      setAnalyzing(false);
      setTimeout(() => setProgress(0), 700);
    }
  };

  const SeverityTag: React.FC<{ s: Item["severity"] }> = ({ s }) => {
    const style =
      s === "high"
        ? { background: "#fee2e2", color: "#991b1b" }
        : s === "medium"
        ? { background: "#fef3c7", color: "#92400e" }
        : { background: "#dcfce7", color: "#14532d" };
    return (
      <span style={{ ...style, padding: "2px 8px", borderRadius: 8, fontSize: 12 }}>
        {s}
      </span>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* 왼쪽: 업로드/실행 */}
        <div
          style={{
            background: "linear-gradient(135deg,#fff, #fde9d6)",
            borderRadius: 16,
            padding: 20,
            border: "1px solid #eee",
          }}
        >
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>Image Analysis</h2>
          <p style={{ marginTop: 0, color: "#666" }}>
            Upload a photo to detect PPE and hazards.
          </p>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
            <input
              type="file"
              accept="image/*"
              onChange={onChangeFile}
              style={{ flex: 1 }}
            />
            <button
              onClick={runAnalysis}
              disabled={!file || analyzing}
              style={{
                background: analyzing ? "#ddd" : "#f59e0b",
                color: "#111",
                border: "none",
                padding: "10px 14px",
                borderRadius: 8,
                cursor: !file || analyzing ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {analyzing ? "Analyzing…" : "Run Analysis"}
            </button>
          </div>

          {/* 진행바 */}
          <div
            style={{
              height: 10,
              background: "#f5f5f5",
              borderRadius: 8,
              marginTop: 18,
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

          {/* 미리보기 */}
          {preview && (
            <div style={{ marginTop: 16 }}>
              <img
                src={preview}
                alt="preview"
                style={{ maxWidth: "100%", borderRadius: 12, border: "1px solid #eee" }}
              />
            </div>
          )}
        </div>

        {/* 오른쪽: 결과 */}
        <div
          style={{
            background: "linear-gradient(135deg, #fff, #fdf1cf)",
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

          {!analyzing && results.length === 0 && !summary && (
            <p style={{ color: "#777", marginTop: 20 }}>
              Upload an image and click <b>Run Analysis</b> to see results.
            </p>
          )}

          {/* LLM 요약 */}
          {!analyzing && summary && (
            <div
              style={{
                border: "1px solid #eee",
                background: "#fafafa",
                borderRadius: 12,
                padding: 12,
                marginTop: 8,
                whiteSpace: "pre-wrap",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Summary</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>{summary}</div>
            </div>
          )}

          {/* 디텍션 리스트 */}
          {results.length > 0 && (
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {results.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 10,
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{it.label}</div>
                    <SeverityTag s={it.severity} />
                  </div>
                  <div style={{ color: "#555", fontSize: 14 }}>{it.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
