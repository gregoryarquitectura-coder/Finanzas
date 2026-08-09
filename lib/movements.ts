import { prisma } from "./prisma";
import { formatDateStr } from "./dates";
import { routingViolation } from "./routing";
import type { MovementType } from "@/config/finance.config";

export interface MovementRow {
  id: string;
  date: string;
  type: MovementType;
  category: string;
  description: string;
  amount: number;
  notes: string;
  accountId: string;
  accountKey: string;
  accountName: string;
  violation: string | null;
}

export async function getMovements(): Promise<MovementRow[]> {
  const movements = await prisma.movement.findMany({
    include: { account: true },
    orderBy: { date: "desc" },
  });

  return movements.map((m) => ({
    id: m.id,
    date: formatDateStr(m.date),
    type: m.type as MovementType,
    category: m.category,
    description: m.description,
    amount: m.amount,
    notes: m.notes,
    accountId: m.accountId,
    accountKey: m.account.key,
    accountName: m.account.name,
    violation: routingViolation({
      type: m.type as MovementType,
      category: m.category,
      accountKey: m.account.key,
    }),
  }));
}

export async function getMovement(id: string): Promise<MovementRow | null> {
  const m = await prisma.movement.findUnique({ where: { id }, include: { account: true } });
  if (!m) return null;
  return {
    id: m.id,
    date: formatDateStr(m.date),
    type: m.type as MovementType,
    category: m.category,
    description: m.description,
    amount: m.amount,
    notes: m.notes,
    accountId: m.accountId,
    accountKey: m.account.key,
    accountName: m.account.name,
    violation: routingViolation({
      type: m.type as MovementType,
      category: m.category,
      accountKey: m.account.key,
    }),
  };
}
