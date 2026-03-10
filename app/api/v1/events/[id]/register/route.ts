import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { syncUserToDB } from "@/lib/auth/sync-user";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Ensure user exists in our DB
  try {
    await syncUserToDB(user);
  } catch (e) {
    console.error("Error syncing user during registration:", e);
  }

  const body = await req.json();
  const { selfie_url, table_number, relation_type, interests, gender, looking_for } = body;

  if (!selfie_url || !gender || !looking_for) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  // Verificar que el evento existe y está activo
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  if (event.status === "expired" || event.status === "closed") {
    return NextResponse.json({ error: "El evento ya no está disponible" }, { status: 410 });
  }

  const limit = event.plan_guest_limit ?? event.max_guests;
  if (limit && event._count.registrations >= limit) {
    return NextResponse.json({ error: "El evento está lleno" }, { status: 409 });
  }

  // Verificar registro duplicado
  const existing = await prisma.eventRegistration.findUnique({
    where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
  });
  if (existing) {
    return NextResponse.json({ registration: existing, alreadyRegistered: true });
  }

  // Crear registro
  const registration = await prisma.eventRegistration.create({
    data: {
      event_id: eventId,
      user_id: user.id,
      selfie_url,
      table_number: table_number || null,
      relation_type: relation_type || null,
      interests: interests || [],
      gender,
      looking_for,
    },
  });

  return NextResponse.json({ registration }, { status: 201 });
}
