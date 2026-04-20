import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isContentExpiredForUser } from "@/lib/auth/event-access";

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

  // Check search time window
  const eventWindow = await prisma.event.findUnique({
    where: { id: eventId },
    select: { search_start_time: true, search_end_time: true },
  });
  const now = new Date();
  if (eventWindow?.search_start_time && now < eventWindow.search_start_time) {
    return NextResponse.json({
      profiles: [],
      window_status: "before_start",
      search_start_time: eventWindow.search_start_time.toISOString(),
    });
  }
  if (eventWindow?.search_end_time && now > eventWindow.search_end_time) {
    return NextResponse.json({ profiles: [], window_status: "ended" });
  }

  // Obtener mi registro en el evento
  const me = await prisma.eventRegistration.findUnique({
    where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
  });
  if (!me) return NextResponse.json({ error: "No registrado en este evento" }, { status: 403 });

  // IDs de usuarios a los que ya les di like/dislike
  const seen = await prisma.eventLike.findMany({
    where: { event_id: eventId, from_user_id: user.id },
    select: { to_user_id: true },
  });
  const seenIds = seen.map((s) => s.to_user_id);

  // Mapear mi género a lo que el otro debería estar buscando para verme
  const myGenderToLookingFor: Record<string, "men" | "women" | "non_binary" | "everyone"> = {
    male: "men",
    female: "women",
    non_binary: "non_binary",
    prefer_not_say: "everyone",
  };
  const reverseLookingFor = myGenderToLookingFor[me.gender] ?? "everyone";

  // Query con filtro de compatibilidad bidireccional
  const profiles = await prisma.eventRegistration.findMany({
    where: {
      event_id: eventId,
      is_visible: true,
      user_id: { not: user.id, notIn: seenIds },
      // El otro me busca a mí (o a todos)
      OR: [
        { looking_for: "everyone" },
        { looking_for: reverseLookingFor },
      ],
    },
    include: {
      user: { select: { full_name: true, avatar_url: true } },
    },
    orderBy: { created_at: "asc" },
    take: 20,
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

  // Count of singles matching my looking_for (for waiting room UI)
  const singles_count = filtered.length;

  return NextResponse.json({ profiles: scored, my_registration: me, singles_count, window_status: "open" });
}
