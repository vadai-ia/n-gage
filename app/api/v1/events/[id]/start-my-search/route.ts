import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { search_duration_minutes: true },
  });
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + event.search_duration_minutes * 60 * 1000);

  const registration = await prisma.eventRegistration.update({
    where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
    data: { search_started_at: now, search_expires_at: expiresAt },
  });

  return NextResponse.json({ registration });
}
