// src/components/layout/SiteHeader.tsx
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
} from "lucide-react";
// ⛔️ 제거: RiskLevelBadge, Notifications, useAlerts
import { useAuth } from "@/context/auth";

const navItemClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
  }`;

export default function SiteHeader() {
  // ⛔️ 제거: const { risk } = useAlerts();
  const { user, logout } = useAuth();

  const displayName =
    (user?.name && user.name.trim()) || (user?.email ?? "");

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

        {/* GNB */}
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

        {/* 우측 영역 */}
        <div className="flex items-center gap-2">
          {/* ⛔️ 제거: RiskLevelBadge + Notifications
          <div className="hidden items-center gap-2 md:flex">
            <RiskLevelBadge level={risk} small />
            <Notifications />
          </div>
          */}

          {/* 로그인 상태에 따라 표시 */}
          {!user ? (
            <>
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
              <Button
                asChild
                size="sm"
                className="shadow-[0_8px_20px_-8px_hsl(var(--primary))]"
              >
                <Link to="/image-analysis">Get Started</Link>
              </Button>
            </>
          ) : (
            <>
              {/* ✅ 주황색 이니셜 원형 배지 제거, 이름만 표시 */}
              <div className="hidden md:flex items-center gap-2 rounded-full border px-2 py-1 max-w-[220px]">
                <span className="truncate text-sm">{displayName}</span>
              </div>
              {/* 로그아웃 버튼 유지 */}
              <Button
                size="sm"
                variant="outline"
                onClick={logout}
                className="hidden md:inline-flex"
                title="Logout"
              >
                Logout
              </Button>
              {/* Get Started 버튼 유지 */}
              <Button
                asChild
                size="sm"
                className="shadow-[0_8px_20px_-8px_hsl(var(--primary))]"
              >
                <Link to="/image-analysis">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
