import { TIPO_SIGN, type MovementType } from "@/config/finance.config";

export interface BalanceMovement {
  accountId: string;
  type: MovementType;
  amount: number;
}

export function accountBalance(
  accountId: string,
  initialBalance: number,
  movements: BalanceMovement[]
): number {
  let balance = initialBalance;
  for (const m of movements) {
    if (m.accountId !== accountId) continue;
    balance += TIPO_SIGN[m.type] * m.amount;
  }
  return balance;
}

export function formatCLP(amount: number, locale: string): string {
  return "$" + Math.round(amount || 0).toLocaleString(locale);
}
