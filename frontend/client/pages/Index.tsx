import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Camera,
  HardHat,
  Shield,
  TrafficCone,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AboutDialog } from "@/components/AboutDialog";

export default function Index() {
  const monthly = useMemo(
    () => [
      { month: "Jan", incidents: 14, near: 22 },
      { month: "Feb", incidents: 11, near: 17 },
      { month: "Mar", incidents: 18, near: 25 },
      { month: "Apr", incidents: 9, near: 19 },
      { month: "May", incidents: 12, near: 21 },
      { month: "Jun", incidents: 8, near: 16 },
      { month: "Jul", incidents: 7, near: 14 },
      { month: "Aug", incidents: 10, near: 18 },
      { month: "Sep", incidents: 9, near: 15 },
      { month: "Oct", incidents: 11, near: 17 },
      { month: "Nov", incidents: 13, near: 20 },
      { month: "Dec", incidents: 10, near: 16 },
    ],
    [],
  );

  const byIndustry = useMemo(
    () => [
      { name: "Manufacturing", risk: 78 },
      { name: "Construction", risk: 85 },
      { name: "Energy", risk: 69 },
      { name: "Logistics", risk: 58 },
      { name: "Healthcare", risk: 41 },
    ],
    [],
  );

  const riskScore = useMemo(
    () => [
      { month: "Jan", score: 72 },
      { month: "Feb", score: 70 },
      { month: "Mar", score: 68 },
      { month: "Apr", score: 66 },
      { month: "May", score: 65 },
      { month: "Jun", score: 63 },
      { month: "Jul", score: 62 },
      { month: "Aug", score: 61 },
      { month: "Sep", score: 59 },
      { month: "Oct", score: 60 },
      { month: "Nov", score: 58 },
      { month: "Dec", score: 57 },
    ],
    [],
  );

  return (
    <div className="">
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="pointer-events-none absolute -left-10 top-10 hidden size-40 rounded-full bg-primary/20 blur-2xl md:block" />
        <div className="pointer-events-none absolute -right-10 bottom-10 hidden size-40 rounded-full bg-yellow-400/30 blur-2xl md:block" />
        <div className="container mx-auto grid gap-8 py-16 md:grid-cols-2 md:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <TriangleAlert className="h-4 w-4 text-yellow-500" />
              Predictive Safety Insights — real-time detection meets AI-driven
              reporting
            </div>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight md:text-5xl">
              SafeScope: Industrial safety made smart and approachable
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border bg-white/70 p-1 text-xs shadow-sm">
              <ModeToggle />
            </div>
            <p className="mt-4 max-w-prose text-lg text-muted-foreground">
              Detect PPE, flag hazards, and visualize workplace risk with
              playful, modern design and professional-grade insights.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                className="shadow-[0_12px_30px_-12px_hsl(var(--primary))]"
              >
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

      <section className="container mx-auto space-y-6 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Accident Statistics</CardTitle>
              <CardDescription>
                Incidents vs near-misses per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  incidents: {
                    label: "Incidents",
                    color: "hsl(var(--destructive))",
                  },
                  near: { label: "Near Misses", color: "hsl(var(--primary))" },
                }}
                className="h-48"
              >
                <LineChart data={monthly}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="incidents"
                    stroke="var(--color-incidents)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="near"
                    stroke="var(--color-near)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Risk by Industry</CardTitle>
              <CardDescription>Composite risk score</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  risk: { label: "Risk", color: "hsl(var(--primary))" },
                }}
                className="h-48"
              >
                <BarChart data={byIndustry}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="risk"
                    fill="var(--color-risk)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Risk Score Trend</CardTitle>
              <CardDescription>Lower is better</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  score: { label: "Score", color: "hsl(var(--primary))" },
                }}
                className="h-48"
              >
                <AreaChart data={riskScore}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="score"
                    stroke="var(--color-score)"
                    fill="var(--color-score)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y bg-gradient-to-br from-background to-amber-50/40 py-12">
        <div className="container mx-auto">
          <h2 className="text-balance text-center text-3xl font-bold tracking-tight md:text-4xl">
            Safety tools that feel friendly
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
            Playful, modern UI with professional-grade features for image
            analysis, video monitoring, and AI risk reports.
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
              color="bg-yellow-400/20 text-yellow-700"
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
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <CardHeader>
          <div
            className={`mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${color}`}
          >
            {icon}
            <span>{title}</span>
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full rounded-full bg-accent/60">
            <div className="h-2 w-1/2 rounded-full bg-primary transition-all group-hover:w-4/5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
