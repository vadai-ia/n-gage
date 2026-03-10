import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isContentExpiredForUser } from "@/lib/auth/event-access";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Don't allow likes on expired events
  const expired = await isContentExpiredForUser(user.id, eventId);
  if (expired) {
    return NextResponse.json({ error: "El contenido de este evento ha expirado" }, { status: 410 });
  }

  const { to_user_id, type } = await req.json();
  if (!to_user_id || !["like", "dislike", "super_like"].includes(type)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Verificar super like disponible
  if (type === "super_like") {
    const reg = await prisma.eventRegistration.findUnique({
      where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
    });
    if (reg?.super_like_used) {
      return NextResponse.json({ error: "Ya usaste tu super like en este evento" }, { status: 409 });
    }
    await prisma.eventRegistration.update({
      where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
      data: { super_like_used: true },
    });
  }

  // Guardar like
  const like = await prisma.eventLike.upsert({
    where: { event_id_from_user_id_to_user_id: { event_id: eventId, from_user_id: user.id, to_user_id } },
    update: { type: type as never },
    create: { event_id: eventId, from_user_id: user.id, to_user_id, type: type as never },
  });

  // Verificar match mutuo (solo en likes positivos)
  let match = null;
  if (type === "like" || type === "super_like") {
    const mutualLike = await prisma.eventLike.findFirst({
      where: {
        event_id: eventId,
        from_user_id: to_user_id,
        to_user_id: user.id,
        type: { in: ["like", "super_like"] },
      },
    });

    if (mutualLike) {
      const [userA, userB] = [user.id, to_user_id].sort();
      match = await prisma.eventMatch.upsert({
        where: { event_id_user_a_id_user_b_id: { event_id: eventId, user_a_id: userA, user_b_id: userB } },
        update: {},
        create: {
          event_id: eventId,
          user_a_id: userA,
          user_b_id: userB,
          initiated_by: user.id,
        },
      });

      const welcome = await prisma.matchMessage.findFirst({ where: { match_id: match.id } });
      if (!welcome) {
        await prisma.matchMessage.create({
          data: {
            match_id: match.id,
            sender_id: user.id,
            content: "¡Hicieron match! 🎉 Digan hola...",
          },
        });
      }
    }
  }

  return NextResponse.json({ like, match, is_match: !!match });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Check expiry for guests
  const expired = await isContentExpiredForUser(user.id, eventId);
  if (expired) {
    return NextResponse.json({
      likes: [],
      expired: true,
      message: "El contenido de este evento ha expirado.",
    });
  }

  const { searchParams } = new URL(req.url);
  const direction = searchParams.get("direction") ?? "received";

  if (direction === "received") {
    const likes = await prisma.eventLike.findMany({
      where: { event_id: eventId, to_user_id: user.id, type: { in: ["like", "super_like"] } },
      include: {
        from_user: { select: { full_name: true, avatar_url: true } },
        event: {
          include: {
            registrations: {
              where: { user_id: { not: user.id } },
              select: { selfie_url: true, table_number: true, relation_type: true,
                interests: true, gender: true, user_id: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ likes });
  }

  const likes = await prisma.eventLike.findMany({
    where: { event_id: eventId, from_user_id: user.id },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json({ likes });
}
