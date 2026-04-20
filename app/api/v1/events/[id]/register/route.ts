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
  const { selfie_url, display_name, bio, table_number, table_visible, gallery_photos, relation_type, interests, gender, looking_for, skip_profile } = body;

  // Allow minimal registration if skip_profile=true; otherwise require gender + looking_for
  if (!skip_profile && (!gender || !looking_for)) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  // Verificar que el evento existe y está activo
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  if (event.status !== "active") {
    const errorMsg =
      event.status === "draft"
        ? "El organizador aún no ha activado este evento. Inténtalo más tarde."
        : "Este evento ya no está disponible.";
    return NextResponse.json({ error: errorMsg }, { status: 410 });
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

  // Si el usuario envía un nombre/apodo, solo actualizar full_name si está vacío o es el email
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { full_name: true, email: true },
  });
  const cleanDisplay = display_name?.trim() || null;
  const isFullNameEmptyOrEmail =
    !dbUser?.full_name ||
    dbUser.full_name === dbUser.email?.split("@")[0] ||
    dbUser.full_name === dbUser.email;

  if (cleanDisplay && isFullNameEmptyOrEmail) {
    await prisma.user.update({
      where: { id: user.id },
      data: { full_name: cleanDisplay },
    });
  }

  // Crear registro
  const registration = await prisma.eventRegistration.create({
    data: {
      event_id: eventId,
      user_id: user.id,
      selfie_url: selfie_url || "",
      display_name: cleanDisplay,
      bio: bio?.trim()?.slice(0, 160) || null,
      table_number: table_number || null,
      table_visible: table_visible ?? true,
      gallery_photos: Array.isArray(gallery_photos) ? gallery_photos.slice(0, 5) : [],
      relation_type: relation_type || null,
      interests: interests || [],
      gender: gender || "prefer_not_say",
      looking_for: looking_for || "everyone",
    },
  });

  return NextResponse.json({ registration }, { status: 201 });
}
