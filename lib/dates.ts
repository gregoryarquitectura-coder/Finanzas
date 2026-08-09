/**
 * Fechas como strings "YYYY-MM-DD" anclados a medianoche UTC (evita bugs de
 * DST en la aritmética). "Hoy" se calcula en el servidor usando APP_TIMEZONE.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateStr(s: unknown): s is string {
  return typeof s === "string" && DATE_RE.test(s) && !isNaN(parseDateStr(s).getTime());
}

export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDateStr(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function toDbDate(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`);
}

export function monthOf(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function addMonths(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

const DEFAULT_TZ = "America/Santiago";

/** "Hoy" en la zona horaria configurada (APP_TIMEZONE), como YYYY-MM-DD. */
export function todayStr(): string {
  const tz = process.env.APP_TIMEZONE || DEFAULT_TZ;
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: DEFAULT_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
}

export function currentMonthStr(): string {
  return monthOf(todayStr());
}
