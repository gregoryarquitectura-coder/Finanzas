import { prisma } from "./prisma";
import { accountBalance } from "./balances";
import type { AccountBalanceRow } from "./dashboard";
import type { MovementType } from "@/config/finance.config";

export async function getAccountBalances(): Promise<AccountBalanceRow[]> {
  const accounts = await prisma.account.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  const movements = await prisma.movement.findMany({
    select: { accountId: true, type: true, amount: true },
  });
  const movsPlain = movements.map((m) => ({ accountId: m.accountId, type: m.type as MovementType, amount: m.amount }));

  return accounts.map((a) => ({
    id: a.id,
    key: a.key,
    name: a.name,
    function: a.function,
    initialBalance: a.initialBalance,
    balance: accountBalance(a.id, a.initialBalance, movsPlain),
  }));
}
