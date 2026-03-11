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

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Must be SUPER_ADMIN or the event organizer
  const isSuperAdmin = user.user_metadata?.role === "SUPER_ADMIN";

  if (!isSuperAdmin) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizer_id: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }
    if (event.organizer_id !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  }

  const registrations = await prisma.eventRegistration.findMany({
    where: { event_id: eventId },
    include: {
      user: { select: { id: true, full_name: true, email: true, avatar_url: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ registrations });
}
