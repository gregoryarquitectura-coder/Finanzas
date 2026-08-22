import { CATEGORIAS } from "@/config/finance.config";

/**
 * Heurísticas simples sobre texto plano de OCR (sin IA) para adivinar los
 * campos de una boleta chilena. Nada de esto es exacto — es un punto de
 * partida para que el usuario corrija en el formulario, no una fuente de verdad.
 */

function onlyDigits(s: string): string {
  return s.replace(/[^\d]/g, "");
}

/** Busca primero una línea con "total", si no, el número más grande y razonable del texto. */
export function extractAmount(text: string): number | null {
  const lines = text.split("\n");
  const totalRegex = /\btotal\b[^0-9]{0,20}(\d[\d.,]{2,})/i;
  for (const line of lines) {
    const m = line.match(totalRegex);
    if (m) {
      const n = parseInt(onlyDigits(m[1]), 10);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }

  const numberRegex = /\$?\s?\d{1,3}(?:[.,]\d{3})+|\$?\s?\d{4,9}/g;
  const matches = text.match(numberRegex) || [];
  let max = 0;
  for (const raw of matches) {
    const n = parseInt(onlyDigits(raw), 10);
    if (Number.isFinite(n) && n > max && n < 100_000_000) max = n;
  }
  return max > 0 ? max : null;
}

/** Primera fecha en formato DD/MM/YYYY (o similar) encontrada, como YYYY-MM-DD. */
export function extractDate(text: string): string | null {
  const m = text.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  let year = parseInt(m[3], 10);
  if (year < 100) year += 2000;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Nombre de comercio por keyword conocido -> categoría de la lista existente. */
const KEYWORD_CATEGORIES: Record<string, (typeof CATEGORIAS)[number]> = {
  JUMBO: "Comida",
  LIDER: "Comida",
  "SANTA ISABEL": "Comida",
  UNIMARC: "Comida",
  TOTTUS: "Comida",
  "EL ALMENDRO": "Comida",
  COPEC: "Transporte",
  SHELL: "Transporte",
  PETROBRAS: "Transporte",
  UBER: "Transporte",
  CABIFY: "Transporte",
  METRO: "Transporte",
  FARMACIA: "Salud",
  "CRUZ VERDE": "Salud",
  SALCOBRAND: "Salud",
  AHUMADA: "Salud",
  CLINICA: "Salud",
  SODIMAC: "Casa",
  EASY: "Casa",
  HOMECENTER: "Casa",
  FALABELLA: "Varios",
  PARIS: "Varios",
  RIPLEY: "Varios",
};

export function guessCategory(text: string): string | null {
  const upper = text.toUpperCase();
  for (const [keyword, category] of Object.entries(KEYWORD_CATEGORIES)) {
    if (upper.includes(keyword)) return category;
  }
  return null;
}

/** Primera línea "con pinta de nombre" (letras, largo razonable) como descripción tentativa. */
export function guessMerchant(text: string): string {
  const line = text
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length >= 3 && l.length <= 40 && /[A-ZÁÉÍÓÚÑ]{3,}/.test(l.toUpperCase()));
  return line ? line.slice(0, 60) : "";
}
