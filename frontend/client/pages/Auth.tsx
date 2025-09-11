// client/pages/Auth.tsx
import { useState } from "react";
import { useAuth } from "@/context/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Auth() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login, signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const goBackTo = (loc.state as any)?.from?.pathname ?? "/";

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    const f = new FormData(e.target as HTMLFormElement);
    setLoading(true);
    try {
      await login(String(f.get("email")), String(f.get("password")));
      nav(goBackTo, { replace: true });
    } catch(err:any){
      console.error("login failed:", err);
      alert(err?.message ?? "Login failed");
    }finally {
      setLoading(false);
    }
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    const f = new FormData(e.target as HTMLFormElement);
    setLoading(true);
    try {
      await signup(
        String(f.get("email")),
        String(f.get("password")),
        String(f.get("name") || "")
      );
      nav(goBackTo, { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="mb-4 text-2xl font-bold">Login / Sign Up</h1>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-6">
          <form onSubmit={onLogin} className="space-y-3">
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="mt-6">
          <form onSubmit={onSignup} className="space-y-3">
            <Input name="name" placeholder="Name (optional)" />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
