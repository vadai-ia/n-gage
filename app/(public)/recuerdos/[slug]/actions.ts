"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { getRecapAccess, RECAP_COOKIE_MAX_AGE } from "@/lib/recap/access";
import { normalizeRecapCode, recapCookieName } from "@/lib/recap/code";

const UnlockSchema = z.object({
  slug: z.string().min(1).max(120),
  code: z.string().min(1).max(32),
});

export async function unlockRecap(slug: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const parsed = UnlockSchema.safeParse({ slug, code });
  if (!parsed.success) return { ok: false, error: "Escribe el código que te compartimos" };

  const access = await getRecapAccess(parsed.data.slug, parsed.data.code);
  if (!access) return { ok: false, error: "Este evento no existe" };
  if (!access.unlocked) return { ok: false, error: "Ese código no coincide. Revísalo e inténtalo de nuevo." };

  cookies().set(recapCookieName(access.event.id), normalizeRecapCode(parsed.data.code), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: RECAP_COOKIE_MAX_AGE,
  });
  return { ok: true };
}
