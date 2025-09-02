import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RiskLevelBadge from "@/components/common/RiskLevelBadge";
import { useAlerts } from "@/context/alerts";
import { Camera, TriangleAlert, Play, Pause, Megaphone } from "lucide-react";

export default function VideoDetection() {
  const videoRef = useRef(null);
  const [streamOn, setStreamOn] = useState(false);
  const [useMock, setUseMock] = useState(true);
  const [detections, setDetections] = useState([]);
  const [filter, setFilter] = useState("5m");
  const { addAlert, risk, setRisk } = useAlerts();

  useEffect(() => {
    if (!useMock && streamOn && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((s) => {
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(() => setUseMock(true));
    }
    return () => {
      const v = videoRef.current;
      const s = v && v.srcObject;
      if (s && s.getTracks) s.getTracks().forEach((t) => t.stop());
    };
  }, [useMock, streamOn]);

  useEffect(() => {
    if (!streamOn) return;
    const t = setInterval(() => {
      // Random small detection generator
      if (Math.random() < 0.25)
        simulateEvent(Math.random() < 0.5 ? "Medium" : "Low");
    }, 3000);
    return () => clearInterval(t);
  }, [streamOn]);

  const simulateEvent = (severity = "High") => {
    const item = {
      id: Math.random().toString(36).slice(2),
      time: new Date().toISOString(),
      type: Math.random() < 0.5 ? "No Helmet" : "Fall Risk",
      severity,
      box: {
        x: Math.random() * 60 + 10,
        y: Math.random() * 50 + 10,
        w: Math.random() * 20 + 10,
        h: Math.random() * 20 + 10,
      },
      acknowledged: false,
    };
    setDetections((d) => [item, ...d].slice(0, 40));
    addAlert({ ...item, link: "/video-detection" });
  };

  const filtered = detections.filter((d) => {
    const now = Date.now();
    const delta =
      filter === "5m"
        ? 5 * 60e3
        : filter === "30m"
          ? 30 * 60e3
          : 24 * 60 * 60e3;
    return now - new Date(d.time).getTime() <= delta;
  });

  return (
    <div className="container mx-auto grid gap-6 py-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="relative">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Camera className="h-6 w-6 text-primary" /> Live Stream
              </CardTitle>
              <CardDescription>Use webcam or mock CCTV preview</CardDescription>
            </div>
            <RiskLevelBadge level={risk} />
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/5 ring-1 ring-border">
              {useMock ? (
                <div className="relative h-full w-full">
                  <img
                    src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1600&auto=format&fit=crop"
                    alt="CCTV"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_28px,rgba(255,255,255,0.15)_29px)] mix-blend-overlay" />
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
              )}

              {filtered.slice(0, 5).map((d) => (
                <div
                  key={d.id}
                  className={`absolute animate-pulse-slow rounded-md ring-2 ${
                    d.severity === "High"
                      ? "ring-red-500"
                      : d.severity === "Medium"
                        ? "ring-yellow-400"
                        : "ring-emerald-500"
                  }`}
                  style={{
                    left: `${d.box.x}%`,
                    top: `${d.box.y}%`,
                    width: `${d.box.w}%`,
                    height: `${d.box.h}%`,
                  }}
                >
                  <div className="absolute -left-2 -top-2 rounded bg-background/80 px-1 text-[10px] font-semibold shadow ring-1 ring-border">
                    <span className="mr-1 inline-block size-2 animate-ping rounded-full bg-red-500" />
                    {d.type}
                  </div>
                </div>
              ))}

              {filtered[0] && (
                <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white shadow animate-bounce">
                  <TriangleAlert className="h-4 w-4" /> RISK EVENT
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => setStreamOn((s) => !s)}>
                {streamOn ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </>
                )}
              </Button>
              <Button variant="secondary" onClick={() => setUseMock((m) => !m)}>
                Toggle Mock/Webcam
              </Button>
              <Button
                variant="destructive"
                onClick={() => simulateEvent("High")}
              >
                <Megaphone className="mr-2 h-4 w-4" /> Simulate Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Detections</CardTitle>
            <CardDescription>Recent risky events</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="5m">Last 5 min</TabsTrigger>
                <TabsTrigger value="30m">30 min</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
              </TabsList>
              <TabsContent value={filter}>
                <ul className="mt-3 space-y-2">
                  {filtered.map((d) => (
                    <li
                      key={d.id}
                      className={`flex items-center justify-between rounded-lg border p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${d.severity === "High" ? "animate-[pulse_1.5s_ease-in-out_infinite]" : ""}`}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {d.type} — {d.severity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(d.time).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          Acknowledge
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">View clip</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Event preview</DialogTitle>
                            </DialogHeader>
                            <img
                              src="https://images.unsplash.com/photo-1541959833400-049d37f98c67?q=80&w=1200&auto=format&fit=crop"
                              className="rounded"
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </li>
                  ))}
                  {filtered.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No events in this window.
                    </p>
                  )}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
