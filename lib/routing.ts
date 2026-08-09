import { ROUTING_RULES, type MovementType } from "@/config/finance.config";

export interface RoutableMovement {
  type: MovementType;
  category: string;
  accountKey: string;
}

/** Devuelve el mensaje de la primera regla violada, o null si todo está en orden. */
export function routingViolation(m: RoutableMovement): string | null {
  for (const rule of ROUTING_RULES) {
    if (!rule.check(m)) return rule.message;
  }
  return null;
}
