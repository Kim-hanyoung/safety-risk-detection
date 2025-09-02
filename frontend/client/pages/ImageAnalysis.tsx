import { useEffect, useRef, useState } from "react";
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
import LoadingCard from "@/components/common/LoadingCard";
import {
  BadgeAlert,
  Camera,
  FileImage,
  Loader2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

export default function ImageAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<
    Array<{
      label: string;
      severity: "low" | "medium" | "high";
      description: string;
    }>
  >([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const runAnalysis = async (src: string) => {
    setAnalyzing(true);
    setProgress(0);
    setResults([]);
    const start = Date.now();

    const timer = setInterval(() => {
      setProgress((p) => Math.min(100, p + Math.random() * 20));
    }, 300);

    await new Promise((r) => setTimeout(r, 2200 + Math.random() * 600));
    clearInterval(timer);
    setProgress(100);

    // Mocked results
    setResults([
      {
        label: "No Helmet Detected",
        severity: "high",
        description: "A person appears without proper head protection.",
      },
      {
        label: "Hi-Vis Clothing",
        severity: "low",
        description: "High-visibility jacket detected.",
      },
      {
        label: "Blocked Pathway",
        severity: "medium",
        description: "Potential obstruction in walkway.",
      },
    ]);

    // Ensure spinner is visible briefly
    const elapsed = Date.now() - start;
    if (elapsed < 1000) await new Promise((r) => setTimeout(r, 1000 - elapsed));
    setAnalyzing(false);
  };

  const onSubmit = async () => {
    if (preview) await runAnalysis(preview);
  };

  const useDemo = () => {
    const demo =
      "https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=1600&auto=format&fit=crop";
    setPreview(demo);
    setFile(null);
  };

  return (
    <div className="container mx-auto grid gap-6 py-10 lg:grid-cols-2">
      <Card className="relative overflow-hidden">
        <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/20 blur-2xl" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Camera className="h-6 w-6 text-primary" /> Image Analysis
          </CardTitle>
          <CardDescription>
            Upload a photo to detect PPE and hazards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button onClick={() => inputRef.current?.click()} variant="outline">
              <FileImage className="mr-2 h-4 w-4" /> Choose
            </Button>
          </div>
          <div className="flex gap-3">
            <Button onClick={onSubmit} disabled={!preview || analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing
                </>
              ) : (
                <>Run Analysis</>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={useDemo}
              disabled={analyzing}
            >
              Use demo image
            </Button>
          </div>
          {analyzing ? (
            <div className="mt-2">
              <LoadingCard progress={progress} />
            </div>
          ) : (
            <Progress value={progress} />
          )}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-2 aspect-video w-full rounded-lg object-cover shadow-sm ring-1 ring-border"
            />
          )}
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <span className="pointer-events-none absolute -left-10 -bottom-10 size-40 rounded-full bg-yellow-400/20 blur-2xl" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            Results
          </CardTitle>
          <CardDescription>Detected items and risk factors.</CardDescription>
        </CardHeader>
        <CardContent>
          {analyzing && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Analyzing image…
            </div>
          )}
          {!analyzing && results.length === 0 && (
            <div className="text-muted-foreground">
              Upload an image and click Run Analysis to see results.
            </div>
          )}
          {!analyzing && results.length > 0 && (
            <ul className="space-y-3">
              {results.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between rounded-lg border bg-card/60 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/40"
                >
                  <div className="flex items-start gap-3">
                    {r.severity === "high" ? (
                      <TriangleAlert className="mt-0.5 h-5 w-5 text-red-500" />
                    ) : r.severity === "medium" ? (
                      <BadgeAlert className="mt-0.5 h-5 w-5 text-yellow-500" />
                    ) : (
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-500" />
                    )}
                    <div>
                      <p className="font-medium">{r.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {r.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.severity === "high"
                        ? "bg-red-500/10 text-red-600 ring-1 ring-red-500/30"
                        : r.severity === "medium"
                          ? "bg-yellow-400/10 text-yellow-600 ring-1 ring-yellow-400/30"
                          : "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/30"
                    }`}
                  >
                    {r.severity.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
