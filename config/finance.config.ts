/**
 * Único archivo que define cuentas, tipos de movimiento, categorías, líneas
 * de negocio y la "regla dura de ruteo" (qué tipo/categoría debe caer en
 * qué cuenta). Igual que en habits.config.ts: esto siembra la base de datos
 * la primera vez; después las cuentas se administran desde la app.
 *
 * - Agregar/quitar una cuenta, tipo o categoría por defecto: una línea aquí.
 * - Agregar una regla de ruteo nueva: un objeto más en ROUTING_RULES.
 * - Cambiar si un tipo suma o resta del saldo: una línea en TIPO_SIGN.
 */

export type MovementType =
  | "INGRESO"
  | "GASTO_FIJO"
  | "GASTO_VARIABLE"
  | "AHORRO"
  | "INVERSION";

export interface AccountDefinition {
  key: string;
  name: string;
  function: string;
  initialBalance: number;
  sortOrder: number;
}

export const DEFAULT_ACCOUNTS: AccountDefinition[] = [
  { key: "santander", name: "Santander", function: "Inversiones", initialBalance: 50000, sortOrder: 1 },
  { key: "mercadopago", name: "Mercado Pago", function: "Ahorro / Fondo Emergencia", initialBalance: 200000, sortOrder: 2 },
  { key: "bancoestado", name: "BancoEstado", function: "Gastos diarios (fijos y variables)", initialBalance: 0, sortOrder: 3 },
  { key: "negociorma", name: "Falabella", function: "Caja del negocio RMA / Remodelación", initialBalance: 0, sortOrder: 4 },
  { key: "efectivo", name: "Efectivo", function: "Gastos en efectivo puntuales", initialBalance: 0, sortOrder: 5 },
];

/** Orden en que aparecen los tipos en los selects del formulario. */
export const TIPOS_LIST: MovementType[] = [
  "INGRESO",
  "GASTO_FIJO",
  "GASTO_VARIABLE",
  "AHORRO",
  "INVERSION",
];

export const TIPO_LABELS: Record<MovementType, string> = {
  INGRESO: "Ingreso",
  GASTO_FIJO: "Gasto Fijo",
  GASTO_VARIABLE: "Gasto Variable",
  AHORRO: "Ahorro",
  INVERSION: "Inversion",
};

/** +1 = suma al saldo de la cuenta, -1 = resta. Cambiar esto reordena toda la lógica de saldos. */
export const TIPO_SIGN: Record<MovementType, 1 | -1> = {
  INGRESO: 1,
  GASTO_FIJO: -1,
  GASTO_VARIABLE: -1,
  AHORRO: 1,
  INVERSION: 1,
};

export const CATEGORIAS = [
  "Negocio RMA",
  "Remodelacion / Obra",
  "Trabajo Externo",
  "Servicios",
  "Transporte",
  "Comida",
  "Educacion",
  "Salud",
  "Vicios y Ocio",
  "Fondo Emergencia",
  "Inversion",
  "Casa",
  "Impuestos",
  "Varios",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export interface LineaNegocio {
  key: string;
  label: string;
  categorias: Categoria[];
}

/**
 * Líneas de negocio explícitas. Cualquier movimiento cuya categoría no esté
 * en ninguna de estas listas cae automáticamente en "Personal / Otros" —
 * no hay que mantener esa lista a mano.
 *
 * Agregar una línea acá SOLO la separa en el Dashboard/Líneas de Negocio —
 * no le impone ninguna cuenta. Si además necesita una regla de ruteo propia
 * (como RMA/Remodelación → Falabella), agrégala aparte en ROUTING_RULES.
 */
export const LINEAS_NEGOCIO: LineaNegocio[] = [
  { key: "rma", label: "RMA (venta de piezas)", categorias: ["Negocio RMA"] },
  { key: "remo", label: "Remodelación / Obra", categorias: ["Remodelacion / Obra"] },
  { key: "trabajo", label: "Trabajo Externo (freelance / McLarens)", categorias: ["Trabajo Externo"] },
];

/** Categorías que la regla "negocio-falabella" obliga a ir a la cuenta Falabella. */
const CATEGORIAS_CAJA_NEGOCIO_RMA: Categoria[] = ["Negocio RMA", "Remodelacion / Obra"];

export const LINEA_PERSONAL = { key: "personal", label: "Personal / Otros" };

export interface RoutingRule {
  id: string;
  message: string;
  /** true si el movimiento respeta la regla. */
  check: (m: { type: MovementType; category: string; accountKey: string }) => boolean;
}

/**
 * Regla dura de ruteo: qué tipo/categoría debería caer en qué cuenta.
 * No bloquea el guardado — solo marca el movimiento como "fuera de regla"
 * en la UI, igual que en la versión de Google Sheets.
 */
export const ROUTING_RULES: RoutingRule[] = [
  {
    id: "inversion-santander",
    message: "Inversión debería ir a Santander",
    check: (m) => m.type !== "INVERSION" || m.accountKey === "santander",
  },
  {
    id: "ahorro-mercadopago",
    message: "Ahorro debería ir a Mercado Pago",
    check: (m) => m.type !== "AHORRO" || m.accountKey === "mercadopago",
  },
  {
    id: "negocio-falabella",
    message: "Negocio RMA/Remodelación debería ir a Falabella",
    check: (m) =>
      !(CATEGORIAS_CAJA_NEGOCIO_RMA as string[]).includes(m.category) || m.accountKey === "negociorma",
  },
];

/** Locale usado para formatear montos ($1.234.567). Cambiar aquí si no es Chile. */
export const CURRENCY_LOCALE = "es-CL";
