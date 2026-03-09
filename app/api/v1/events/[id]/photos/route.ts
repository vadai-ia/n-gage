import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Verificar límite de 10 fotos
  const reg = await prisma.eventRegistration.findUnique({
    where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
  });
  if (!reg) return NextResponse.json({ error: "No registrado" }, { status: 403 });
  if (reg.photos_taken >= 10) {
    return NextResponse.json({ error: "Ya usaste todas tus fotos (máx 10)" }, { status: 409 });
  }

  const { dataUrl, device_info } = await req.json();
  if (!dataUrl) return NextResponse.json({ error: "Sin imagen" }, { status: 400 });

  // Upload a Cloudinary
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: `ngage/events/${eventId}/photos`,
    public_id: `photo_${user.id}_${Date.now()}`,
    transformation: [{ width: 1080, height: 1080, crop: "limit", quality: "auto" }],
  });

  // Guardar en DB (is_visible=false hasta album_release_at)
  const photo = await prisma.eventPhoto.create({
    data: {
      event_id: eventId,
      user_id: user.id,
      cloudinary_public_id: result.public_id,
      cloudinary_url: result.secure_url,
      thumbnail_url: result.secure_url.replace("/upload/", "/upload/w_200,h_200,c_fill/"),
      taken_at: new Date(),
      device_info: device_info || null,
      is_visible: false,
    },
  });

  // Incrementar contador
  await prisma.eventRegistration.update({
    where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
    data: { photos_taken: { increment: 1 } },
  });

  return NextResponse.json({ photo, photos_taken: reg.photos_taken + 1 }, { status: 201 });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  if (all) {
    // Solo hosts y organizers pueden ver todas las fotos
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          { organizer_id: user.id },
          { hosts: { some: { user_id: user.id } } },
        ],
      },
    });
    if (!event) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

    const photos = await prisma.eventPhoto.findMany({
      where: { event_id: eventId },
      include: { user: { select: { full_name: true } } },
      orderBy: { taken_at: "desc" },
    });
    return NextResponse.json({ photos });
  }

  // Mis fotos
  const photos = await prisma.eventPhoto.findMany({
    where: { event_id: eventId, user_id: user.id },
    orderBy: { taken_at: "desc" },
  });

  const reg = await prisma.eventRegistration.findUnique({
    where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
    select: { photos_taken: true },
  });

  return NextResponse.json({ photos, photos_taken: reg?.photos_taken ?? 0 });
}
