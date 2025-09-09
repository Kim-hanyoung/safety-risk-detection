import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  HardHat,
  TriangleAlert,
  Camera,
  Video,
  BarChart3,
  UsersRound,
  LogIn,
  Languages,
} from "lucide-react";
import RiskLevelBadge from "@/components/common/RiskLevelBadge";
import Notifications from "@/components/common/Notifications";
import { useAlerts } from "@/context/alerts";

// ✅ 추가: 로그인 상태/로그아웃 사용
import { useAuth } from "@/context/auth";
import { useState } from "react";

const navItemClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
  }`;

export default function SiteHeader() {
  const { risk } = useAlerts();
  const [lang, setLang] = useState("EN");

  // ✅ 로그인 상태/로그아웃
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <HardHat className="h-6 w-6 text-primary" />
            <TriangleAlert className="absolute -right-2 -top-2 h-3 w-3 text-yellow-500 animate-pulse" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">SafeScope</span>
        </Link>

        <nav className="hidden gap-1 md:flex">
          <NavLink to="/" className={navItemClass} end>
            Home
          </NavLink>
          <NavLink to="/about" className={navItemClass}>
            About
          </NavLink>
          <NavLink to="/risk-report" className={navItemClass}>
            <BarChart3 className="mr-1 h-4 w-4" /> Report
          </NavLink>
          <NavLink to="/image-analysis" className={navItemClass}>
            <Camera className="mr-1 h-4 w-4" /> Image
          </NavLink>
          <NavLink to="/video-detection" className={navItemClass}>
            <Video className="mr-1 h-4 w-4" /> Video
          </NavLink>
          <NavLink to="/forum" className={navItemClass}>
            <UsersRound className="mr-1 h-4 w-4" /> Forum
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <RiskLevelBadge level={risk} small />
            <Notifications />
          </div>

          {/* 언어 토글은 항상 표시 */}
          <button
            onClick={() => setLang((l) => (l === "EN" ? "KR" : "EN"))}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent"
          >
            <Languages className="h-4 w-4" /> {lang}
          </button>

          {/* ✅ 로그인/로그아웃 버튼 분기 */}
          {user ? (
            <>
              <span className="hidden md:inline text-sm text-foreground/80">
                Hi, {user.name ?? user.email}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="hidden md:inline-flex"
                onClick={logout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden md:inline-flex"
            >
              <Link to="/auth" className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          )}

          {/* Get Started는 유지 (원하면 로그인 여부로 리다이렉션 변경 가능) */}
          <Button
            asChild
            size="sm"
            className="shadow-[0_8px_20px_-8px_hsl(var(--primary))]"
          >
            <Link to="/image-analysis">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
