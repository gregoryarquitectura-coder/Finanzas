import { formatCLP } from "@/lib/balances";
import { CURRENCY_LOCALE } from "@/config/finance.config";
import type { TrendPoint } from "@/lib/dashboard";

function monthLabel(monthStr: string): string {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("es", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

export default function MonthTrendChart({ trend }: { trend: TrendPoint[] }) {
  const max = Math.max(1, ...trend.flatMap((t) => [t.ingresos, t.gastos]));

  return (
    <div className="panel p-4">
      <p className="label-caps mb-4">Ingresos vs gastos — últimos 6 meses</p>
      <div className="flex h-40 items-end justify-between gap-3">
        {trend.map((t) => (
          <div key={t.month} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-32 w-full items-end justify-center gap-1">
              <div
                className="w-1/2 rounded-t-sm bg-gradient-to-t from-gold/70 to-amber transition-all duration-500"
                style={{ height: `${Math.max((t.ingresos / max) * 100, t.ingresos > 0 ? 3 : 0)}%` }}
                title={`Ingresos: ${formatCLP(t.ingresos, CURRENCY_LOCALE)}`}
              />
              <div
                className="w-1/2 rounded-t-sm bg-stone/50 transition-all duration-500"
                style={{ height: `${Math.max((t.gastos / max) * 100, t.gastos > 0 ? 3 : 0)}%` }}
                title={`Gastos: ${formatCLP(t.gastos, CURRENCY_LOCALE)}`}
              />
            </div>
            <span className="font-label text-[10px] capitalize text-stone">{monthLabel(t.month)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1.5 font-label text-[11px] text-stone">
          <span className="h-2 w-2 rounded-sm bg-amber" /> Ingresos
        </span>
        <span className="flex items-center gap-1.5 font-label text-[11px] text-stone">
          <span className="h-2 w-2 rounded-sm bg-stone/50" /> Gastos
        </span>
      </div>
    </div>
  );
}
