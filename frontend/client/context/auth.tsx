// frontend/client/context/auth.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as api from "@/lib/auth";

type Ctx = {
  user: api.User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};
const AuthCtx = createContext<Ctx>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<api.User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (token) {
        try { setUser(await api.me(token)); }
        catch { localStorage.removeItem("token"); setToken(null); }
      }
      setReady(true);
    })();
  }, []);

  const value = useMemo<Ctx>(() => ({
    user, token, ready,
    login: async (email, password) => {
      const res = await api.login(email, password);
      localStorage.setItem("token", res.access_token);
      setToken(res.access_token); setUser(res.user);
    },
    signup: async (email, password, name) => {
      const res = await api.signup(email, password, name);
      localStorage.setItem("token", res.access_token);
      setToken(res.access_token); setUser(res.user);
    },
    logout: () => { localStorage.removeItem("token"); setUser(null); setToken(null); },
  }), [user, token, ready]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
