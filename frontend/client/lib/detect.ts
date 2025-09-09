const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

function authHeader() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export type DetectRes = {
  ok: boolean;
  original_url: string;
  annotated: Record<string, string>; // {fire:string, ppe:string}
  detections: { label: string; conf: number; bbox: number[] }[];
  model: "fire" | "ppe" | "both";
  post_id?: string;
};

export async function analyzeImage(file: File, model: "fire"|"ppe"|"both", publish: boolean, title?: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("model", model);
  fd.append("publish", String(publish));
  if (title) fd.append("title", title);

  const r = await fetch(`${API}/detect/image`, {
    method: "POST",
    headers: { ...authHeader() }, // 토큰 있으면 첨부 (publish 시 필수)
    body: fd,
  });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as DetectRes;
}
