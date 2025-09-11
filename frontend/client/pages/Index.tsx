import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HardHat, Shield, TrafficCone, TriangleAlert, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { AboutDialog } from "@/components/AboutDialog";
import TableauEmbed from "../components/TableauEmbed";
import SlideImage from "@/components/SlideImage";

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
              예측 기반 안전 인사이트 — 실시간 감지와 AI 리포팅의 만남
            </div>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight md:text-5xl">
              SafeScope:<br/>산업안전 위험 예측
            </h1>
            {/* <div className="mt-3 inline-flex items-center gap-2 rounded-md border bg-white/70 p-1 text-xs shadow-sm">
              <ModeToggle />
            </div> */}
            <p className="mt-4 max-w-prose text-lg text-muted-foreground">
              보호장비 감지, 위험 요소 식별, 작업장 리스크 시각화를 현대적이고 직관적인 디자인으로 제공합니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="shadow-[0_12px_30px_-12px_hsl(var(--primary))]">
                <Link to="/image-analysis">이미지 업로드</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/risk-report">리스크 리포트 보기</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <SlideImage />
            <AboutDialog inline />
          </div>
        </div>
      </section>

      {/* Tableau Dashboard Section */}
      <section className="w-full py-10 bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center">
          산업재해 통계 자료
        </h2>
        <TableauEmbed
          viewPath="_17574726192320/5"
          width={1024}
          height={1627}
        />
      </section>

      {/* Feature Navigation Section */}
      <section className="border-y bg-gradient-to-br from-background to-amber-50/40 py-12">
        <div className="container mx-auto">
          <h2 className="text-balance text-center text-3xl font-bold tracking-tight md:text-4xl">
            쉽게 접근 가능한 위험 감지 시스템
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
            이미지 분석, 영상 모니터링, AI 리스크 리포트를 위한 현대적이고 직관적인 UI와 전문가급 기능을 제공합니다.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Camera className="h-5 w-5" />}
              title="이미지 분석"
              desc="보호장비 및 위험 요소 감지"
              to="/image-analysis"
              color="bg-primary/10 text-primary"
            />
            <FeatureCard
              icon={<TriangleAlert className="h-5 w-5" />}
              title="AI 리스크 리포트"
              desc="인사이트 생성"
              to="/risk-report"
              color="bg-yellow-400/20 text-yellow-700"
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="영상 감지"
              desc="실시간 모니터링"
              to="/video-detection"
              color="bg-emerald-400/20 text-emerald-700"
            />
            <FeatureCard
              icon={<HardHat className="h-5 w-5" />}
              title="커뮤니티 포럼"
              desc="모범 사례 공유"
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
        현장 관리자 모드
      </button>
      <button
        onClick={() => setMode("Analyst")}
        className={`rounded px-2 py-1 ${mode === "Analyst" ? "bg-primary text-white" : "hover:bg-accent"}`}
      >
        분석가 모드
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