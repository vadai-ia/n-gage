import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { unique_slug: slug },
    select: {
      id: true,
      name: true,
      type: true,
      event_date: true,
      venue_name: true,
      venue_city: true,
      cover_image_url: true,
      status: true,
      language: true,
      search_duration_minutes: true,
      expiry_type: true,
      expiry_days: true,
      expiry_at: true,
      max_guests: true,
      plan_guest_limit: true,
      gender_extended_mode: true,
      unique_slug: true,
      organizer: { select: { full_name: true } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  if (event.status === "expired") {
    return NextResponse.json({ error: "Este evento ha expirado" }, { status: 410 });
  }

  // Verificar capacidad
  const limit = event.plan_guest_limit ?? event.max_guests;
  if (limit && event._count.registrations >= limit) {
    return NextResponse.json({ error: "Evento lleno" }, { status: 409 });
  }

  return NextResponse.json({ event });
}
