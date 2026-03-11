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

export async function GET() {
  try {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const [
    totalEvents,
    activeEvents,
    totalUsers,
    totalRegistrations,
    totalMatches,
    totalPhotos,
    totalReports,
    pendingReports,
    recentEvents,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: "active" } }),
    prisma.user.count(),
    prisma.eventRegistration.count(),
    prisma.eventMatch.count(),
    prisma.eventPhoto.count(),
    prisma.photoReport.count(),
    prisma.photoReport.count({ where: { status: "pending" } }),
    prisma.event.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      include: { organizer: { select: { full_name: true } }, _count: { select: { registrations: true, matches: true } } },
    }),
  ]);

  // Organizers con más eventos
  const topOrganizers = await prisma.user.findMany({
    where: { role: "EVENT_ORGANIZER" },
    take: 5,
    include: { _count: { select: { organized_events: true } } },
    orderBy: { organized_events: { _count: "desc" } },
  });

  return NextResponse.json({
    stats: {
      totalEvents, activeEvents, totalUsers, totalRegistrations,
      totalMatches, totalPhotos, totalReports, pendingReports,
    },
    recentEvents,
    topOrganizers,
  });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin stats error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
