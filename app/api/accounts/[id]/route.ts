import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if ("initialBalance" in body) {
    const value = Number(body.initialBalance);
    if (!Number.isFinite(value)) {
      return NextResponse.json({ error: "Saldo inválido" }, { status: 400 });
    }
    data.initialBalance = Math.round(value);
  }
  if ("name" in body) data.name = String(body.name);
  if ("function" in body) data.function = String(body.function);

  try {
    const account = await prisma.account.update({ where: { id: params.id }, data });
    return NextResponse.json({ account });
  } catch {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
  }
}
