/**
 * Auth mínima de un solo usuario: un PIN definido en FINANCE_PIN.
 * Usa Web Crypto (crypto.subtle) en vez del módulo "crypto" de Node porque
 * este código corre también en el Edge Runtime del middleware.
 */

export const SESSION_COOKIE = "finance_session";

function getSecret(): string {
  return process.env.AUTH_SECRET || process.env.FINANCE_PIN || "insecure-dev-secret";
}

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function getSessionToken(): Promise<string> {
  return hmacSha256Hex("authenticated", getSecret());
}

export async function isValidSession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const expected = await getSessionToken();
  return constantTimeEqual(token, expected);
}

export function isCorrectPin(pin: string): boolean {
  const expected = process.env.FINANCE_PIN || "";
  if (!expected || typeof pin !== "string") return false;
  return constantTimeEqual(pin, expected);
}
