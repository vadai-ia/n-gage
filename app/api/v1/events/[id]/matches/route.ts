import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isContentExpiredForUser } from "@/lib/auth/event-access";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Check if content has expired for this user
  const expired = await isContentExpiredForUser(user.id, eventId);
  if (expired) {
    return NextResponse.json({
      matches: [],
      expired: true,
      message: "El contenido de este evento ha expirado.",
    });
  }

  const matches = await prisma.eventMatch.findMany({
    where: {
      event_id: eventId,
      OR: [{ user_a_id: user.id }, { user_b_id: user.id }],
    },
    include: {
      user_a: { select: { id: true, full_name: true, avatar_url: true } },
      user_b: { select: { id: true, full_name: true, avatar_url: true } },
      messages: {
        orderBy: { created_at: "desc" },
        take: 1,
        select: { content: true, created_at: true, sender_id: true, read_at: true },
      },
    },
    orderBy: { matched_at: "desc" },
  });

  // Enriquecer con selfie del evento
  const enriched = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matches.map(async (m: any) => {
      const otherId = m.user_a_id === user.id ? m.user_b_id : m.user_a_id;
      const otherUser = m.user_a_id === user.id ? m.user_b : m.user_a;
      const reg = await prisma.eventRegistration.findUnique({
        where: { event_id_user_id: { event_id: eventId, user_id: otherId } },
        select: { selfie_url: true, table_number: true, display_name: true },
      });
      return { ...m, other_user: otherUser, other_selfie: reg?.selfie_url ?? null,
        other_table: reg?.table_number ?? null, other_display_name: reg?.display_name ?? null };
    })
  );

  return NextResponse.json({ matches: enriched });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { with_user_id } = await req.json();
  const [userA, userB] = [user.id, with_user_id].sort();

  const match = await prisma.eventMatch.upsert({
    where: { event_id_user_a_id_user_b_id: { event_id: eventId, user_a_id: userA, user_b_id: userB } },
    update: {},
    create: { event_id: eventId, user_a_id: userA, user_b_id: userB, initiated_by: user.id },
  });

  return NextResponse.json({ match }, { status: 201 });
}
