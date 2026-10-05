import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";
import { getRecapAccess } from "@/lib/recap/access";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET — genera (o reutiliza) un ZIP con todas las fotos del evento y redirige a la descarga.
// Con ?format=json responde { url } para que la UI pueda mostrar progreso y errores.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const asJson = new URL(req.url).searchParams.get("format") === "json";
  const respond = (url: string) => (asJson ? NextResponse.json({ url }) : NextResponse.redirect(url));
  const access = await getRecapAccess(slug);
  if (!access) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!access.unlocked) return NextResponse.json({ error: "Sin acceso" }, { status: 401 });

  const photos = await prisma.eventPhoto.findMany({
    where: { event_id: access.event.id, reports: { none: { status: "resolved" } } },
    select: { cloudinary_public_id: true },
    orderBy: { taken_at: "asc" },
  });
  if (photos.length === 0) return NextResponse.json({ error: "Este evento no tiene fotos" }, { status: 404 });

  const publicIds = photos.map((p) => p.cloudinary_public_id);
  // El hash del set de fotos permite reutilizar el ZIP mientras no cambien
  const hash = createHash("sha1").update(publicIds.join(",")).digest("hex").slice(0, 12);
  const targetPublicId = `ngage/recaps/${access.event.id}/album-${hash}`;

  try {
    // Cloudinary guarda el archivo raw con la extensión .zip en el public_id
    for (const candidate of [`${targetPublicId}.zip`, targetPublicId]) {
      const existing = await cloudinary.api.resource(candidate, { resource_type: "raw" }).catch(() => null);
      if (existing?.secure_url) return respond(existing.secure_url);
    }

    const archive = await cloudinary.uploader.create_zip({
      public_ids: publicIds,
      resource_type: "image",
      target_public_id: targetPublicId,
      flatten_folders: true,
    });
    return respond(archive.secure_url);
  } catch (err) {
    console.error("[recap/photos-zip] Cloudinary error:", err);
    return NextResponse.json({ error: "No pudimos preparar el ZIP. Intenta de nuevo en un momento." }, { status: 502 });
  }
}
