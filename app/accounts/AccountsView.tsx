"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCLP } from "@/lib/balances";
import { CURRENCY_LOCALE, ROUTING_RULES } from "@/config/finance.config";
import type { AccountBalanceRow } from "@/lib/dashboard";

export default function AccountsView({ accounts }: { accounts: AccountBalanceRow[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(accounts.map((a) => [a.id, String(a.initialBalance)]))
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  const total = accounts.reduce((sum, a) => sum + a.balance, 0);

  async function saveInitialBalance(id: string) {
    setPendingId(id);
    await fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initialBalance: Number(values[id]) || 0 }),
    });
    setPendingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="panel overflow-x-auto p-4">
        <table className="w-full min-w-[480px] border-collapse font-label text-sm">
          <thead>
            <tr className="border-b border-stone/20 text-left">
              <th className="label-caps pb-2.5 font-normal">Cuenta</th>
              <th className="label-caps pb-2.5 font-normal">Saldo inicial</th>
              <th className="label-caps pb-2.5 text-right font-normal">Saldo actual</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-b border-stone/10">
                <td className="py-3 pr-3">
                  <p className="text-champagne">{a.name}</p>
                  <p className="text-xs text-stone">{a.function}</p>
                </td>
                <td className="py-3 pr-3">
                  <input
                    type="number"
                    value={values[a.id]}
                    onChange={(e) => setValues((v) => ({ ...v, [a.id]: e.target.value }))}
                    onBlur={() => {
                      if (Number(values[a.id]) !== a.initialBalance) saveInitialBalance(a.id);
                    }}
                    disabled={pendingId === a.id}
                    className="input-field w-32 !py-2"
                  />
                </td>
                <td className="py-3 text-right font-semibold text-champagne">
                  {formatCLP(a.balance, CURRENCY_LOCALE)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 font-semibold text-champagne">TOTAL</td>
              <td className="pt-3" />
              <td className="pt-3 text-right font-semibold text-amber">
                {formatCLP(total, CURRENCY_LOCALE)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="panel p-4">
        <p className="label-caps mb-2">Regla dura de ruteo</p>
        <p className="font-label text-sm text-stone">
          {ROUTING_RULES.map((r) => r.message).join(" · ")}. Si registras un movimiento fuera de esta
          regla, queda marcado en Movimientos — no se bloquea, solo se avisa.
        </p>
      </div>
    </div>
  );
}
