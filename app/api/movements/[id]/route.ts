import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toDbDate, isValidDateStr } from "@/lib/dates";
import { TIPO_LABELS, CATEGORIAS, type MovementType } from "@/config/finance.config";

const VALID_TYPES = Object.keys(TIPO_LABELS) as MovementType[];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const data: Record<string, unknown> = {};

  if ("date" in body) {
    if (!isValidDateStr(body.date)) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }
    data.date = toDbDate(body.date);
  }
  if ("type" in body) {
    if (!VALID_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }
    data.type = body.type;
  }
  if ("category" in body) {
    if (!(CATEGORIAS as readonly string[]).includes(body.category)) {
      return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
    }
    data.category = body.category;
  }
  if ("accountId" in body) data.accountId = body.accountId;
  if ("amount" in body) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount)) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }
    data.amount = Math.round(amount);
  }
  if ("description" in body) data.description = String(body.description);
  if ("notes" in body) data.notes = String(body.notes);

  try {
    const movement = await prisma.movement.update({ where: { id: params.id }, data });
    return NextResponse.json({ movement });
  } catch {
    return NextResponse.json({ error: "Movimiento no encontrado" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.movement.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Movimiento no encontrado" }, { status: 404 });
  }
}
