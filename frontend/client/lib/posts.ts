const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";
// 카테고리 타입 정의
export type Category = "reports" | "general";

// 📌 첨부파일 타입
export interface Attachment {
  file_name: string;
  file_url: string;
}

// 📌 게시글 타입
export interface Post {
  id: string;
  category: "reports" | "general";
  title: string;
  content_md: string;
  author: { id: string; email: string; name?: string | null };
  created_at: string;
  updated_at?: string | null;
  meta?: any;
  attachments?: Attachment[];   // ✅ 추가
  comments?: any[];
}

// 📌 페이지네이션 타입
export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 📌 게시글 목록 조회
export async function listPosts(params?: {
  category?: string;
  page?: number;
  page_size?: number;
}): Promise<Page<Post>> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  const r = await fetch(`${API}/posts/?${qs.toString()}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// 📌 단일 게시글 조회
export async function getPost(id: string): Promise<Post> {
  const r = await fetch(`${API}/posts/${id}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// 📌 게시글 생성
export async function createPost(input: {
  title: string;
  content_md: string;
  category: "reports" | "general";
  meta?: { attachments?: Attachment[] };
}) {
  const r = await fetch(`${API}/posts/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<Post>;
}

// 📌 게시글 수정
export async function updatePost(
  id: string,
  patch: {
    title?: string;
    content_md?: string;
    category?: "reports" | "general";
    meta?: { attachments?: Attachment[] };
  }
) {
  const r = await fetch(`${API}/posts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<Post>;
}

// 📌 게시글 삭제
export async function deletePost(id: string) {
  const r = await fetch(`${API}/posts/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// 📌 댓글 생성
export async function createComment(postId: string, content: string) {
  const r = await fetch(`${API}/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ content }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// 📌 댓글 수정
export async function updateComment(
  postId: string,
  commentId: string,
  content: string
) {
  const r = await fetch(`${API}/posts/${postId}/comments/${commentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ content }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ ok: true }>;
}

// 📌 댓글 삭제
export async function deleteComment(postId: string, commentId: string) {
  const r = await fetch(`${API}/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ ok: true }>;
}

// 📌 파일 업로드 (게시글 첨부 전용)
export async function uploadAttachment(
  file: File
): Promise<{ file_name: string; file_url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const r = await fetch(`${API}/posts/upload`, {
    method: "POST",
    headers: { ...authHeader() }, // FormData는 Content-Type 자동 지정됨
    body: formData,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
