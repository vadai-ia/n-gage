import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/is-admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = await isAdmin(user.id);
  const event = await prisma.event.findFirst({ where: admin ? { id } : { id, organizer_id: user.id } });
  if (!event) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const [registrations, searchesStarted, likes, matches, photos] = await Promise.all([
    prisma.eventRegistration.count({ where: { event_id: id } }),
    prisma.eventRegistration.count({ where: { event_id: id, search_started_at: { not: null } } }),
    prisma.eventLike.count({ where: { event_id: id, type: { in: ["like", "super_like"] } } }),
    prisma.eventMatch.count({ where: { event_id: id } }),
    prisma.eventPhoto.count({ where: { event_id: id } }),
  ]);

  return NextResponse.json({
    stats: {
      registrations,
      searches_started: searchesStarted,
      likes,
      matches,
      photos,
      capacity: event.plan_guest_limit ?? event.max_guests ?? null,
    },
  });
}
