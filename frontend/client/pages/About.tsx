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
          About SafeScope
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-xl leading-relaxed text-muted-foreground">
          Revolutionary AI-powered safety monitoring designed to protect workers and prevent accidents through intelligent detection and analysis.
        </p>
      </div>

      {/* Mission */}
      <Card className="relative overflow-hidden border bg-card/70 p-8 shadow-sm ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="absolute right-4 top-4 flex space-x-2 opacity-80">
          <span className="icon-bounce text-3xl">🎯</span>
          <span className="icon-rotate text-3xl">⚡</span>
        </div>
        <h2 className="mb-6 text-3xl font-bold text-primary">Our Mission</h2>
        <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
          To create the world's most advanced safety monitoring ecosystem that combines artificial intelligence, computer vision, and real-time analytics to eliminate workplace accidents and save lives. We believe every worker deserves to return home safely every day.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="p-4 text-center">
            <span className="icon-pulse mb-3 block text-4xl">👁️</span>
            <h3 className="mb-2 font-semibold text-primary">See Everything</h3>
            <p className="text-sm text-muted-foreground">24/7 intelligent monitoring</p>
          </div>
          <div className="p-4 text-center">
            <span className="icon-bounce mb-3 block text-4xl">🧠</span>
            <h3 className="mb-2 font-semibold text-primary">Think Smart</h3>
            <p className="text-sm text-muted-foreground">AI-powered risk assessment</p>
          </div>
          <div className="p-4 text-center">
            <span className="icon-rotate mb-3 block text-4xl">⚡</span>
            <h3 className="mb-2 font-semibold text-primary">Act Fast</h3>
            <p className="text-sm text-muted-foreground">Instant alert system</p>
          </div>
        </div>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="border bg-card/70 p-6 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="mb-4 flex items-center space-x-3">
            <span className="icon-bounce text-3xl">🤖</span>
            <h3 className="text-xl font-semibold text-primary">AI-Powered Detection</h3>
          </div>
          <p className="mb-4 text-muted-foreground">
            Advanced machine learning analyzes video feeds in real-time to detect safety violations, missing PPE, and potential hazards before accidents occur.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>Hard hat and safety gear detection</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>Behavioral risk analysis</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>Equipment malfunction alerts</span></li>
          </ul>
        </Card>

        <Card className="border bg-card/70 p-6 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="mb-4 flex items-center space-x-3">
            <span className="icon-pulse text-3xl">📊</span>
            <h3 className="text-xl font-semibold text-primary">Smart Analytics</h3>
          </div>
          <p className="mb-4 text-muted-foreground">
            Comprehensive reporting and analytics provide insights into safety trends, risk patterns, and actionable recommendations for continuous improvement.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>Real-time safety scorecards</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>Predictive risk modeling</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>Compliance tracking</span></li>
          </ul>
        </Card>

        <Card className="border bg-card/70 p-6 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="mb-4 flex items-center space-x-3">
            <span className="icon-rotate text-3xl">🚨</span>
            <h3 className="text-xl font-semibold text-primary">Instant Alerts</h3>
          </div>
          <p className="mb-4 text-muted-foreground">
            Multi-channel alerts ensure immediate notification of safety incidents via email, SMS, and integrations.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>Real-time emergency alerts</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>Customizable severity levels</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>Protocol integrations</span></li>
          </ul>
        </Card>

        <Card className="border bg-card/70 p-6 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="mb-4 flex items-center space-x-3">
            <span className="icon-bounce text-3xl">🔒</span>
            <h3 className="text-xl font-semibold text-primary">Enterprise Security</h3>
          </div>
          <p className="mb-4 text-muted-foreground">
            Enterprise-grade security with encryption, role-based access control, and compliance with industry standards.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>End-to-end encryption</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>Role-based permissions</span></li>
            <li className="flex items-center space-x-2"><span className="text-emerald-600">✓</span><span>Audit trail & compliance</span></li>
          </ul>
        </Card>
      </div>

      {/* Tech */}
      <Card className="border bg-card/70 p-8 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <h2 className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-center text-3xl font-bold text-transparent">
          Powered by Cutting-Edge Technology
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          <div className="p-4">
            <span className="icon-pulse mb-3 block text-4xl">🧠</span>
            <h4 className="mb-1 font-semibold text-primary">Machine Learning</h4>
            <p className="text-xs text-muted-foreground">TensorFlow & PyTorch</p>
          </div>
          <div className="p-4">
            <span className="icon-bounce mb-3 block text-4xl">👁️</span>
            <h4 className="mb-1 font-semibold text-primary">Computer Vision</h4>
            <p className="text-xs text-muted-foreground">OpenCV & YOLO</p>
          </div>
          <div className="p-4">
            <span className="icon-rotate mb-3 block text-4xl">☁️</span>
            <h4 className="mb-1 font-semibold text-primary">Cloud Computing</h4>
            <p className="text-xs text-muted-foreground">AWS & Azure</p>
          </div>
          <div className="p-4">
            <span className="icon-pulse mb-3 block text-4xl">📱</span>
            <h4 className="mb-1 font-semibold text-primary">Mobile Ready</h4>
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
          <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Safety?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
            Join thousands of companies that trust SafeScope to protect their most valuable asset — their people.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="border-white/30 bg-white/20 hover:bg-white/30">
              <span className="mr-2 text-xl">📞</span> Contact Sales
            </Button>
            <Button size="lg" variant="secondary" className="border-white/30 bg-white/20 hover:bg-white/30">
              <span className="mr-2 text-xl">🚀</span> Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
