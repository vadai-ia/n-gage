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

  // Verificar super like disponible (pre-check fuera de transacción)
  if (type === "super_like") {
    const [reg, event] = await Promise.all([
      prisma.eventRegistration.findUnique({
        where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
      }),
      prisma.event.findUnique({
        where: { id: eventId },
        select: { super_likes_max: true },
      }),
    ]);
    const max = event?.super_likes_max ?? 1;
    const used = reg?.super_likes_used ?? 0;
    // Check if this is an upgrade from existing like to super_like (doesn't consume new)
    const existingLike = await prisma.eventLike.findUnique({
      where: { event_id_from_user_id_to_user_id: { event_id: eventId, from_user_id: user.id, to_user_id } },
    });
    const isUpgrade = existingLike && existingLike.type !== "super_like";
    if (!isUpgrade && used >= max) {
      return NextResponse.json({ error: `Ya usaste tus ${max} super likes en este evento` }, { status: 409 });
    }
  }

  // Guardar like (transaccional para super_like)
  const like = await prisma.$transaction(async (tx) => {
    const prev = await tx.eventLike.findUnique({
      where: { event_id_from_user_id_to_user_id: { event_id: eventId, from_user_id: user.id, to_user_id } },
    });

    const created = await tx.eventLike.upsert({
      where: { event_id_from_user_id_to_user_id: { event_id: eventId, from_user_id: user.id, to_user_id } },
      update: { type: type as never },
      create: { event_id: eventId, from_user_id: user.id, to_user_id, type: type as never },
    });

    // Only increment super_likes_used when the like becomes super_like and wasn't before
    if (type === "super_like" && prev?.type !== "super_like") {
      await tx.eventRegistration.update({
        where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
        data: { super_likes_used: { increment: 1 } },
      });
    }

    return created;
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

      // Match created — no automatic welcome message, let users start the conversation
    }
  }

  return NextResponse.json({ like, match, is_match: !!match });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const expired = await isContentExpiredForUser(user.id, eventId);
  if (expired) {
    return NextResponse.json({ error: "El contenido de este evento ha expirado" }, { status: 410 });
  }

  const { searchParams } = new URL(req.url);
  const toUserId = searchParams.get("to_user_id");
  if (!toUserId) {
    return NextResponse.json({ error: "Falta to_user_id" }, { status: 400 });
  }

  // Guard: can't remove like if match already exists
  const [userA, userB] = [user.id, toUserId].sort();
  const existingMatch = await prisma.eventMatch.findUnique({
    where: { event_id_user_a_id_user_b_id: { event_id: eventId, user_a_id: userA, user_b_id: userB } },
  });
  if (existingMatch) {
    return NextResponse.json(
      { error: "No puedes quitar el like porque ya hay match" },
      { status: 409 }
    );
  }

  const existing = await prisma.eventLike.findUnique({
    where: { event_id_from_user_id_to_user_id: { event_id: eventId, from_user_id: user.id, to_user_id: toUserId } },
  });
  if (!existing) {
    return NextResponse.json({ success: true, removed: false });
  }

  await prisma.$transaction(async (tx) => {
    await tx.eventLike.delete({
      where: { event_id_from_user_id_to_user_id: { event_id: eventId, from_user_id: user.id, to_user_id: toUserId } },
    });
    if (existing.type === "super_like") {
      await tx.eventRegistration.update({
        where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
        data: { super_likes_used: { decrement: 1 } },
      });
    }
  });

  return NextResponse.json({ success: true, removed: true });
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
              select: { selfie_url: true, display_name: true, table_number: true, relation_type: true,
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
