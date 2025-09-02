import { Bell, FileDown, ArrowUpRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAlerts } from "@/context/alerts";
import { Link } from "react-router-dom";

export default function Notifications() {
  const { alerts } = useAlerts();
  return (
    <Sheet>
      <SheetTrigger className="relative rounded-md p-2 hover:bg-accent">
        <Bell className="h-5 w-5" />
        {alerts.some((a) => !a.acknowledged) && (
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[420px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Alerts
            <Link
              to="/risk-report"
              className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs hover:bg-accent"
            >
              <FileDown className="h-4 w-4" /> Latest PDF
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {alerts.map((a) => (
            <Link
              key={a.id}
              to={a.link}
              className="block rounded-lg border p-3 hover:bg-accent/40"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {a.type} — {a.severity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.time).toLocaleString()}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
          {alerts.length === 0 && (
            <p className="text-sm text-muted-foreground">No alerts yet.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
