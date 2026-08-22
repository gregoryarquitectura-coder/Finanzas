"use client";

import Link from "next/link";
import { formatCLP } from "@/lib/balances";
import { TIPO_LABELS, CURRENCY_LOCALE } from "@/config/finance.config";
import LineaBadge from "@/components/LineaBadge";
import type { MovementRow } from "@/lib/movements";

function isExpense(type: string) {
  return type === "GASTO_FIJO" || type === "GASTO_VARIABLE";
}

function exportCSV(movements: MovementRow[]) {
  const header = ["Fecha", "Mes", "Tipo", "Categoria", "Descripcion", "Monto", "Cuenta", "Notas"];
  const rows = movements.map((m) => [
    m.date,
    m.date.slice(0, 7),
    TIPO_LABELS[m.type],
    m.category,
    m.description,
    String(m.amount),
    m.accountName,
    m.notes,
  ]);
  const csv =
    header.join(";") +
    "\n" +
    rows.map((r) => r.map((v) => `"${(v ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `movimientos_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

export default function MovementsView({ movements }: { movements: MovementRow[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-label text-sm text-stone">
          {movements.length} movimiento{movements.length === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportCSV(movements)} className="btn-ghost !px-4 !py-2 text-[11px]">
            Exportar CSV
          </button>
          <Link href="/movements/scan" className="btn-ghost !px-4 !py-2 text-[11px]">
            📷 Escanear boleta
          </Link>
          <Link href="/movements/new" className="btn-primary !px-4 !py-2 text-[11px]">
            + Nuevo movimiento
          </Link>
        </div>
      </div>

      <div className="panel divide-y divide-stone/10">
        {movements.length === 0 && (
          <p className="p-6 text-center font-label text-sm text-stone/60">
            Aún no tienes movimientos registrados.
          </p>
        )}
        {movements.map((m) => (
          <Link
            key={m.id}
            href={`/movements/${m.id}`}
            className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-ink/40"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-label text-sm text-champagne">
                {m.description || "(sin descripción)"}
              </p>
              <p className="label-caps mt-0.5 truncate normal-case tracking-normal text-stone/80">
                {m.date} · {TIPO_LABELS[m.type]} · {m.accountName}
                {m.violation && <span className="text-amber"> · ⚠ {m.violation}</span>}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className={`font-label text-sm font-semibold ${isExpense(m.type) ? "text-champagne" : "text-amber"}`}>
                {isExpense(m.type) ? "-" : "+"}
                {formatCLP(m.amount, CURRENCY_LOCALE)}
              </span>
              <LineaBadge category={m.category} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
