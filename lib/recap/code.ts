import { randomInt, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

// Sin 0/O/1/I para que el código se pueda dictar o escribir sin confusiones
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const RECAP_CODE_LENGTH = 6;

export function generateRecapCode(): string {
  let code = "";
  for (let i = 0; i < RECAP_CODE_LENGTH; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return code;
}

export function normalizeRecapCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 32);
}

export function recapCodesMatch(input: string, expected: string): boolean {
  const a = Buffer.from(normalizeRecapCode(input));
  const b = Buffer.from(normalizeRecapCode(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function recapCookieName(eventId: string): string {
  return `ngage_recap_${eventId}`;
}

export function recapUrl(slug: string, code?: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl}/recuerdos/${slug}${code ? `?code=${code}` : ""}`;
}

/** Returns the event's recap code, creating one if the event doesn't have it yet. */
export async function ensureRecapCode(eventId: string, current: string | null): Promise<string> {
  if (current) return current;
  const code = generateRecapCode();
  // updateMany con recap_code null evita pisar un código creado en paralelo
  await prisma.event.updateMany({ where: { id: eventId, recap_code: null }, data: { recap_code: code } });
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { recap_code: true } });
  return event?.recap_code ?? code;
}
