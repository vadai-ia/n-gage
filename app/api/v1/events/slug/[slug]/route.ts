import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

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
      event_photos: true,
      status: true,
      language: true,
      search_duration_minutes: true,
      expiry_type: true,
      expiry_days: true,
      expiry_at: true,
      max_guests: true,
      plan_guest_limit: true,
      gender_extended_mode: true,
      whatsapp_group_url: true,
      unique_slug: true,
      organizer: { select: { full_name: true } },
      _count: { select: { registrations: true } },
      access_codes: {
        where: { is_active: true },
        select: { code: true, type: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  if (event.status === "expired") {
    return NextResponse.json({ error: "Este evento ha expirado" }, { status: 410 });
  }
  if (event.status === "draft") {
    return NextResponse.json(
      { error: "El organizador aún no ha activado este evento. Vuelve más tarde." },
      { status: 403 }
    );
  }
  if (event.status === "closed") {
    return NextResponse.json({ error: "Este evento ya está cerrado." }, { status: 410 });
  }

  // Check capacity
  const limit = event.plan_guest_limit ?? event.max_guests;
  const isFull = limit ? event._count.registrations >= limit : false;
  if (isFull) {
    return NextResponse.json({ error: "Evento lleno", eventFull: true }, { status: 409 });
  }

  // Determine if event requires access code
  const requiresCode = event.access_codes.length > 0;

  // Validate access code if provided
  let accessValid: boolean | undefined;
  if (code && requiresCode) {
    accessValid = event.access_codes.some(
      (ac) => ac.code.toLowerCase() === code.toLowerCase()
    );
  }

  // Remove access_codes from the response (don't expose codes to client)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { access_codes: _codes, ...eventData } = event;

  return NextResponse.json({
    event: eventData,
    requiresCode,
    accessValid: code ? accessValid : undefined,
  });
}
