import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/is-admin";

// POST — submit a review (one per user per event)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { rating, comment, would_use_again } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating debe ser entre 1 y 5" }, { status: 400 });
  }

  const review = await prisma.appReview.upsert({
    where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
    update: {
      rating,
      comment: comment?.trim() || null,
      would_use_again: would_use_again ?? true,
    },
    create: {
      event_id: eventId,
      user_id: user.id,
      rating,
      comment: comment?.trim() || null,
      would_use_again: would_use_again ?? true,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}

// GET — check if current user has reviewed + get all reviews (admin/organizer/host)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  // Guest mode: just check if this user reviewed
  if (mode !== "all") {
    const myReview = await prisma.appReview.findUnique({
      where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
    });
    return NextResponse.json({ reviewed: !!myReview, review: myReview });
  }

  // Admin/organizer/host mode: get all reviews for this event
  const admin = await isAdmin(user.id);
  const event = await prisma.event.findFirst({
    where: admin
      ? { id: eventId }
      : {
          id: eventId,
          OR: [
            { organizer_id: user.id },
            { hosts: { some: { user_id: user.id } } },
          ],
        },
  });
  if (!event) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const reviews = await prisma.appReview.findMany({
    where: { event_id: eventId },
    include: {
      user: { select: { full_name: true, email: true, avatar_url: true } },
    },
    orderBy: { created_at: "desc" },
  });

  const stats = {
    total: reviews.length,
    average: reviews.length > 0 ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0,
    wouldUseAgain: reviews.filter((r) => r.would_use_again).length,
    distribution: [1, 2, 3, 4, 5].map((star) => reviews.filter((r) => r.rating === star).length),
  };

  return NextResponse.json({ reviews, stats });
}
