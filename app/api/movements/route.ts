import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toDbDate, isValidDateStr, todayStr } from "@/lib/dates";
import { TIPO_LABELS, CATEGORIAS, type MovementType } from "@/config/finance.config";

const VALID_TYPES = Object.keys(TIPO_LABELS) as MovementType[];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const date = isValidDateStr(body.date) ? body.date : todayStr();
  const type = body.type;
  const category = body.category;
  const accountId = body.accountId;
  const amount = Number(body.amount);
  const description = typeof body.description === "string" ? body.description : "";
  const notes = typeof body.notes === "string" ? body.notes : "";

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }
  if (!(CATEGORIAS as readonly string[]).includes(category)) {
    return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
  }
  if (!accountId || typeof accountId !== "string") {
    return NextResponse.json({ error: "Cuenta inválida" }, { status: 400 });
  }
  if (!Number.isFinite(amount)) {
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
  }

  const movement = await prisma.movement.create({
    data: {
      date: toDbDate(date),
      type,
      category,
      accountId,
      amount: Math.round(amount),
      description,
      notes,
    },
  });

  return NextResponse.json({ movement }, { status: 201 });
}
