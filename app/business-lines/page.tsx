import PageHeader from "@/components/PageHeader";
import NavBar from "@/components/NavBar";
import StatCard from "@/components/StatCard";
import BusinessLineChart from "@/components/BusinessLineChart";
import { prisma } from "@/lib/prisma";
import { totalsByBusinessLine } from "@/lib/businessLines";
import { formatCLP } from "@/lib/balances";
import { CURRENCY_LOCALE } from "@/config/finance.config";
import type { MovementType } from "@/config/finance.config";

export const dynamic = "force-dynamic";

export default async function BusinessLinesPage() {
  const movements = await prisma.movement.findMany({
    select: { type: true, category: true, amount: true },
  });
  const movsPlain = movements.map((m) => ({ type: m.type as MovementType, category: m.category, amount: m.amount }));
  const totals = totalsByBusinessLine(movsPlain);
  const lines = Object.values(totals);

  return (
    <>
      <PageHeader
        eyebrow="Contabilidad separada"
        title="Líneas de Negocio"
        subtitle="RMA, Remodelación y Personal — separados, como deben estar."
      />

      <div className="space-y-6">
        <BusinessLineChart lines={lines} />

        {lines.map((l) => (
          <div key={l.key} className="panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-label text-[11px] uppercase tracking-widest2 text-gold">
                {l.label}
              </span>
              <span className="font-label text-xs text-stone">
                {l.count} movimiento{l.count === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Ingresos" value={formatCLP(l.ingresos, CURRENCY_LOCALE)} />
              <StatCard label="Gastos" value={formatCLP(l.gastos, CURRENCY_LOCALE)} />
              <StatCard
                label="Neto"
                value={formatCLP(l.ingresos - l.gastos, CURRENCY_LOCALE)}
                negative={l.ingresos - l.gastos < 0}
              />
            </div>
          </div>
        ))}
      </div>

      <NavBar />
    </>
  );
}
