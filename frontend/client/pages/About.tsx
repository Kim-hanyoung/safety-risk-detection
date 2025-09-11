import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container mx-auto space-y-8 py-10">
      {/* Hero */}
      <div className="pt-[6rem] pb-[2.5rem] text-center">
        <div className="mb-6 flex justify-center">
          <span className="icon-pulse text-8xl">🦺</span>
        </div>
        <h1 className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-5xl font-extrabold text-transparent md:text-6xl">
          SafeScope 소개
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-xl leading-relaxed text-muted-foreground">
          AI 기반의 혁신적인 안전 모니터링 시스템으로, 지능형 감지와 분석을 통해 근로자를 보호하고 사고를 예방합니다.
        </p>
      </div>

      {/* Mission */}
      <Card className="relative overflow-hidden border bg-card/70 p-8 shadow-sm ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="absolute right-4 top-4 flex space-x-2 opacity-80">
          <span className="icon-bounce text-3xl">🎯</span>
          <span className="icon-rotate text-3xl">⚡</span>
        </div>
        <h2 className="mb-6 text-3xl font-bold text-primary">우리의 목표</h2>
        <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
          세계에서 가장 진보된 안전 모니터링 생태계를 구축하여 인공지능, 컴퓨터 비전, 실시간 분석을 결합해 산업재해를 제거하고 생명을 구하는 것이 우리의 목표입니다. 
          모든 근로자가 매일 안전하게 집으로 돌아갈 수 있어야 한다고 믿습니다.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="p-4 text-center">
            <span className="icon-pulse mb-3 block text-4xl">👁️</span>
            <h3 className="mb-2 font-semibold text-primary">모든 것을 감지</h3>
            <p className="text-sm text-muted-foreground">24시간 지능형 모니터링</p>
          </div>
          <div className="p-4 text-center">
            <span className="icon-bounce mb-3 block text-4xl">🧠</span>
            <h3 className="mb-2 font-semibold text-primary">스마트하게 사고 예측</h3>
            <p className="text-sm text-muted-foreground">AI 기반 위험 평가</p>
          </div>
          <div className="p-4 text-center">
            <span className="icon-rotate mb-3 block text-4xl">⚡</span>
            <h3 className="mb-2 font-semibold text-primary">신속한 대응</h3>
            <p className="text-sm text-muted-foreground">즉각적인 알림 시스템</p>
          </div>
        </div>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="border bg-card/70 p-6 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="mb-4 flex items-center space-x-3">
            <span className="icon-bounce text-3xl">🤖</span>
            <h3 className="text-xl font-semibold text-primary">AI 기반 감지</h3>
          </div>
          <p className="mb-4 text-muted-foreground">
            첨단 머신러닝이 실시간으로 영상 피드를 분석하여 안전 규정 위반, 보호장비 미착용,
            잠재적 위험 요소를 사고 발생 전에 감지합니다.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>안전모 및 보호장비 감지</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>행동 기반 위험 분석</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>장비 이상 경고</span></li>
          </ul>
        </Card>

        <Card className="border bg-card/70 p-6 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="mb-4 flex items-center space-x-3">
            <span className="icon-pulse text-3xl">📊</span>
            <h3 className="text-xl font-semibold text-primary">스마트 분석</h3>
          </div>
          <p className="mb-4 text-muted-foreground">
            종합적인 보고서와 분석을 통해 안전 트렌드, 위험 패턴, 개선을 위한 실행 가능한 인사이트를 제공합니다.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>실시간 안전 점수판</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>예측 기반 위험 모델링</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>규정 준수 추적</span></li>
          </ul>
        </Card>

        <Card className="border bg-card/70 p-6 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="mb-4 flex items-center space-x-3">
            <span className="icon-rotate text-3xl">🚨</span>
            <h3 className="text-xl font-semibold text-primary">즉각적인 알림</h3>
          </div>
          <p className="mb-4 text-muted-foreground">
            이메일, 문자, 시스템 연동을 통한 다채널 경고로 안전 사고를 즉시 알립니다.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>실시간 비상 알림</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>사용자 맞춤형 심각도 단계</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>프로토콜 연동</span></li>
          </ul>
        </Card>

        <Card className="border bg-card/70 p-6 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="mb-4 flex items-center space-x-3">
            <span className="icon-bounce text-3xl">🔒</span>
            <h3 className="text-xl font-semibold text-primary">기업 보안</h3>
          </div>
          <p className="mb-4 text-muted-foreground">
            암호화, 역할 기반 접근 제어, 산업 표준 준수를 갖춘 기업 수준의 보안을 제공합니다.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>종단간 암호화</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>역할 기반 권한 관리</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>감사 추적 및 규정 준수</span></li>
          </ul>
        </Card>
      </div>

      {/* Tech */}
      <Card className="border bg-card/70 p-8 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <h2 className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-center text-3xl font-bold text-transparent">
          최첨단 기술로 구동됩니다
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          <div className="p-4">
            <span className="icon-pulse mb-3 block text-4xl">🧠</span>
            <h4 className="mb-1 font-semibold text-primary">머신러닝</h4>
            <p className="text-xs text-muted-foreground">TensorFlow & PyTorch</p>
          </div>
          <div className="p-4">
            <span className="icon-bounce mb-3 block text-4xl">👁️</span>
            <h4 className="mb-1 font-semibold text-primary">컴퓨터 비전</h4>
            <p className="text-xs text-muted-foreground">OpenCV & YOLO</p>
          </div>
          <div className="p-4">
            <span className="icon-rotate mb-3 block text-4xl">☁️</span>
            <h4 className="mb-1 font-semibold text-primary">클라우드 컴퓨팅</h4>
            <p className="text-xs text-muted-foreground">AWS & Azure</p>
          </div>
          <div className="p-4">
            <span className="icon-pulse mb-3 block text-4xl">📱</span>
            <h4 className="mb-1 font-semibold text-primary">모바일 지원</h4>
            <p className="text-xs text-muted-foreground">iOS & Android</p>
          </div>
        </div>
      </Card>

      {/* CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-500 py-12 text-primary-foreground">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <span className="icon-rotate text-9xl">⚙️</span>
        </div>
        <div className="relative z-10 text-center">
          <h2 className="mb-4 text-3xl font-bold">안전 혁신을 시작할 준비 되셨나요?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
            가장 소중한 자산인 ‘사람’을 지키기 위해 SafeScope와 함께하세요.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="border-white/30 bg-white/20 hover:bg-white/30">
              <span className="mr-2 text-xl">📞</span> 영업팀 문의
            </Button>
            <Button size="lg" variant="secondary" className="border-white/30 bg-white/20 hover:bg-white/30">
              <span className="mr-2 text-xl">🚀</span> 무료 체험 시작
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
