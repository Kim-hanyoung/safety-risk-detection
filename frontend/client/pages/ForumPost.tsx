import { useEffect, useState } from "react";
import {
  getPost,
  updatePost,
  deletePost,
  Post,
  createComment,
  updateComment,
  deleteComment,
} from "@/lib/posts";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Attachment = {
  file_name: string;
  file_url: string;
};

export default function ForumPost() {
  const { id } = useParams();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const isOwner = !!(user && post && user.id === post.author.id);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [contentMd, setContentMd] = useState("");

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [editMap, setEditMap] = useState<Record<string, string>>({});

  function normalizeAttachments(raw: any[] | undefined): Attachment[] {
    if (!raw) return [];
    return raw.map((att: any) =>
      typeof att === "string"
        ? { file_name: att.split("/").pop() || att, file_url: att }
        : att
    );
  }

  async function reload() {
    if (!id) return;
    setLoading(true);
    try {
      const p = await getPost(id);
      setPost(p);
      setTitle(p.title);
      setContentMd(p.content_md);
      const raw = (p.meta?.attachments as any[]) || (p.attachments as any[]) || [];
      setAttachments(normalizeAttachments(raw));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [id]);

  // ✅ 게시물 저장 (업로드 취소 반영 포함)
  async function onSavePost() {
    if (!id) return;
    const updated = await updatePost(id, {
      title,
      content_md: contentMd,
      meta: { attachments }, // ← 항상 현재 상태의 첨부파일 반영
    });

    const raw = (updated.meta?.attachments as any[]) || (updated.attachments as any[]) || [];
    setPost(updated);
    setAttachments(normalizeAttachments(raw));
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
    setEditMap((m) => {
      const n = { ...m };
      delete n[cid];
      return n;
    });
    reload();
  }

  async function onDeleteComment(cid: string) {
    if (!id) return;
    if (!confirm("댓글을 삭제할까요?")) return;
    await deleteComment(id, cid);
    reload();
  }

  // ✅ 업로드 취소 핸들러
  function handleCancelUpload(idx: number) {
    const newFiles = attachments.filter((_, i) => i !== idx);
    setAttachments(newFiles);
  }

  if (loading || !post)
    return <div className="container mx-auto max-w-3xl py-8">Loading…</div>;

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-muted-foreground">
            {post.category.toUpperCase()} ·{" "}
            {new Date(post.created_at).toLocaleString()}
          </div>
          {!editing ? (
            <h1 className="text-2xl font-bold">{post.title}</h1>
          ) : (
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          )}
          <div className="text-sm text-muted-foreground">
            by {post.author.name ?? post.author.email}
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            {!editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={onDeletePost}>
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setTitle(post.title);
                    setContentMd(post.content_md);
                    const raw =
                      (post.meta?.attachments as any[]) ||
                      (post.attachments as any[]) ||
                      [];
                    setAttachments(normalizeAttachments(raw));
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={onSavePost}
                  className="bg-orange-500 text-white hover:bg-orange-600"
                >
                  Save
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 본문 */}
      {!editing ? (
        <pre className="whitespace-pre-wrap">{post.content_md}</pre>
      ) : (
        <Textarea
          className="min-h-[200px]"
          value={contentMd}
          onChange={(e) => setContentMd(e.target.value)}
        />
      )}

      {/* 첨부파일 */}
      <div className="space-y-2">
        <h3 className="font-semibold">Attachments</h3>
        {attachments.length > 0 ? (
          attachments.map((att, idx) =>
            att.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <div key={idx} className="space-y-2">
                <img
                  src={att.file_url}
                  alt={att.file_name}
                  className="max-w-md rounded border"
                />
                {!editing ? (
                  <a
                    href={att.file_url}
                    download={att.file_name}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 inline-block text-sm"
                  >
                    Download
                  </a>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleCancelUpload(idx)}
                  >
                    Upload Cancel
                  </Button>
                )}
              </div>
            ) : (
              <div key={idx} className="space-y-2">
                <span>{att.file_name}</span>
                {!editing ? (
                  <a
                    href={att.file_url}
                    download={att.file_name}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 inline-block text-sm"
                  >
                    Download
                  </a>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleCancelUpload(idx)}
                  >
                    Upload Cancel
                  </Button>
                )}
              </div>
            )
          )
        ) : (
          <div className="text-sm text-muted-foreground">첨부파일 없음</div>
        )}
      </div>

      {/* 댓글 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Comments</h2>

        {user ? (
          <form onSubmit={onCreateComment} className="flex gap-2">
            <Input
              placeholder="댓글을 입력하세요"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              type="submit"
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Add
            </Button>
          </form>
        ) : (
          <div className="text-sm text-muted-foreground">
            로그인하면 댓글을 작성할 수 있습니다.
          </div>
        )}

        <div className="space-y-2">
          {("comments" in post ? (post as any).comments : []).map((c: any) => {
            const mine = user?.id === c.author_id;
            const editingComment = editMap[c.id] !== undefined;
            return (
              <div key={c.id} className="rounded border p-3">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()} · by{" "}
                    {c.author_id === post.author.id
                      ? post.author.name ?? post.author.email
                      : c.author_id}
                  </div>
                  {mine && (
                    <div className="flex gap-2">
                      {!editingComment ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditMap((m) => ({ ...m, [c.id]: c.content }))
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDeleteComment(c.id)}
                          >
                            Delete
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const n = { ...editMap };
                              delete n[c.id];
                              setEditMap(n);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="bg-orange-500 text-white hover:bg-orange-600"
                            onClick={() => onUpdateComment(c.id)}
                          >
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {!editingComment ? (
                  <div className="mt-2 whitespace-pre-wrap">{c.content}</div>
                ) : (
                  <Textarea
                    className="mt-2"
                    value={editMap[c.id] ?? ""}
                    onChange={(e) =>
                      setEditMap((m) => ({ ...m, [c.id]: e.target.value }))
                    }
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
