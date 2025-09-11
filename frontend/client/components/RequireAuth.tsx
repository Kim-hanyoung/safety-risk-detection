// frontend/client/components/RequireAuth.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return null;                    // 초기 복원 대기
  if (!user) return <Navigate to="/auth" state={{ from: loc }} replace />;
  return children;
}
