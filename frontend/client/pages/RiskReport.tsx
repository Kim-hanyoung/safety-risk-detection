import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Pie,
  PieChart,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CheckCircle2,
  FileDown,
  FileSpreadsheet,
  Loader2,
  PieChart as PieIcon,
  Sparkles,
  Copy,
  FileText,
} from "lucide-react";

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines
    .shift()
    .split(",")
    .map((s) => s.trim());
  return lines.map((l) => {
    const parts = l.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = parts[i]));
    return obj;
  });
}

export default function RiskReport() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [summary, setSummary] = useState("");
  const [data, setData] = useState([]);
  const fileRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploaded(false);
    setProgress(0);
    const t = setInterval(
      () => setProgress((p) => Math.min(100, p + Math.random() * 20)),
      250,
    );
    const text = await file.text();
    await new Promise((r) => setTimeout(r, 1200));
    clearInterval(t);
    setProgress(100);
    setData(parseCSV(text));
    setUploading(false);
    setUploaded(true);
  };

  const injuriesFatalities = useMemo(
    () => [
      { year: 2016, injuries: 118000, fatalities: 1800 },
      { year: 2017, injuries: 121000, fatalities: 1800 },
      { year: 2018, injuries: 129000, fatalities: 2200 },
      { year: 2019, injuries: 126000, fatalities: 1700 },
      { year: 2020, injuries: 122000, fatalities: 1800 },
      { year: 2021, injuries: 131000, fatalities: 1800 },
      { year: 2022, injuries: 136000, fatalities: 1800 },
      { year: 2023, injuries: 139000, fatalities: 1600 },
    ],
    [],
  );

  const fatalByIndustry = useMemo(
    () => [
      { name: "Construction", value: 520 },
      { name: "Manufacturing", value: 480 },
      { name: "Mining", value: 210 },
      { name: "Electricity/Gas", value: 180 },
      { name: "Other services", value: 140 },
    ],
    [],
  );

  const regionHeat = useMemo(
    () => [
      { region: "Seoul", risk: 0.8, injuries: "High", fatalities: "Avg" },
      { region: "Gyeonggi", risk: 0.95, injuries: "High", fatalities: "High" },
      { region: "Gangwon", risk: 0.7, injuries: "Avg", fatalities: "High" },
      { region: "Gyeongnam", risk: 0.86, injuries: "High", fatalities: "High" },
      { region: "Jeju", risk: 0.2, injuries: "Low", fatalities: "Low" },
    ],
    [],
  );

  const donutAge = useMemo(
    () => [
      { name: "<20", value: 4 },
      { name: "20–29", value: 10 },
      { name: "30–39", value: 14 },
      { name: "40–49", value: 18 },
      { name: "50–59", value: 22 },
      { name: "60+", value: 32 },
    ],
    [],
  );

  const stackedSeverity = useMemo(
    () => [
      { industry: "Manufacturing", d29_90: 58, d91_180: 41, long: 18 },
      { industry: "Construction", d29_90: 47, d91_180: 34, long: 16 },
      { industry: "Electricity/Gas", d29_90: 64, d91_180: 48, long: 22 },
      { industry: "Other services", d29_90: 76, d91_180: 53, long: 25 },
    ],
    [],
  );

  const accidentTypesFatal = [
    { name: "Disease", value: 42 },
    { name: "Falls", value: 28 },
    { name: "Collision", value: 9 },
  ];
  const accidentTypesInjury = [
    { name: "Slip/Trip", value: 31 },
    { name: "Disease", value: 19 },
    { name: "Falls", value: 17 },
    { name: "Cuts", value: 12 },
    { name: "Collision", value: 9 },
    { name: "Overexertion", value: 6 },
    { name: "Off-site traffic", value: 6 },
  ];

  const generateSummary = () => {
    const text =
      "Injury risk rises markedly in the 60+ group ⚠️; Construction and Manufacturing remain critical; Region risk clusters in Seoul/Gyeonggi/Gyeongnam; consider focused interventions on high-severity incidents and early-tenure workers.";
    setSummary(text);
  };

  const downloadPDF = () => {
    const blob = new Blob([
      `SafeScope Report\n\n${new Date().toLocaleString()}\n\n${summary || "Run Generate Report to create the narrative."}`,
    ]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "safescope-report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-primary" /> Numeric → AI
              Report
            </CardTitle>
            <CardDescription>
              Upload CSV, analyze, and generate PDF summary.
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            Electricity/Gas/Steam/Water merged as Electricity/Gas
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={(e) => handleUpload(e.target.files?.[0])}
            />
            <Button
              variant="secondary"
              onClick={() => fileRef.current?.click()}
            >
              Choose CSV
            </Button>
          </div>
          <Progress value={progress} />
          {uploaded && (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" /> Upload complete
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Records"
          value={(data.length || 1245).toLocaleString()}
        />
        <StatCard title="Anomaly Count" value={312} />
        <StatCard title="Peak Risk Score" value={92} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Annual Injuries vs. Fatalities</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                injuries: { label: "Injuries", color: "hsl(var(--primary))" },
                fatalities: {
                  label: "Fatalities",
                  color: "hsl(var(--destructive))",
                },
              }}
              className="h-64"
            >
              <LineChart data={injuriesFatalities}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="injuries"
                  stroke="var(--color-injuries)"
                  strokeWidth={2}
                />
                <Line
                  dataKey="fatalities"
                  stroke="var(--color-fatalities)"
                  strokeWidth={2}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fatalities by Industry</CardTitle>
            <CardDescription>
              Construction highest; Electricity/Gas unified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Fatalities", color: "hsl(var(--primary))" },
              }}
              className="h-64"
            >
              <BarChart data={fatalByIndustry}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Region Risk (mock heatmap)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {regionHeat.map((r) => (
                <div
                  key={r.region}
                  className="rounded-lg p-3 text-sm ring-1 ring-border"
                  style={{ background: `hsl(48 96% ${95 - r.risk * 50}%)` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.region}</span>
                    <span className="text-xs">{Math.round(r.risk * 100)}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Injuries: {r.injuries} • Fatalities: {r.fatalities}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Injuries/Fatalities by Age</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Tooltip />
                <Pie
                  data={donutAge}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                >
                  {donutAge.map((e, i) => (
                    <Cell key={i} fill={`hsl(${28 + i * 15} 90% 60%)`} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Injury Severity by Industry (stacked)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                d29_90: { label: "29–90 days", color: "hsl(28 90% 56%)" },
                d91_180: { label: "91–180 days", color: "hsl(210 90% 56%)" },
                long: { label: "180+", color: "hsl(140 60% 45%)" },
              }}
              className="h-64"
            >
              <BarChart data={stackedSeverity}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="industry" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="d29_90" stackId="a" fill="var(--color-d29_90)" />
                <Bar
                  dataKey="d91_180"
                  stackId="a"
                  fill="var(--color-d91_180)"
                />
                <Bar dataKey="long" stackId="a" fill="var(--color-long)" />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accident Type — Fatalities</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Count", color: "hsl(var(--destructive))" },
              }}
              className="h-60"
            >
              <BarChart data={accidentTypesFatal}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Accident Type — Injuries</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Count", color: "hsl(var(--primary))" },
              }}
              className="h-60"
            >
              <BarChart data={accidentTypesInjury}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employment Duration — Fatalities vs Injuries</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                fat: { label: "Fatalities", color: "hsl(var(--destructive))" },
                inj: { label: "Injuries", color: "hsl(var(--primary))" },
              }}
              className="h-64"
            >
              <BarChart
                data={[
                  { tenure: "<6m", fat: 32, inj: 28 },
                  { tenure: "6–12m", fat: 12, inj: 16 },
                  { tenure: "1–3y", fat: 14, inj: 18 },
                  { tenure: "3–10y", fat: 18, inj: 20 },
                  { tenure: ">=10y", fat: 30, inj: 24 },
                ]}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="tenure" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="fat"
                  fill="var(--color-fat)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="inj"
                  fill="var(--color-inj)"
                  radius={[6, 6, 0, 0]}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
            <p className="mt-2 text-xs text-muted-foreground">
              Fatalities highest for &lt;6 months and ≥10 years; injuries also
              highest at &lt;6 months.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Year-over-Year Deltas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>• Injuries decreased only in 2020, rising otherwise.</p>
            <p>• Fatalities spiked in 2018, decreased in 2019 and 2023.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RFM Risk Cards</CardTitle>
          <CardDescription>
            Recency, Frequency, Monetary (severity)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4 backdrop-blur supports-[backdrop-filter]:bg-background/50">
            <p className="text-sm text-muted-foreground">Recency</p>
            <p className="text-2xl font-bold">
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="rounded-lg border p-4 backdrop-blur supports-[backdrop-filter]:bg-background/50">
            <p className="text-sm text-muted-foreground">Frequency</p>
            <p className="text-2xl font-bold">High</p>
          </div>
          <div className="rounded-lg border p-4 backdrop-blur supports-[backdrop-filter]:bg-background/50">
            <p className="text-sm text-muted-foreground">Monetary (Severity)</p>
            <p className="text-2xl font-bold">High</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Region & Industry Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <ul className="space-y-1 text-sm">
            <li>Seoul, Gyeonggi, Gyeongnam = highest risk</li>
            <li>Ulsan, Jeju = lower priority</li>
          </ul>
          <ul className="space-y-1 text-sm">
            <li>Top risk: Manufacturing, Electricity/Gas</li>
            <li>Construction = potential high-severity focus</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> AI Narrative
            </CardTitle>
            <CardDescription>
              Generate and export a natural-language summary
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={generateSummary}>
              <Sparkles className="mr-2 h-4 w-4" /> Generate Report
            </Button>
            <Button variant="outline" onClick={downloadPDF}>
              <FileDown className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => navigator.clipboard.writeText(summary)}
              disabled={!summary}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Summary
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="rounded-lg border bg-green-50/40 p-4 text-sm leading-relaxed ring-1 ring-emerald-500/30">
              {summary}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Click Generate Report to produce a narrative summary.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <CardDescription />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-extrabold">{value}</p>
      </CardContent>
    </Card>
  );
}
