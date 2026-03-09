import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Verificar que el usuario es parte del match
  const match = await prisma.eventMatch.findFirst({
    where: { id: matchId, OR: [{ user_a_id: user.id }, { user_b_id: user.id }] },
  });
  if (!match) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const messages = await prisma.matchMessage.findMany({
    where: { match_id: matchId },
    orderBy: { created_at: "asc" },
    include: { sender: { select: { full_name: true, avatar_url: true } } },
  });

  // Marcar como leídos los mensajes del otro
  await prisma.matchMessage.updateMany({
    where: { match_id: matchId, sender_id: { not: user.id }, read_at: null },
    data: { read_at: new Date() },
  });

  return NextResponse.json({ messages });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const match = await prisma.eventMatch.findFirst({
    where: { id: matchId, OR: [{ user_a_id: user.id }, { user_b_id: user.id }] },
    include: { event: { select: { expiry_at: true, status: true } } },
  });
  if (!match) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (match.event.status === "expired") {
    return NextResponse.json({ error: "El evento ha expirado" }, { status: 410 });
  }

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });

  const message = await prisma.matchMessage.create({
    data: { match_id: matchId, sender_id: user.id, content: content.trim() },
    include: { sender: { select: { full_name: true, avatar_url: true } } },
  });

  return NextResponse.json({ message }, { status: 201 });
}
