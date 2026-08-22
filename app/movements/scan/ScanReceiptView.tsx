"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

function resizeImage(file: File, maxDim = 1600, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("No se pudo procesar la imagen"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("No se pudo procesar la imagen"));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen"));
    };
    img.src = url;
  });
}

export default function ScanReceiptView() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setPreview(URL.createObjectURL(file));
    setAnalyzing(true);
    try {
      const resized = await resizeImage(file);
      const formData = new FormData();
      formData.append("image", resized, "boleta.jpg");
      const res = await fetch("/api/scan-receipt", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "No se pudo analizar la boleta");

      const e = body.extraction as {
        amount: number | null;
        merchant: string;
        date: string | null;
        category: string | null;
      };
      const params = new URLSearchParams();
      params.set("scanned", "1");
      params.set("type", "GASTO_VARIABLE");
      if (e.amount != null) params.set("amount", String(e.amount));
      if (e.merchant) params.set("description", e.merchant);
      if (e.date) params.set("date", e.date);
      if (e.category) params.set("category", e.category);
      router.push(`/movements/new?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo analizar la boleta");
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={analyzing}
        className="panel flex w-full flex-col items-center gap-4 border-dashed p-10 text-center transition-colors hover:border-gold/40 disabled:opacity-60"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa de la boleta" className="max-h-64 rounded-lg object-contain" />
        ) : (
          <>
            <span className="text-4xl">📷</span>
            <p className="font-label text-sm text-champagne">Toca para tomar una foto o elegir una captura</p>
            <p className="label-caps">JPG o PNG</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </button>

      {analyzing && (
        <div className="panel flex items-center gap-3 p-4">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber" />
          <p className="font-label text-sm text-stone">Leyendo la boleta con IA…</p>
        </div>
      )}

      {error && (
        <div className="panel border-red-400/30 p-4">
          <p className="font-label text-sm text-red-400">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setPreview(null);
            }}
            className="btn-ghost mt-3 !px-4 !py-2 text-[11px]"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
