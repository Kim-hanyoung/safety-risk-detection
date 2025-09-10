import { useEffect, useState } from "react";
import { getPost, updatePost, deletePost, Post,
         createComment, updateComment, deleteComment } from "@/lib/posts";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // 없으면 <textarea>로 대체
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export default function ForumPost() {
  const { id } = useParams();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const isOwner = !!(user && post && user.id === post.author.id);

  // 편집 상태(게시글)
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [contentMd, setContentMd] = useState("");

  // 댓글 작성
  const [newComment, setNewComment] = useState("");
  // 댓글 편집 상태: { [commentId]: string | undefined }
  const [editMap, setEditMap] = useState<Record<string, string>>({});

  async function reload() {
    if (!id) return;
    setLoading(true);
    try {
      const p = await getPost(id);
      setPost(p);
      setTitle(p.title);
      setContentMd(p.content_md);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, [id]);

  async function onSavePost() {
    if (!id) return;
    const updated = await updatePost(id, { title, content_md: contentMd });
    setPost(updated);
    setEditing(false);
  }

  async function onDeletePost() {
    if (!id || !post) return;
    if (!confirm("정말 삭제할까요?")) return;
    await deletePost(id);
    const backCategory = sp.get("category") || post.category;
    nav(`/forum?category=${backCategory}`);
  }

  async function onCreateComment(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    await createComment(id, newComment.trim());
    setNewComment("");
    reload();
  }

  async function onUpdateComment(cid: string) {
    if (!id) return;
    const text = editMap[cid]?.trim();
    if (!text) return;
    await updateComment(id, cid, text);
    setEditMap((m) => { const n = { ...m }; delete n[cid]; return n; });
    reload();
  }

  async function onDeleteComment(cid: string) {
    if (!id) return;
    if (!confirm("댓글을 삭제할까요?")) return;
    await deleteComment(id, cid);
    reload();
  }

  if (loading || !post) return <div className="container mx-auto max-w-3xl py-8">Loading…</div>;

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-6">
      {/* 헤더 + 게시글 편집 */}
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-muted-foreground">
            {post.category.toUpperCase()} · {new Date(post.created_at).toLocaleString()}
          </div>

          {!editing ? (
            <h1 className="text-2xl font-bold">{post.title}</h1>
          ) : (
            <Input value={title} onChange={e=>setTitle(e.target.value)} />
          )}

          <div className="text-sm text-muted-foreground">
            by {post.author.name ?? post.author.email}
          </div>

          {/* ⬇⬇ 여기 추가 */}
          {("meta" in post) && (post as any).meta?.llm && (
            <div className="mt-1 text-xs text-muted-foreground">
              LLM: {(post as any).meta.llm.used ? "사용" : "미사용"}
              {(post as any).meta.llm.error ? ` (에러: ${(post as any).meta.llm.error})` : ""}
            </div>
          )}
          {/* LLM 사용 여부 아래에 추가 */}
          {post.meta?.risk && (
            <div className="mt-1 text-xs">
              위험도: <b>{post.meta.risk.level}</b> (score {post.meta.risk.score})
            </div>
          )}

        </div>

        {isOwner && (
          <div className="flex gap-2">
            {!editing ? (
              <>
                <Button variant="outline" onClick={()=>setEditing(true)}>Edit</Button>
                <Button variant="destructive" onClick={onDeletePost}>Delete</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={()=>{ setEditing(false); setTitle(post.title); setContentMd(post.content_md); }}>Cancel</Button>
                <Button onClick={onSavePost}>Save</Button>
              </>
            )}
          </div>
        )}
      </div>

      {!editing ? (
        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a:   (props) => <a {...props} target="_blank" rel="noreferrer" className="text-primary underline" />,
              img: ({ src = "", alt, ...rest }) => (
                <a href={src} target="_blank" rel="noreferrer">
                  <img src={src} alt={alt} {...rest} className="rounded" />
                </a>
              ),
            }}
          >
            {post.content_md}
          </ReactMarkdown>
        </div>
      ) : (
        <Textarea className="min-h-[200px]" value={contentMd} onChange={e=>setContentMd(e.target.value)} />
      )}

      {/* 댓글 영역 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Comments</h2>

        {/* 작성폼 (로그인 필요) */}
        {user ? (
          <form onSubmit={onCreateComment} className="flex gap-2">
            <Input
              placeholder="댓글을 입력하세요"
              value={newComment}
              onChange={(e)=>setNewComment(e.target.value)}
            />
            <Button type="submit">Add</Button>
          </form>
        ) : (
          <div className="text-sm text-muted-foreground">로그인하면 댓글을 작성할 수 있습니다.</div>
        )}

        {/* 목록 */}
        <div className="space-y-2">
          {("comments" in post ? (post as any).comments : []).map((c: any) => {
            const mine = user?.id === c.author_id; // admin 체크는 서버에서 권한검사
            const editing = editMap[c.id] !== undefined;
            return (
              <div key={c.id} className="rounded border p-3">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()} · by {c.author_id === post.author.id ? (post.author.name ?? post.author.email) : c.author_id}
                  </div>
                  {mine && (
                    <div className="flex gap-2">
                      {!editing ? (
                        <>
                          <Button size="sm" variant="outline" onClick={()=>setEditMap(m=>({ ...m, [c.id]: c.content }))}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={()=>onDeleteComment(c.id)}>Delete</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={()=>setEditMap(m=>{ const n={...m}; delete n[c.id]; return n; })}>Cancel</Button>
                          <Button size="sm" onClick={()=>onUpdateComment(c.id)}>Save</Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {!editing ? (
                  <div className="mt-2 whitespace-pre-wrap">{c.content}</div>
                ) : (
                  <Textarea
                    className="mt-2"
                    value={editMap[c.id] ?? ""}
                    onChange={(e)=>setEditMap(m=>({ ...m, [c.id]: e.target.value }))}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
