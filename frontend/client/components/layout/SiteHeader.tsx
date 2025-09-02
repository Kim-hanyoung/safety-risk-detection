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

const navItemClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
  }`;

import { useState } from "react";

export default function SiteHeader() {
  const { risk } = useAlerts();
  const [lang, setLang] = useState("EN");
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <HardHat className="h-6 w-6 text-primary" />
            <TriangleAlert className="absolute -right-2 -top-2 h-3 w-3 text-yellow-500 animate-pulse" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            SafeScope
          </span>
        </Link>

        <nav className="hidden gap-1 md:flex">
          <NavLink to="/" className={navItemClass} end>
            Home
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
          <button
            onClick={() => setLang((l) => (l === "EN" ? "KR" : "EN"))}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent"
          >
            <Languages className="h-4 w-4" /> {lang}
          </button>
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
        </div>
      </div>
    </header>
  );
}
