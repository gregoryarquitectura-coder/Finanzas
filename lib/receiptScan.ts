import { CATEGORIAS } from "@/config/finance.config";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5";

export interface ReceiptExtraction {
  amount: number | null;
  merchant: string;
  date: string | null;
  category: string | null;
  confidence: "alta" | "media" | "baja";
}

const EXTRACT_TOOL = {
  name: "extraer_boleta",
  description: "Extrae los datos clave de una boleta o comprobante de pago chileno.",
  input_schema: {
    type: "object",
    properties: {
      amount: {
        type: ["number", "null"],
        description: "Monto total pagado, en pesos chilenos, como número entero (sin puntos ni símbolo de moneda). Null si no es legible.",
      },
      merchant: {
        type: "string",
        description: "Nombre del comercio o una descripción breve de la compra.",
      },
      date: {
        type: "string",
        description: "Fecha de la boleta en formato YYYY-MM-DD si es visible. String vacío si no se ve.",
      },
      category: {
        type: "string",
        enum: [...CATEGORIAS],
        description: "La categoría de esta lista que mejor calce con la compra.",
      },
      confidence: {
        type: "string",
        enum: ["alta", "media", "baja"],
        description: "Qué tan seguro estás de los datos extraídos (sobre todo del monto).",
      },
    },
    required: ["amount", "merchant", "date", "category", "confidence"],
  },
};

interface AnthropicToolUseBlock {
  type: "tool_use";
  input: Record<string, unknown>;
}

export async function analyzeReceipt(base64: string, mediaType: string): Promise<ReceiptExtraction> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar ANTHROPIC_API_KEY en las variables de entorno.");
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 1024,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: "tool", name: "extraer_boleta" },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            {
              type: "text",
              text: "Esta imagen es una foto o captura de pantalla de una boleta/comprobante de pago chileno. Extrae el monto total pagado, el comercio, la fecha y la categoría más adecuada.",
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Error de la API de Anthropic (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const toolUse = (data.content as AnthropicToolUseBlock[] | undefined)?.find(
    (b) => b.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("No se pudo extraer información de la boleta.");
  }

  const input = toolUse.input;
  const amount = typeof input.amount === "number" && Number.isFinite(input.amount)
    ? Math.round(input.amount)
    : null;
  const category = typeof input.category === "string" && (CATEGORIAS as readonly string[]).includes(input.category)
    ? input.category
    : null;

  return {
    amount,
    merchant: typeof input.merchant === "string" ? input.merchant : "",
    date: typeof input.date === "string" && input.date ? input.date : null,
    category,
    confidence: input.confidence === "alta" || input.confidence === "media" || input.confidence === "baja"
      ? input.confidence
      : "baja",
  };
}
