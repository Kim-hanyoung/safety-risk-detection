// frontend/client/lib/auth.ts
const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export type User = { id: string; email: string; name?: string | null };
export type AuthRes = { access_token: string; token_type: "bearer"; user: User };

export async function signup(email: string, password: string, name?: string) {
  const r = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as AuthRes;
}

export async function login(email: string, password: string) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as AuthRes;
}

export async function me(token: string) {
  const r = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as User;
}
