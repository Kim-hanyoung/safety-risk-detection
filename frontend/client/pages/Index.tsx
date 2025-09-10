import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HardHat, Shield, TrafficCone, TriangleAlert, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { AboutDialog } from "@/components/AboutDialog";
// 상대 경로는 프로젝트 설정에 맞춰 유지
import TableauEmbed from "../components/TableauEmbed";

export default function Index() {
  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="pointer-events-none absolute -left-10 top-10 hidden size-40 rounded-full bg-primary/20 blur-2xl md:block" />
        <div className="pointer-events-none absolute -right-10 bottom-10 hidden size-40 rounded-full bg-yellow-400/30 blur-2xl md:block" />
        <div className="container mx-auto grid gap-8 py-16 md:grid-cols-2 md:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <TriangleAlert className="h-4 w-4 text-yellow-500" />
              Predictive Safety Insights — real-time detection meets AI-driven reporting
            </div>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight md:text-5xl">
              SafeScope: Industrial safety made smart and approachable
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border bg-white/70 p-1 text-xs shadow-sm">
              <ModeToggle />
            </div>
            <p className="mt-4 max-w-prose text-lg text-muted-foreground">
              Detect PPE, flag hazards, and visualize workplace risk with playful, modern design and professional-grade insights.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="shadow-[0_12px_30px_-12px_hsl(var(--primary))]">
                <Link to="/image-analysis">Upload Image</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/risk-report">View Risk Report</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-6 -top-6 hidden rounded-xl bg-white/60 p-3 shadow-lg ring-1 ring-border/60 backdrop-blur md:block">
              <HardHat className="h-8 w-8 text-primary animate-bounce" />
            </div>
            <div className="absolute -right-6 top-14 hidden rounded-xl bg-white/60 p-3 shadow-lg ring-1 ring-border/60 backdrop-blur md:block">
              <TrafficCone className="h-8 w-8 text-orange-500 animate-pulse" />
            </div>
            <div className="absolute -bottom-6 right-10 hidden rounded-xl bg-white/60 p-3 shadow-lg ring-1 ring-border/60 backdrop-blur md:block">
              <Shield className="h-8 w-8 text-emerald-500 animate-spin [animation-duration:6s]" />
            </div>
            <img
              src="https://images.unsplash.com/photo-1541959833400-049d37f98c67?q=80&w=1600&auto=format&fit=crop"
              alt="Workers in safety gear"
              className="aspect-video w-full rounded-xl object-cover shadow-xl ring-1 ring-border/70"
            />
            <AboutDialog inline />
          </div>
        </div>
      </section>

      {/* Tableau Dashboard Section — 고정 크기 중앙 배치 */}
      <section className="w-full py-10 bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Interactive Safety Dashboard</h2>
        <div className="w-full flex justify-center">
          {/* 1번 스샷처럼 보이도록 1024x1627 권장. 필요시 숫자만 조정 */}
          <TableauEmbed name="_17574726192320/5" width={1024} height={1627} />
        </div>
      </section>

      {/* Feature Navigation Section */}
      <section className="border-y bg-gradient-to-br from-background to-amber-50/40 py-12">
        <div className="container mx-auto">
          <h2 className="text-balance text-center text-3xl font-bold tracking-tight md:text-4xl">
            Safety tools that feel friendly
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
            Playful, modern UI with professional-grade features for image analysis, video monitoring, and AI risk reports.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Camera className="h-5 w-5" />}
              title="Image Analysis"
              desc="Detect PPE and hazards"
              to="/image-analysis"
              color="bg-primary/10 text-primary"
            />
            <FeatureCard
              icon={<TriangleAlert className="h-5 w-5" />}
              title="AI Risk Report"
              desc="Generate insights"
              to="/risk-report"
              color="bg-yellow-400/2 0 text-yellow-700"
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Video Detection"
              desc="Live monitoring"
              to="/video-detection"
              color="bg-emerald-400/20 text-emerald-700"
            />
            <FeatureCard
              icon={<HardHat className="h-5 w-5" />}
              title="Community Forum"
              desc="Share best practices"
              to="/forum"
              color="bg-blue-400/20 text-blue-700"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ModeToggle() {
  const [mode, setMode] = useState("Manager");
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setMode("Manager")}
        className={`rounded px-2 py-1 ${mode === "Manager" ? "bg-primary text-white" : "hover:bg-accent"}`}
      >
        Site Manager Mode
      </button>
      <button
        onClick={() => setMode("Analyst")}
        className={`rounded px-2 py-1 ${mode === "Analyst" ? "bg-primary text-white" : "hover:bg-accent"}`}
      >
        Analyst Mode
      </button>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  to,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  to: string;
  color: string;
}) {
  return (
    <Link to={to} className="group">
      <div className="h-full rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <div className={`mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${color}`}>
          {icon}
          <span>{title}</span>
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
        <div className="mt-2 h-2 w-full rounded-full bg-accent/60">
          <div className="h-2 w-1/2 rounded-full bg-primary transition-all group-hover:w-4/5" />
        </div>
      </div>
    </Link>
  );
}
