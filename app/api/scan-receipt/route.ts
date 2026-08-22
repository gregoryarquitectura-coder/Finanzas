import { NextRequest, NextResponse } from "next/server";
import { analyzeReceipt } from "@/lib/receiptScan";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("image");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No se recibió ninguna imagen" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen es muy pesada (máx. 8MB)" }, { status: 400 });
  }

  const mediaType = file.type || "image/jpeg";
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  try {
    const extraction = await analyzeReceipt(base64, mediaType);
    return NextResponse.json({ extraction });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error analizando la boleta";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
