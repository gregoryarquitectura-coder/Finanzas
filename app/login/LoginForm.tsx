"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        setError("PIN incorrecto");
        setPin("");
        return;
      }
      const next = searchParams.get("next") || "/dashboard";
      router.replace(next);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="panel w-full max-w-xs space-y-5 p-8">
      <div className="text-center">
        <p className="label-caps mb-2">Acceso</p>
        <h1 className="font-display text-3xl text-champagne">Finanzas RMA</h1>
      </div>

      <input
        autoFocus
        inputMode="numeric"
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="PIN"
        className="input-field text-center text-xl tracking-[0.5em]"
      />

      {error && <p className="text-center text-xs text-red-400">{error}</p>}

      <button type="submit" disabled={isPending || !pin} className="btn-primary w-full disabled:opacity-40">
        {isPending ? "Verificando…" : "Entrar"}
      </button>
    </form>
  );
}
