import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isContentExpiredForUser } from "@/lib/auth/event-access";

// Deterministic per-(event,user) seeded shuffle — each user sees a stable random order.
function seededShuffle<T extends { user_id: string }>(items: T[], seed: string): T[] {
  const arr = [...items];
  // xmur3 hash — seed string -> 32-bit int
  function xmur3(str: string) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }
  const rand = xmur3(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Check if content has expired for this user
  const expired = await isContentExpiredForUser(user.id, eventId);
  if (expired) {
    return NextResponse.json({
      profiles: [],
      expired: true,
      message: "El contenido de este evento ha expirado.",
    });
  }

  // Check search time window + pull event flags
  const eventInfo = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      search_start_time: true,
      search_end_time: true,
      match_mode: true,
      super_likes_max: true,
    },
  });
  const now = new Date();
  if (eventInfo?.search_start_time && now < eventInfo.search_start_time) {
    return NextResponse.json({
      profiles: [],
      window_status: "before_start",
      search_start_time: eventInfo.search_start_time.toISOString(),
      match_mode: eventInfo.match_mode,
      super_likes_max: eventInfo.super_likes_max,
    });
  }
  if (eventInfo?.search_end_time && now > eventInfo.search_end_time) {
    return NextResponse.json({
      profiles: [],
      window_status: "ended",
      match_mode: eventInfo?.match_mode,
      super_likes_max: eventInfo?.super_likes_max,
    });
  }

  // Obtener mi registro en el evento
  const me = await prisma.eventRegistration.findUnique({
    where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
  });
  if (!me) return NextResponse.json({ error: "No registrado en este evento" }, { status: 403 });

  // IDs de usuarios a los que ya les di like/dislike
  const myLikes = await prisma.eventLike.findMany({
    where: { event_id: eventId, from_user_id: user.id },
    select: { to_user_id: true, type: true },
  });

  const mosaicMode = eventInfo?.match_mode === "mosaic";

  // For mosaic: show everyone (except those I disliked). For swipe: hide all seen.
  const excludedIds = mosaicMode
    ? myLikes.filter((l) => l.type === "dislike").map((l) => l.to_user_id)
    : myLikes.map((l) => l.to_user_id);

  // Mapear mi género a lo que el otro debería estar buscando para verme
  const myGenderToLookingFor: Record<string, "men" | "women" | "non_binary" | "everyone"> = {
    male: "men",
    female: "women",
    non_binary: "non_binary",
    prefer_not_say: "everyone",
  };
  const reverseLookingFor = myGenderToLookingFor[me.gender] ?? "everyone";

  // Query con filtro de compatibilidad bidireccional. In mosaic mode, take all.
  const profiles = await prisma.eventRegistration.findMany({
    where: {
      event_id: eventId,
      is_visible: true,
      user_id: { not: user.id, notIn: excludedIds },
      OR: [
        { looking_for: "everyone" },
        { looking_for: reverseLookingFor },
      ],
    },
    include: {
      user: { select: { full_name: true, avatar_url: true } },
    },
    orderBy: { created_at: "asc" },
    ...(mosaicMode ? {} : { take: 20 }),
  });

  // Filtrar: yo también debo buscar al otro
  const lookingForToGender: Record<string, string[]> = {
    men: ["male"],
    women: ["female"],
    non_binary: ["non_binary"],
    everyone: ["male", "female", "non_binary", "prefer_not_say"],
  };
  const acceptedGenders = lookingForToGender[me.looking_for] ?? [];
  const filtered = profiles.filter((p) => acceptedGenders.includes(p.gender));

  // Compatibility scoring — "Posible Soul"
  const myInterests = Array.isArray(me.interests) ? (me.interests as string[]) : [];
  const scored = filtered.map((p) => {
    const theirInterests = Array.isArray(p.interests) ? (p.interests as string[]) : [];
    const shared = myInterests.filter((i) => theirInterests.includes(i));
    const score = myInterests.length > 0 && theirInterests.length > 0
      ? Math.round((shared.length / Math.max(myInterests.length, theirInterests.length)) * 100)
      : 0;
    return { ...p, compatibility_score: score, shared_interests: shared };
  });

  // Mosaic: deterministic per-user shuffle so order stays stable across refreshes
  const ordered = mosaicMode ? seededShuffle(scored, `${eventId}:${user.id}`) : scored;

  const singles_count = filtered.length;
  const my_likes_given = myLikes
    .filter((l) => l.type !== "dislike")
    .map((l) => ({ to_user_id: l.to_user_id, type: l.type }));

  return NextResponse.json({
    profiles: ordered,
    my_registration: me,
    singles_count,
    window_status: "open",
    match_mode: eventInfo?.match_mode,
    super_likes_max: eventInfo?.super_likes_max ?? 1,
    my_likes_given,
  });
}
