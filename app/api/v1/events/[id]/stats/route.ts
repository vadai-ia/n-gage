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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = await isAdmin(user.id);
  const event = await prisma.event.findFirst({
    where: admin ? { id } : { id, organizer_id: user.id },
  });
  if (!event) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const [
    registrations,
    searchesStarted,
    totalLikes,
    likesBreakdown,
    matches,
    photosVisible,
    photosPending,
    genderBreakdown,
    lookingForBreakdown,
  ] = await Promise.all([
    prisma.eventRegistration.count({ where: { event_id: id } }),
    prisma.eventRegistration.count({
      where: { event_id: id, search_started_at: { not: null } },
    }),
    prisma.eventLike.count({ where: { event_id: id } }),
    prisma.eventLike.groupBy({
      by: ["type"],
      where: { event_id: id },
      _count: { id: true },
    }),
    prisma.eventMatch.count({ where: { event_id: id } }),
    prisma.eventPhoto.count({ where: { event_id: id, is_visible: true } }),
    prisma.eventPhoto.count({ where: { event_id: id, is_visible: false } }),
    prisma.eventRegistration.groupBy({
      by: ["gender"],
      where: { event_id: id },
      _count: { id: true },
    }),
    prisma.eventRegistration.groupBy({
      by: ["looking_for"],
      where: { event_id: id },
      _count: { id: true },
    }),
  ]);

  const likesMap: Record<string, number> = {};
  for (const l of likesBreakdown) {
    likesMap[l.type] = l._count.id;
  }

  const genderMap: Record<string, number> = {};
  for (const g of genderBreakdown) {
    genderMap[g.gender] = g._count.id;
  }

  const lookingForMap: Record<string, number> = {};
  for (const l of lookingForBreakdown) {
    lookingForMap[l.looking_for] = l._count.id;
  }

  return NextResponse.json({
    registrations,
    searchesStarted,
    totalLikes,
    likesByType: {
      like: likesMap["like"] ?? 0,
      dislike: likesMap["dislike"] ?? 0,
      super_like: likesMap["super_like"] ?? 0,
    },
    matches,
    photos: {
      visible: photosVisible,
      pending: photosPending,
      total: photosVisible + photosPending,
    },
    genderBreakdown: genderMap,
    lookingForBreakdown: lookingForMap,
    capacity: event.plan_guest_limit ?? event.max_guests ?? null,
  });
}
