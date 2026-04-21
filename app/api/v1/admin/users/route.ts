import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "SUPER_ADMIN") return null;
  return user;
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const role   = searchParams.get("role");
  const search = searchParams.get("q");
  const page   = parseInt(searchParams.get("page") ?? "1");
  const limit  = 20;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) where.OR = [
    { full_name: { contains: search, mode: "insensitive" } },
    { email:     { contains: search, mode: "insensitive" } },
  ];

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
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
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Enrich with computed match count (a+b) and total likes
  const enriched = users.map((u) => ({
    ...u,
    _count: {
      ...u._count,
      matches: (u._count.matches_a ?? 0) + (u._count.matches_b ?? 0),
      events_attended: u._count.registrations,
    },
  }));

  return NextResponse.json({ users: enriched, total, page, pages: Math.ceil(total / limit) });
}

// PATCH /api/v1/admin/users — suspend/activate/change_role/delete
export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { userId, action, role } = await req.json() as {
    userId: string;
    action: "suspend" | "activate" | "make_organizer" | "change_role" | "delete";
    role?: "SUPER_ADMIN" | "EVENT_ORGANIZER" | "EVENT_HOST" | "GUEST";
  };

  const supabaseAdmin = getAdminClient();

  if (action === "suspend") {
    // Ban in Supabase Auth (blocks login + invalidates refresh) + stamp app_metadata
    // so middleware can block any live JWT on its next request without a DB roundtrip.
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: "876600h",
      app_metadata: { suspended: true },
    });
    await prisma.user.update({ where: { id: userId }, data: { is_active: false } });
    return NextResponse.json({ ok: true });
  }

  if (action === "activate") {
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: "none",
      app_metadata: { suspended: false },
    });
    await prisma.user.update({ where: { id: userId }, data: { is_active: true } });
    return NextResponse.json({ ok: true });
  }

  if (action === "make_organizer") {
    await prisma.user.update({ where: { id: userId }, data: { role: "EVENT_ORGANIZER" } });
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role: "EVENT_ORGANIZER" },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "change_role" && role) {
    const validRoles = ["SUPER_ADMIN", "EVENT_ORGANIZER", "EVENT_HOST", "GUEST"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Rol no valido" }, { status: 400 });
    }
    await prisma.user.update({ where: { id: userId }, data: { role } });
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    // Hard delete: wipe every row that references this user, plus every event they
    // organized (and all dependent data under those events), then delete from
    // Supabase Auth so the email can be reused.
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Events organized by this user cascade-delete everything under them.
        const organizedEvents = await tx.event.findMany({
          where: { organizer_id: userId },
          select: { id: true },
        });
        const eventIds = organizedEvents.map((e) => e.id);

        if (eventIds.length > 0) {
          const matchesInEvents = await tx.eventMatch.findMany({
            where: { event_id: { in: eventIds } },
            select: { id: true },
          });
          const photosInEvents = await tx.eventPhoto.findMany({
            where: { event_id: { in: eventIds } },
            select: { id: true },
          });
          const webhooksInEvents = await tx.webhook.findMany({
            where: { event_id: { in: eventIds } },
            select: { id: true },
          });

          await tx.matchMessage.deleteMany({ where: { match_id: { in: matchesInEvents.map((m) => m.id) } } });
          await tx.eventMatch.deleteMany({ where: { event_id: { in: eventIds } } });
          await tx.eventLike.deleteMany({ where: { event_id: { in: eventIds } } });
          await tx.photoReport.deleteMany({ where: { photo_id: { in: photosInEvents.map((p) => p.id) } } });
          await tx.eventPhoto.deleteMany({ where: { event_id: { in: eventIds } } });
          await tx.eventRegistration.deleteMany({ where: { event_id: { in: eventIds } } });
          await tx.eventHost.deleteMany({ where: { event_id: { in: eventIds } } });
          await tx.webhookLog.deleteMany({ where: { webhook_id: { in: webhooksInEvents.map((w) => w.id) } } });
          await tx.webhook.deleteMany({ where: { event_id: { in: eventIds } } });
          await tx.eventAccessCode.deleteMany({ where: { event_id: { in: eventIds } } });
          await tx.appReview.deleteMany({ where: { event_id: { in: eventIds } } });
          await tx.event.deleteMany({ where: { id: { in: eventIds } } });
        }

        // 2. Remaining user-scoped data in events the user did NOT organize.
        const userMatches = await tx.eventMatch.findMany({
          where: { OR: [{ user_a_id: userId }, { user_b_id: userId }, { initiated_by: userId }] },
          select: { id: true },
        });
        const userPhotos = await tx.eventPhoto.findMany({
          where: { user_id: userId },
          select: { id: true },
        });
        const userWebhooks = await tx.webhook.findMany({
          where: { owner_id: userId },
          select: { id: true },
        });

        await tx.matchMessage.deleteMany({
          where: { OR: [{ sender_id: userId }, { match_id: { in: userMatches.map((m) => m.id) } }] },
        });
        await tx.eventMatch.deleteMany({
          where: { OR: [{ user_a_id: userId }, { user_b_id: userId }, { initiated_by: userId }] },
        });
        await tx.eventLike.deleteMany({
          where: { OR: [{ from_user_id: userId }, { to_user_id: userId }] },
        });
        await tx.photoReport.deleteMany({
          where: { OR: [{ reported_by: userId }, { photo_id: { in: userPhotos.map((p) => p.id) } }] },
        });
        await tx.eventPhoto.deleteMany({ where: { user_id: userId } });
        await tx.eventRegistration.deleteMany({ where: { user_id: userId } });
        await tx.eventHost.deleteMany({ where: { user_id: userId } });
        await tx.appReview.deleteMany({ where: { user_id: userId } });
        await tx.apiKey.deleteMany({ where: { owner_id: userId } });
        await tx.webhookLog.deleteMany({ where: { webhook_id: { in: userWebhooks.map((w) => w.id) } } });
        await tx.webhook.deleteMany({ where: { owner_id: userId } });
        await tx.userProfile.deleteMany({ where: { user_id: userId } });

        // Access codes: keep the code row but detach the user so the event's codes stay usable.
        await tx.eventAccessCode.updateMany({
          where: { used_by: userId },
          data: { used_by: null, used_at: null },
        });

        await tx.user.delete({ where: { id: userId } });
      });

      // 3. Remove from Supabase Auth so the email is free to sign up again.
      const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authErr) {
        // DB side already gone; surface the auth error but don't roll back.
        console.error("deleteUser auth error:", authErr);
        return NextResponse.json(
          { ok: true, warning: `Usuario eliminado de la BD, pero falló borrado en Auth: ${authErr.message}` }
        );
      }

      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("Hard delete user error:", err);
      const message = err instanceof Error ? err.message : "Error desconocido";
      return NextResponse.json({ error: `No se pudo eliminar: ${message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Accion no valida" }, { status: 400 });
}
