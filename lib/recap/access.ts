import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ensureRecapCode, recapCodesMatch, recapCookieName } from "./code";

export const RECAP_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

export type RecapEventAccess = {
  event: { id: string; name: string; event_date: Date; venue_name: string | null; venue_city: string | null; cover_image_url: string | null; event_photos: string[]; unique_slug: string };
  code: string;
  unlocked: boolean;
};

/** Loads the event by slug and checks whether the visitor's cookie (or a given code) unlocks its recap. */
export async function getRecapAccess(slug: string, candidateCode?: string | null): Promise<RecapEventAccess | null> {
  const event = await prisma.event.findUnique({
    where: { unique_slug: slug },
    select: {
      id: true, name: true, event_date: true, venue_name: true, venue_city: true,
      cover_image_url: true, event_photos: true, unique_slug: true, recap_code: true,
    },
  });
  if (!event) return null;

  const code = await ensureRecapCode(event.id, event.recap_code);
  const cookieCode = cookies().get(recapCookieName(event.id))?.value;
  const unlocked =
    (!!cookieCode && recapCodesMatch(cookieCode, code)) ||
    (!!candidateCode && recapCodesMatch(candidateCode, code));

  return {
    event: {
      id: event.id, name: event.name, event_date: event.event_date, venue_name: event.venue_name,
      venue_city: event.venue_city, cover_image_url: event.cover_image_url, event_photos: event.event_photos,
      unique_slug: event.unique_slug,
    },
    code,
    unlocked,
  };
}
