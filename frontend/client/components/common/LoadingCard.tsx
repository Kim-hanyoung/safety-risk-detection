import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function LoadingCard({
  progress = 0,
  title = "Safety First",
  className = "",
}) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <div
      className={cn(
        "rounded-lg border bg-card/60 p-6 text-center shadow-sm ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/40",
        className,
      )}
    >
      <h4 className="mb-3 font-semibold text-foreground">{title}</h4>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span
          className="text-2xl icon-bounce"
          style={{ animationDelay: "0.1s" }}
        >
          ⛑️
        </span>
        <span
          className="text-2xl icon-pulse"
          style={{ animationDelay: "0.2s" }}
        >
          🚧
        </span>
        <span
          className="text-2xl icon-rotate"
          style={{ animationDelay: "0.3s" }}
        >
          ⚠️
        </span>
        <span
          className="text-2xl icon-bounce"
          style={{ animationDelay: "0.4s" }}
        >
          🚨
        </span>
        <span
          className="text-2xl icon-pulse"
          style={{ animationDelay: "0.5s" }}
        >
          🦺
        </span>
        <span
          className="text-2xl icon-rotate"
          style={{ animationDelay: "0.6s" }}
        >
          🛡️
        </span>
      </div>
      <div className="mt-4 text-sm font-medium">In Process…</div>
      <div className="mx-auto mt-1 h-2 w-full max-w-sm overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{pct}%</div>
    </div>
  );
}
