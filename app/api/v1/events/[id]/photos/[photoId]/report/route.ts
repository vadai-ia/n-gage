import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const { photoId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { reason } = await req.json();
  if (!reason) return NextResponse.json({ error: "Falta el motivo" }, { status: 400 });

  const report = await prisma.photoReport.create({
    data: { photo_id: photoId, reported_by: user.id, reason },
  });

  return NextResponse.json({ report }, { status: 201 });
}
