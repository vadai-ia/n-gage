import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/lib/supabase/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { dataUrl } = await req.json();
  if (!dataUrl) return NextResponse.json({ error: "Sin imagen" }, { status: 400 });

  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: "ngage/selfies",
    public_id: `selfie_${user.id}_${Date.now()}`,
    transformation: [{ width: 600, height: 600, crop: "fill", gravity: "face" }],
  });

  return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
}
