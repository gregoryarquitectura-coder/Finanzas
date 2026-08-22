"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TIPOS_LIST, CATEGORIAS, TIPO_LABELS, type MovementType } from "@/config/finance.config";
import { routingViolation } from "@/lib/routing";
import { todayStr } from "@/lib/dates";

interface AccountOption {
  id: string;
  key: string;
  name: string;
}

interface MovementInitial {
  id: string;
  date: string;
  type: MovementType;
  category: string;
  accountId: string;
  description: string;
  amount: number;
  notes: string;
}

interface MovementPrefill {
  date?: string;
  type?: MovementType;
  category?: string;
  description?: string;
  amount?: number;
}

export default function MovementForm({
  accounts,
  initial,
  prefill,
  fromScan,
}: {
  accounts: AccountOption[];
  initial?: MovementInitial;
  prefill?: MovementPrefill;
  fromScan?: boolean;
}) {
  const router = useRouter();
  const isEdit = !!initial;

  const [date, setDate] = useState(initial?.date ?? prefill?.date ?? todayStr());
  const [type, setType] = useState<MovementType>(initial?.type ?? prefill?.type ?? "INGRESO");
  const [category, setCategory] = useState(initial?.category ?? prefill?.category ?? CATEGORIAS[0]);
  const [accountId, setAccountId] = useState(initial?.accountId ?? accounts[0]?.id ?? "");
  const [description, setDescription] = useState(initial?.description ?? prefill?.description ?? "");
  const [amount, setAmount] = useState(
    initial ? String(initial.amount) : prefill?.amount != null ? String(prefill.amount) : ""
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const violation = selectedAccount
    ? routingViolation({ type, category, accountKey: selectedAccount.key })
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { date, type, category, accountId, description, amount: Number(amount) || 0, notes };
    const res = isEdit
      ? await fetch(`/api/movements/${initial!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/movements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    setSaving(false);
    if (res.ok) {
      router.push("/movements");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm("¿Eliminar este movimiento?")) return;
    setDeleting(true);
    await fetch(`/api/movements/${initial.id}`, { method: "DELETE" });
    router.push("/movements");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-5">
      {fromScan && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm font-label text-amber">
          <span>📷</span>
          <span>
            Datos leídos automáticamente por OCR (sin IA) — el reconocimiento de texto no es perfecto, revisa
            <strong> todos los campos</strong> (sobre todo el monto) y elige la tarjeta que usaste.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-caps mb-1.5 block">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="label-caps mb-1.5 block">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value as MovementType)} className="input-field">
            {TIPOS_LIST.map((t) => (
              <option key={t} value={t}>
                {TIPO_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-caps mb-1.5 block">Categoría</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-caps mb-1.5 block">Cuenta</label>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="input-field">
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label-caps mb-1.5 block">Descripción</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Venta mesa escultórica cliente X"
          className="input-field"
        />
      </div>

      <div>
        <label className="label-caps mb-1.5 block">Monto</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="label-caps mb-1.5 block">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field min-h-[70px]"
        />
      </div>

      <p className={`font-label text-xs ${violation ? "text-amber" : "text-stone"}`}>
        {violation ? `⚠ ${violation}` : "✓ Ruteo correcto"}
      </p>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-40">
          {saving ? "Guardando…" : "Guardar movimiento"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full border border-red-400/30 px-5 py-2.5 font-label text-xs uppercase tracking-[0.18em] text-red-400 transition-colors hover:border-red-400/60 disabled:opacity-40"
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </button>
        )}
      </div>
    </form>
  );
}
