import { useEffect, useMemo, useState } from "react";
import { listPosts, createPost, Post } from "@/lib/posts";
import { useAuth } from "@/context/auth";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // 없다면 Input 두 개로 대체

export default function Forum() {
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("category") === "reports" ? "reports" : "general";

  const [page, setPage] = useState(1);
  const [data, setData] = useState<{items: Post[]; total: number; page: number; page_size: number}>();
  const [loading, setLoading] = useState(false);

  // 작성 폼 상태
  const [openWrite, setOpenWrite] = useState(false);
  const [title, setTitle] = useState("");
  const [contentMd, setContentMd] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await listPosts({ category: tab, page, page_size: 10 });
      setData(res);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { setPage(1); }, [tab]);
  useEffect(() => { load(); }, [tab, page]);

  function switchTab(c: "general" | "reports") {
    setSp({ category: c });
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createPost({ title, content_md: contentMd, category: tab as any });
    setTitle(""); setContentMd(""); setOpenWrite(false);
    load();
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded border p-1">
          <button
            onClick={() => switchTab("general")}
            className={`px-3 py-1 rounded ${tab==="general"?"bg-accent text-accent-foreground":""}`}
          >General</button>
          <button
            onClick={() => switchTab("reports")}
            className={`px-3 py-1 rounded ${tab==="reports"?"bg-accent text-accent-foreground":""}`}
          >Reports</button>
        </div>

        {user && (
          <Button onClick={() => setOpenWrite(v=>!v)}>
            {openWrite ? "Cancel" : (tab==="reports" ? "New Report" : "New Post")}
          </Button>
        )}
      </div>

      {openWrite && user && (
        <form onSubmit={onCreate} className="space-y-3 border rounded p-4">
          <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
          {/* Textarea 컴포넌트가 없다면 <textarea className="border p-2 w-full h-40" .../>로 대체 */}
          <Textarea placeholder="Write in Markdown…" value={contentMd} onChange={e=>setContentMd(e.target.value)} required />
          <div className="text-right">
            <Button type="submit">Publish</Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading && <div className="text-muted-foreground">Loading…</div>}
        {!loading && data?.items.length === 0 && <div className="text-muted-foreground">No posts</div>}
        {!loading && data?.items.map(p => (
          <Link key={p.id} to={`/forum/${p.id}`} className="block border rounded p-4 hover:bg-accent/30">
            <div className="text-sm text-muted-foreground">{p.category.toUpperCase()} · {new Date(p.created_at).toLocaleString()}</div>
            <div className="text-lg font-semibold">{p.title}</div>
            <div className="text-sm text-muted-foreground">by {p.author.name ?? p.author.email}</div>
          </Link>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</Button>
        <Button variant="outline" disabled={(data?.page||1)*10 >= (data?.total||0)} onClick={()=>setPage(p=>p+1)}>Next</Button>
      </div>
    </div>
  );
}
