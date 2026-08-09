export default function StatCard({
  label,
  value,
  negative,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="rounded-xl border border-stone/15 bg-ink/40 p-3.5 text-center">
      <p className={`font-display text-xl sm:text-2xl ${negative ? "text-red-400" : "text-champagne"}`}>
        {value}
      </p>
      <p className="label-caps mt-1">{label}</p>
    </div>
  );
}
