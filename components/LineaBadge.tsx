import { LINEAS_NEGOCIO, LINEA_PERSONAL } from "@/config/finance.config";

const COLORS: Record<string, string> = {
  rma: "border-gold/40 bg-gold/10 text-gold",
  remo: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  personal: "border-stone/30 bg-stone/10 text-stone",
};

export function lineaKeyForCategory(category: string): string {
  const linea = LINEAS_NEGOCIO.find((l) => (l.categorias as string[]).includes(category));
  return linea ? linea.key : LINEA_PERSONAL.key;
}

export default function LineaBadge({ category }: { category: string }) {
  const key = lineaKeyForCategory(category);
  const cls = COLORS[key] ?? COLORS.personal;
  return (
    <span className={`rounded-full border px-2.5 py-1 font-label text-[10px] uppercase tracking-widest2 ${cls}`}>
      {category}
    </span>
  );
}
