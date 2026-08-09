import { formatCLP } from "@/lib/balances";
import { CURRENCY_LOCALE } from "@/config/finance.config";
import type { CategoryAmount } from "@/lib/dashboard";

export default function CategoryBarList({ items }: { items: CategoryAmount[] }) {
  const max = Math.max(1, ...items.map((i) => i.amount));

  return (
    <div className="panel p-4">
      <p className="label-caps mb-4">Gastos del mes por categoría</p>
      {items.length === 0 ? (
        <p className="font-label text-sm text-stone/60">Sin gastos este mes.</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.category}>
              <div className="mb-1 flex items-center justify-between font-label text-xs">
                <span className="text-champagne">{item.category}</span>
                <span className="text-stone">{formatCLP(item.amount, CURRENCY_LOCALE)}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold/70 to-amber transition-all duration-500"
                  style={{ width: `${Math.max((item.amount / max) * 100, 3)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
