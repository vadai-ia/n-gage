import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/is-admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = await isAdmin(user.id);
  const event = await prisma.event.findFirst({
    where: admin ? { id: eventId } : { id: eventId, organizer_id: user.id },
    include: { hosts: true },
  });
  if (!event) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  if (event.hosts.length >= 3) {
    return NextResponse.json({ error: "Maximo 3 hosts por evento" }, { status: 409 });
  }

  const { email, label } = await req.json();
  if (!email?.trim()) return NextResponse.json({ error: "Falta el email" }, { status: 400 });

  const targetUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!targetUser) {
    return NextResponse.json(
      { error: "Ese usuario no existe en N'GAGE. Pidele que se registre primero." },
      { status: 404 }
    );
  }

  const existing = await prisma.eventHost.findUnique({
    where: { event_id_user_id: { event_id: eventId, user_id: targetUser.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ese usuario ya es host de este evento" }, { status: 409 });
  }

  const host = await prisma.eventHost.create({
    data: { event_id: eventId, user_id: targetUser.id, label: label || null },
    include: { user: { select: { full_name: true, email: true, avatar_url: true } } },
  });

  // Bump role to EVENT_HOST si es solo GUEST
  if (targetUser.role === "GUEST") {
    await prisma.user.update({ where: { id: targetUser.id }, data: { role: "EVENT_HOST" } });
  }

  return NextResponse.json({ host }, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = await isAdmin(user.id);
  const event = await prisma.event.findFirst({
    where: admin ? { id: eventId } : { id: eventId, organizer_id: user.id },
  });
  if (!event) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { hostId } = await req.json();
  if (!hostId) return NextResponse.json({ error: "Falta hostId" }, { status: 400 });

  await prisma.eventHost.deleteMany({ where: { id: hostId, event_id: eventId } });
  return NextResponse.json({ ok: true });
}
