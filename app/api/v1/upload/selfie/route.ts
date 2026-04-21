import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/lib/supabase/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // Verify Cloudinary config up front — common misconfig
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary env vars missing");
      return NextResponse.json(
        { error: "Servicio de imagenes no configurado. Contacta soporte." },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { dataUrl, kind } = await req.json() as { dataUrl?: string; kind?: "selfie" | "gallery" };
    if (!dataUrl) return NextResponse.json({ error: "Sin imagen" }, { status: 400 });

    // Validate it looks like a data URL
    if (!dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Formato de imagen invalido" }, { status: 400 });
    }

    // Selfies use face gravity; gallery uses auto (works for non-face photos)
    const transformation = kind === "gallery"
      ? [{ width: 1080, height: 1080, crop: "limit", quality: "auto" }]
      : [{ width: 600, height: 600, crop: "fill", gravity: "face" }];

    try {
      const result = await cloudinary.uploader.upload(dataUrl, {
        folder: kind === "gallery" ? "ngage/gallery" : "ngage/selfies",
        public_id: `${kind ?? "selfie"}_${user.id}_${Date.now()}`,
        transformation,
      });
      return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
    } catch (cloudErr) {
      console.error("Cloudinary upload error:", cloudErr);
      const message = cloudErr instanceof Error ? cloudErr.message : "Error con el servicio de imagenes";
      return NextResponse.json({ error: `Fallo al procesar imagen: ${message}` }, { status: 500 });
    }
  } catch (err) {
    console.error("Selfie upload handler error:", err);
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
