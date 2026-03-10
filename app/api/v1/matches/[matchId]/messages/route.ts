import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isContentExpiredForUser } from "@/lib/auth/event-access";

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

  // Check expiry for guests
  const expired = await isContentExpiredForUser(user.id, match.event_id);
  if (expired) {
    return NextResponse.json({
      messages: [],
      expired: true,
      message: "El contenido de este evento ha expirado.",
    });
  }

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
  });
  if (!match) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // Check expiry — guests can't send messages after event expires
  const expired = await isContentExpiredForUser(user.id, match.event_id);
  if (expired) {
    return NextResponse.json({ error: "El contenido de este evento ha expirado" }, { status: 410 });
  }

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });

  const message = await prisma.matchMessage.create({
    data: { match_id: matchId, sender_id: user.id, content: content.trim() },
    include: { sender: { select: { full_name: true, avatar_url: true } } },
  });

  return NextResponse.json({ message }, { status: 201 });
}
