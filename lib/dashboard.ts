import { prisma } from "./prisma";
import { formatDateStr, monthOf, addMonths, currentMonthStr } from "./dates";
import { accountBalance } from "./balances";
import { routingViolation } from "./routing";
import { totalsByBusinessLine, type LineTotals } from "./businessLines";
import { CATEGORIAS_CAJA_NEGOCIO_RMA } from "@/config/finance.config";
import type { MovementType } from "@/config/finance.config";

export interface AccountBalanceRow {
  id: string;
  key: string;
  name: string;
  function: string;
  initialBalance: number;
  balance: number;
}

export interface TrendPoint {
  month: string;
  ingresos: number;
  gastos: number;
}

export interface CategoryAmount {
  category: string;
  amount: number;
}

export interface DashboardData {
  month: string;
  availableMonths: string[];
  ingresos: number;
  gastos: number;
  ahorro: number;
  inversion: number;
  flujoNeto: number;
  saldoTotal: number;
  accountBalances: AccountBalanceRow[];
  businessLines: Record<string, LineTotals>;
  trend: TrendPoint[];
  categoryBreakdown: CategoryAmount[];
  violationCount: number;
  alert: { level: "warn" | "ok"; message: string };
}

export async function getDashboardData(month: string): Promise<DashboardData> {
  const accounts = await prisma.account.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  const allMovements = await prisma.movement.findMany({
    orderBy: { date: "desc" },
  });

  const movsPlain = allMovements.map((m) => ({
    accountId: m.accountId,
    type: m.type as MovementType,
    category: m.category,
    amount: m.amount,
    dateStr: formatDateStr(m.date),
  }));

  const accountBalances: AccountBalanceRow[] = accounts.map((a) => ({
    id: a.id,
    key: a.key,
    name: a.name,
    function: a.function,
    initialBalance: a.initialBalance,
    balance: accountBalance(a.id, a.initialBalance, movsPlain),
  }));
  const saldoTotal = accountBalances.reduce((sum, a) => sum + a.balance, 0);

  const monthSet = new Set(movsPlain.map((m) => monthOf(m.dateStr)));
  monthSet.add(currentMonthStr());
  const availableMonths = [...monthSet].sort().reverse();

  const movMes = movsPlain.filter((m) => monthOf(m.dateStr) === month);
  const ingresos = sumByType(movMes, "INGRESO");
  const gastos = sumByType(movMes, "GASTO_FIJO") + sumByType(movMes, "GASTO_VARIABLE");
  const ahorro = sumByType(movMes, "AHORRO");
  const inversion = sumByType(movMes, "INVERSION");
  const flujoNeto = ingresos - gastos - ahorro - inversion;

  const businessLines = totalsByBusinessLine(movsPlain);

  const trend: TrendPoint[] = [];
  let cursor = month;
  for (let i = 0; i < 6; i++) {
    const monthMovs = movsPlain.filter((m) => monthOf(m.dateStr) === cursor);
    trend.unshift({
      month: cursor,
      ingresos: sumByType(monthMovs, "INGRESO"),
      gastos: sumByType(monthMovs, "GASTO_FIJO") + sumByType(monthMovs, "GASTO_VARIABLE"),
    });
    cursor = addMonths(cursor, -1);
  }

  const catTotals = new Map<string, number>();
  for (const m of movMes) {
    if (m.type !== "GASTO_FIJO" && m.type !== "GASTO_VARIABLE") continue;
    catTotals.set(m.category, (catTotals.get(m.category) ?? 0) + m.amount);
  }
  const categoryBreakdown: CategoryAmount[] = [...catTotals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const keyById = new Map(accounts.map((a) => [a.id, a.key]));
  const violations = movsPlain.filter((m) => {
    const accountKey = keyById.get(m.accountId);
    if (!accountKey) return false;
    return !!routingViolation({ type: m.type, category: m.category, accountKey });
  });

  const negocioAccount = accountBalances.find((a) => a.key === "negociorma");
  const ingresosNegocioHistorico = movsPlain
    .filter((m) => m.type === "INGRESO" && (CATEGORIAS_CAJA_NEGOCIO_RMA as string[]).includes(m.category))
    .reduce((sum, m) => sum + m.amount, 0);

  let alert: DashboardData["alert"];
  if (violations.length > 0) {
    alert = {
      level: "warn",
      message: `Hay ${violations.length} movimiento(s) que no respetan la regla de ruteo (revísalos en Movimientos).`,
    };
  } else if (ingresosNegocioHistorico > 0 && negocioAccount && negocioAccount.balance <= 0) {
    alert = {
      level: "warn",
      message:
        "Registraste ingresos de RMA/Remodelación pero la cuenta Falabella sigue en $0 — probablemente ese dinero se está mezclando con lo personal.",
    };
  } else {
    alert = { level: "ok", message: "Sin mezclas detectadas este período." };
  }

  return {
    month,
    availableMonths,
    ingresos,
    gastos,
    ahorro,
    inversion,
    flujoNeto,
    saldoTotal,
    accountBalances,
    businessLines,
    trend,
    categoryBreakdown,
    violationCount: violations.length,
    alert,
  };
}

function sumByType(movs: { type: MovementType; amount: number }[], type: MovementType): number {
  return movs.filter((m) => m.type === type).reduce((sum, m) => sum + m.amount, 0);
}
