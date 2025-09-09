const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export type Post = {
  id: string;
  category: "reports" | "general";
  title: string;
  content_md: string;
  author: { id: string; email: string; name?: string | null };
  created_at: string;
  updated_at?: string | null;
};

export type Page<T> = { items: T[]; total: number; page: number; page_size: number };

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listPosts(params?: { category?: string; page?: number; page_size?: number }): Promise<Page<Post>> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  const r = await fetch(`${API}/posts/?${qs.toString()}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getPost(id: string): Promise<Post> {
  const r = await fetch(`${API}/posts/${id}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createPost(input: { title: string; content_md: string; category: "reports" | "general"; meta?: any }) {
  const r = await fetch(`${API}/posts/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<Post>;
}

export async function updatePost(
  id: string,
  patch: { title?: string; content_md?: string; category?: "reports"|"general"; meta?: any }
) {
  const r = await fetch(`${API}/posts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<Post>;
}

export async function deletePost(id: string) {
  const r = await fetch(`${API}/posts/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// 댓글 
export async function createComment(postId: string, content: string) {
  const r = await fetch(`${API}/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() }, // ✅ JSON 헤더
    body: JSON.stringify({ content }),                                  // ✅ {"content":"..."}
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}


export async function updateComment(postId: string, commentId: string, content: string) {
  const r = await fetch(`${API}/posts/${postId}/comments/${commentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ content }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ ok: true }>;
}

export async function deleteComment(postId: string, commentId: string) {
  const r = await fetch(`${API}/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ ok: true }>;
}