import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "SUPER_ADMIN") return null;
  return user;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          organized_events: true,
          registrations: true,
          likes_sent: true,
          likes_received: true,
          matches_a: true,
          matches_b: true,
          photos: true,
          app_reviews: true,
        },
      },
      registrations: {
        include: {
          event: {
            select: { id: true, name: true, event_date: true, status: true, type: true, venue_city: true },
          },
        },
        orderBy: { created_at: "desc" },
      },
      organized_events: {
        select: { id: true, name: true, event_date: true, status: true, _count: { select: { registrations: true, matches: true } } },
        orderBy: { event_date: "desc" },
      },
      app_reviews: {
        include: { event: { select: { name: true } } },
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const stats = {
    events_attended: user._count.registrations,
    events_organized: user._count.organized_events,
    total_likes_received: user._count.likes_received,
    total_likes_sent: user._count.likes_sent,
    total_matches: user._count.matches_a + user._count.matches_b,
    total_photos: user._count.photos,
    total_reviews: user._count.app_reviews,
  };

  return NextResponse.json({ user, stats });
}
