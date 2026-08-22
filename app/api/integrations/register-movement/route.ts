import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toDbDate, isValidDateStr, todayStr } from "@/lib/dates";
import { TIPO_LABELS, CATEGORIAS, type MovementType } from "@/config/finance.config";

const VALID_TYPES = Object.keys(TIPO_LABELS) as MovementType[];

/**
 * Endpoint de integración para otras apps del ecosistema RMA (ej. Cotizaciones)
 * que necesitan registrar un movimiento sin que haya una sesión de navegador
 * con el PIN de por medio. Se autentica con un secreto compartido, no con el
 * PIN — por eso está en la lista de rutas públicas del middleware y hace su
 * propia verificación acá.
 */
export async function POST(req: NextRequest) {
  const key = req.headers.get("x-integration-key");
  const expected = process.env.INTEGRATION_SECRET;
  if (!expected || key !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const date = isValidDateStr(body.date) ? body.date : todayStr();
  const type = body.type;
  const category = body.category;
  const accountKey = body.accountKey;
  const amount = Number(body.amount);
  const description = typeof body.description === "string" ? body.description : "";
  const notes = typeof body.notes === "string" ? body.notes : "";

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }
  if (!(CATEGORIAS as readonly string[]).includes(category)) {
    return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
  }

  const account = await prisma.account.findUnique({ where: { key: accountKey } });
  if (!account) {
    return NextResponse.json({ error: `Cuenta desconocida: ${accountKey}` }, { status: 400 });
  }

  const movement = await prisma.movement.create({
    data: {
      date: toDbDate(date),
      type,
      category,
      accountId: account.id,
      amount: Math.round(amount),
      description,
      notes,
    },
  });

  return NextResponse.json({ movement }, { status: 201 });
}
