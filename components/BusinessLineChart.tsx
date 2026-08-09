import { formatCLP } from "@/lib/balances";
import { CURRENCY_LOCALE } from "@/config/finance.config";
import type { LineTotals } from "@/lib/businessLines";

export default function BusinessLineChart({ lines }: { lines: LineTotals[] }) {
  const max = Math.max(1, ...lines.flatMap((l) => [l.ingresos, l.gastos]));

  return (
    <div className="panel p-4">
      <p className="label-caps mb-4">Comparación histórica</p>
      <div className="space-y-4">
        {lines.map((l) => (
          <div key={l.key}>
            <div className="mb-1.5 flex items-center justify-between font-label text-xs">
              <span className="text-champagne">{l.label}</span>
              <span className={l.ingresos - l.gastos < 0 ? "text-red-400" : "text-amber"}>
                Neto {formatCLP(l.ingresos - l.gastos, CURRENCY_LOCALE)}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[10px] uppercase text-stone">Ingr.</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone/15">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold/70 to-amber"
                    style={{ width: `${Math.max((l.ingresos / max) * 100, l.ingresos > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[10px] uppercase text-stone">Gastos</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone/15">
                  <div
                    className="h-full rounded-full bg-stone/50"
                    style={{ width: `${Math.max((l.gastos / max) * 100, l.gastos > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
