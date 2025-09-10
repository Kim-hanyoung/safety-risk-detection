import { useEffect, useState } from "react";
import { listPosts, createPost, Post } from "@/lib/posts";
import { useAuth } from "@/context/auth";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 10;

// 레벨별 배지 색상
function badgeClass(level?: string) {
  switch (level) {
    case "Critical":
      return "bg-red-100 text-red-700 border-red-200";
    case "High":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Warning":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Normal":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function Forum() {
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("category") === "reports" ? "reports" : "general";

  const [page, setPage] = useState(1);
  const [data, setData] = useState<{
    items: Post[];
    total: number;
    page: number;
    page_size: number;
  }>();
  const [loading, setLoading] = useState(false);

  // 작성 폼 상태
  const [openWrite, setOpenWrite] = useState(false);
  const [title, setTitle] = useState("");
  const [contentMd, setContentMd] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await listPosts({ category: tab, page, page_size: PAGE_SIZE });
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    load();
  }, [tab, page]);

  function switchTab(c: "general" | "reports") {
    setSp({ category: c });
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createPost({ title, content_md: contentMd, category: tab as any });
    setTitle("");
    setContentMd("");
    setOpenWrite(false);
    load();
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      {/* 탭 & 새 글 버튼 */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded border p-1">
          <button
            onClick={() => switchTab("general")}
            className={`px-3 py-1 rounded ${tab === "general" ? "bg-accent text-accent-foreground" : ""}`}
          >
            General
          </button>
        <button
            onClick={() => switchTab("reports")}
            className={`px-3 py-1 rounded ${tab === "reports" ? "bg-accent text-accent-foreground" : ""}`}
          >
            Reports
          </button>
        </div>

        {user && (
          <Button onClick={() => setOpenWrite((v) => !v)}>
            {openWrite ? "Cancel" : tab === "reports" ? "New Report" : "New Post"}
          </Button>
        )}
      </div>

      {/* 작성 폼 */}
      {openWrite && user && (
        <form onSubmit={onCreate} className="space-y-3 border rounded p-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Write in Markdown…"
            value={contentMd}
            onChange={(e) => setContentMd(e.target.value)}
            required
            className="min-h-[160px]"
          />
          <div className="text-right">
            <Button type="submit">Publish</Button>
          </div>
        </form>
      )}

      {/* 목록 */}
      <div className="space-y-3">
        {loading && <div className="text-muted-foreground">Loading…</div>}
        {!loading && (data?.items.length ?? 0) === 0 && (
          <div className="text-muted-foreground">No posts</div>
        )}

        {!loading &&
          data?.items.map((p) => (
            <Link
              key={p.id}
              to={`/forum/${p.id}?category=${tab}`} // 현재 탭 정보 유지
              className="block border rounded p-4 hover:bg-accent/30"
            >
              <div className="text-sm text-muted-foreground">
                {p.category.toUpperCase()} · {new Date(p.created_at).toLocaleString()}
              </div>

              {/* 제목 + 위험도 뱃지 */}
              <div className="mt-0.5 flex items-center gap-2">
                <div className="text-lg font-semibold">{p.title}</div>
                {/* meta.risk 뱃지 */}
                {p.meta?.risk && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${badgeClass(
                      p.meta.risk.level
                    )}`}
                  >
                    {p.meta.risk.level}
                  </span>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                by {p.author.name ?? p.author.email}
              </div>
            </Link>
          ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </Button>
        <Button
          variant="outline"
          disabled={(data?.page || 1) * PAGE_SIZE >= (data?.total || 0)}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
