export default function RiskLevelBadge({ level = "Green", small = false }) {
  const color =
    level === "Red"
      ? "bg-red-500/15 text-red-700 ring-red-500/30"
      : level === "Yellow"
        ? "bg-yellow-400/20 text-yellow-700 ring-yellow-400/30"
        : "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30";
  const label =
    level === "Red" ? "High" : level === "Yellow" ? "Elevated" : "Normal";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${color}`}
    >
      <span
        className={`relative grid place-items-center ${small ? "size-2" : "size-2.5"}`}
      >
        <span className="absolute inset-0 rounded-full bg-current opacity-30 animate-ping" />
        <span className="size-full rounded-full bg-current" />
      </span>
      <span>Risk: {label}</span>
    </span>
  );
}
