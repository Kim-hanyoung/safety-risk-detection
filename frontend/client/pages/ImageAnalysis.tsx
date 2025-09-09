import { useState } from "react";
import { analyzeImage, DetectRes } from "@/lib/detect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import { Link } from "react-router-dom";

export default function ImageAnalysis() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState<"fire"|"ppe"|"both">("both");
  const [publish, setPublish] = useState(false);
  const [title, setTitle] = useState("");
  const [res, setRes] = useState<DetectRes | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setErr("이미지를 선택하세요"); return; }
    if (publish && !user) { setErr("게시하려면 로그인하세요"); return; }
    setErr(null); setLoading(true); setRes(null);
    try {
      const out = await analyzeImage(file, model, publish, title || undefined);
      setRes(out);
    } catch (e: any) {
      setErr(e?.message ?? "분석 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-6">
      <h1 className="text-2xl font-bold">Image Analysis</h1>

      <form onSubmit={onSubmit} className="space-y-3 border rounded p-4">
        <Input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
        <div className="flex gap-3 text-sm">
          <label className="inline-flex items-center gap-1">
            <input type="radio" name="model" checked={model==="both"} onChange={()=>setModel("both")} /> both
          </label>
          <label className="inline-flex items-center gap-1">
            <input type="radio" name="model" checked={model==="fire"} onChange={()=>setModel("fire")} /> fire/smoke
          </label>
          <label className="inline-flex items-center gap-1">
            <input type="radio" name="model" checked={model==="ppe"} onChange={()=>setModel("ppe")} /> PPE
          </label>
        </div>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={publish} onChange={e=>setPublish(e.target.checked)} />
          분석 결과를 Reports 게시판에 자동 게시
        </label>

        {publish && (
          <Input placeholder="게시글 제목 (선택)" value={title} onChange={e=>setTitle(e.target.value)} />
        )}

        <Button type="submit" disabled={loading}>{loading ? "Analyzing..." : "Analyze"}</Button>
        {err && <div className="text-red-600 text-sm">{err}</div>}
      </form>

      {res && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <figure className="border rounded p-2">
              <figcaption className="text-sm mb-2">Original</figcaption>
              <img src={res.original_url} className="w-full rounded" />
            </figure>
            {Object.entries(res.annotated).map(([k, url]) => (
              <figure key={k} className="border rounded p-2">
                <figcaption className="text-sm mb-2">{k.toUpperCase()} annotated</figcaption>
                <img src={url} className="w-full rounded" />
              </figure>
            ))}
          </div>

          <div className="border rounded p-4">
            <div className="font-semibold mb-2">Detections ({res.detections.length})</div>
            {res.detections.length === 0 ? (
              <div className="text-sm text-muted-foreground">No detections</div>
            ) : (
              <ul className="text-sm space-y-1">
                {res.detections.map((d, i) => (
                  <li key={i}>
                    {d.label} — {Math.round(d.conf*100)}% [{d.bbox.map(n=>n.toFixed(0)).join(", ")}]
                  </li>
                ))}
              </ul>
            )}
          </div>

          {res.post_id && (
            <div className="text-sm">
              게시 완료: <Link className="underline" to={`/forum/${res.post_id}?category=reports`}>보고서 보기</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
