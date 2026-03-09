import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/is-admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = await isAdmin(user.id);
  const event = await prisma.event.findFirst({
    where: admin ? { id } : { id, organizer_id: user.id },
    include: {
      hosts: { include: { user: { select: { full_name: true, email: true, avatar_url: true } } } },
      access_codes: { where: { type: "global", is_active: true }, take: 1 },
      _count: { select: { registrations: true, matches: true, photos: true } },
    },
  });

  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  return NextResponse.json({ event });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();

  const admin = await isAdmin(user.id);
  const event = await prisma.event.updateMany({
    where: admin ? { id } : { id, organizer_id: user.id },
    data: body,
  });

  if (!event.count) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = await isAdmin(user.id);
  await prisma.event.updateMany({
    where: admin ? { id } : { id, organizer_id: user.id },
    data: { status: "closed" },
  });

  return NextResponse.json({ success: true });
}
