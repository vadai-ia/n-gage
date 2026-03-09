import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

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

  // Query con filtro de compatibilidad bidireccional
  const profiles = await prisma.eventRegistration.findMany({
    where: {
      event_id: eventId,
      is_visible: true,
      user_id: { not: user.id, notIn: seenIds },
      // El otro me busca a mí (o a todos)
      OR: [
        { looking_for: "everyone" },
        { looking_for: me.gender === "male" ? "men" : me.gender === "female" ? "women" : "everyone" },
      ],
    },
    include: {
      user: { select: { full_name: true, avatar_url: true } },
    },
    orderBy: { created_at: "asc" },
    take: 20,
  });

  // Filtrar: yo también debo buscar al otro
  const filtered = profiles.filter((p) => {
    if (me.looking_for === "everyone") return true;
    if (me.looking_for === "men" && p.gender === "male") return true;
    if (me.looking_for === "women" && p.gender === "female") return true;
    if (me.looking_for === "non_binary" && p.gender === "non_binary") return true;
    return false;
  });

  return NextResponse.json({ profiles: filtered, my_registration: me });
}
