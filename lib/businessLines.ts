import { LINEAS_NEGOCIO, LINEA_PERSONAL, type MovementType } from "@/config/finance.config";

export interface LineMovement {
  type: MovementType;
  category: string;
  amount: number;
}

export interface LineTotals {
  key: string;
  label: string;
  ingresos: number;
  gastos: number;
  count: number;
}

function lineaKeyForCategory(category: string): string {
  const linea = LINEAS_NEGOCIO.find((l) => (l.categorias as string[]).includes(category));
  return linea ? linea.key : LINEA_PERSONAL.key;
}

export function totalsByBusinessLine(movements: LineMovement[]): Record<string, LineTotals> {
  const result: Record<string, LineTotals> = {
    [LINEA_PERSONAL.key]: { key: LINEA_PERSONAL.key, label: LINEA_PERSONAL.label, ingresos: 0, gastos: 0, count: 0 },
  };
  for (const l of LINEAS_NEGOCIO) {
    result[l.key] = { key: l.key, label: l.label, ingresos: 0, gastos: 0, count: 0 };
  }

  for (const m of movements) {
    const key = lineaKeyForCategory(m.category);
    result[key].count += 1;
    if (m.type === "INGRESO") result[key].ingresos += m.amount;
    else if (m.type === "GASTO_FIJO" || m.type === "GASTO_VARIABLE") result[key].gastos += m.amount;
  }

  return result;
}
