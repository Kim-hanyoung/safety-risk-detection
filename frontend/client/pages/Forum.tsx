import { useEffect, useState } from "react";
import { listPosts, createPost, uploadAttachment, Post, Attachment } from "@/lib/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Forum() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  const [category, setCategory] = useState<"general" | "reports">("general");

  async function reload() {
    setLoading(true);
    try {
      const data = await listPosts({ category });
      setPosts(data.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [category]);

  // 새 글 저장
  async function onCreatePost() {
    if (!title.trim() || !content.trim()) return;
    await createPost({
      title,
      content_md: content,
      category,
      meta: { attachments },
    });
    setTitle("");
    setContent("");
    setAttachments([]);
    setCreating(false);
    reload();
  }

  // 파일 업로드
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const data = await uploadAttachment(file);
      setAttachments((prev) => [...prev, data]);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-6">
      {/* 카테고리 탭 + New Post 버튼 */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={category === "general" ? "default" : "outline"}
            onClick={() => setCategory("general")}
          >
            General
          </Button>
          <Button
            variant={category === "reports" ? "default" : "outline"}
            onClick={() => setCategory("reports")}
          >
            Reports
          </Button>
        </div>

        {!creating && (
          <Button
            onClick={() => setCreating(true)}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            New Post
          </Button>
        )}
      </div>

      {/* 새 글 작성 */}
      {creating && (
        <div className="space-y-3 border rounded p-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Write in Markdown..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {/* 파일 업로드 */}
          <div className="space-y-2">
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="bg-orange-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-orange-600"
            >
              File Upload
            </label>
            {uploading && <div>Uploading…</div>}
            {attachments.map((att, idx) =>
              att.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <div key={idx} className="space-y-1">
                  <img
                    src={att.file_url}
                    alt={att.file_name}
                    className="max-w-md rounded border"
                  />
                </div>
              ) : (
                <div key={idx}>{att.file_name}</div>
              )
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="bg-orange-500 text-white hover:bg-orange-600"
              onClick={() => setCreating(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={onCreatePost}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Publish
            </Button>
          </div>
        </div>
      )}

      {/* 게시글 목록 */}
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <a
              key={p.id}
              href={`/forum/${p.id}`}
              className="block border rounded p-4 hover:bg-muted"
            >
              <div className="text-sm text-muted-foreground">
                {p.category.toUpperCase()} ·{" "}
                {new Date(p.created_at).toLocaleString()}
              </div>
              <div className="font-bold">{p.title}</div>
              <div className="text-sm">{p.author.name ?? p.author.email}</div>
              <div className="text-muted-foreground mt-2 line-clamp-2">
                {p.content_md}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
