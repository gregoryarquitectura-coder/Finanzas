export default function AlertBanner({ level, message }: { level: "warn" | "ok"; message: string }) {
  const isWarn = level === "warn";
  return (
    <div
      className={`mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-label ${
        isWarn ? "border-amber/40 bg-amber/10 text-amber" : "border-stone/20 bg-ink/40 text-stone"
      }`}
    >
      <span>{isWarn ? "⚠" : "✓"}</span>
      <span>{message}</span>
    </div>
  );
}
