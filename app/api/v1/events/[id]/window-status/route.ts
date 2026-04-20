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

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      search_start_time: true,
      search_end_time: true,
      search_duration_minutes: true,
      status: true,
    },
  });

  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const now = new Date();
  let windowStatus: "before_start" | "open" | "ended" | "no_window" = "no_window";

  if (event.search_start_time) {
    if (now < event.search_start_time) {
      windowStatus = "before_start";
    } else if (event.search_end_time && now > event.search_end_time) {
      windowStatus = "ended";
    } else {
      windowStatus = "open";
    }
  } else {
    windowStatus = "open"; // no window configured = always open
  }

  return NextResponse.json({
    window_status: windowStatus,
    search_start_time: event.search_start_time?.toISOString() ?? null,
    search_end_time: event.search_end_time?.toISOString() ?? null,
    search_duration_minutes: event.search_duration_minutes,
  });
}
