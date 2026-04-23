import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/is-admin";
import { z } from "zod";

const PatchEventSchema = z.object({
  name: z.string().min(3).optional(),
  type: z.enum(["wedding", "birthday", "corporate", "graduation", "concert", "cruise", "other"]).optional(),
  event_date: z.string().optional(),
  venue_name: z.string().nullable().optional(),
  venue_city: z.string().nullable().optional(),
  search_duration_minutes: z.number().min(5).max(360).optional(),
  search_start_time: z.string().nullable().optional(),
  search_end_time: z.string().nullable().optional(),
  expiry_type: z.enum(["next_day", "custom_days", "never"]).optional(),
  expiry_days: z.number().min(1).max(30).optional(),
  plan: z.enum(["spark", "connect", "vibe", "luxe", "elite", "exclusive"]).optional(),
  plan_guest_limit: z.number().nullable().optional(),
  max_guests: z.number().nullable().optional(),
  gender_extended_mode: z.boolean().optional(),
  match_mode: z.enum(["swipe", "mosaic"]).optional(),
  super_likes_max: z.number().int().min(0).max(20).optional(),
  language: z.string().optional(),
  status: z.enum(["draft", "active", "closed", "expired"]).optional(),
  whatsapp_group_url: z.string().url().nullable().optional().or(z.literal("")),
});

const planLimits: Record<string, number> = {
  spark: 50, connect: 100, vibe: 200, luxe: 350, elite: 500, exclusive: 9999,
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = await isAdmin(user.id);
  const event = await prisma.event.findFirst({
    where: admin ? { id } : { id, organizer_id: user.id },
    include: {
      hosts: { include: { user: { select: { full_name: true, email: true, avatar_url: true } } } },
      access_codes: { where: { type: "global", is_active: true }, take: 1 },
      registrations: {
        include: {
          user: { select: { full_name: true, email: true, avatar_url: true } },
        },
        orderBy: { created_at: "desc" },
      },
      _count: { select: { registrations: true, matches: true, photos: true } },
    },
  });

  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  return NextResponse.json({ event });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = PatchEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const admin = await isAdmin(user.id);

  // Build the update data object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};

  if (d.name !== undefined) updateData.name = d.name;
  if (d.type !== undefined) updateData.type = d.type;
  if (d.venue_name !== undefined) updateData.venue_name = d.venue_name;
  if (d.venue_city !== undefined) updateData.venue_city = d.venue_city;
  if (d.search_duration_minutes !== undefined) updateData.search_duration_minutes = d.search_duration_minutes;
  if (d.gender_extended_mode !== undefined) updateData.gender_extended_mode = d.gender_extended_mode;
  if (d.match_mode !== undefined) updateData.match_mode = d.match_mode;
  if (d.super_likes_max !== undefined) updateData.super_likes_max = d.super_likes_max;
  if (d.language !== undefined) updateData.language = d.language;
  if (d.status !== undefined) updateData.status = d.status;
  if (d.max_guests !== undefined) updateData.max_guests = d.max_guests;
  if (d.whatsapp_group_url !== undefined) updateData.whatsapp_group_url = d.whatsapp_group_url?.trim() || null;
  if (d.plan_guest_limit !== undefined) updateData.plan_guest_limit = d.plan_guest_limit;
  if (d.expiry_type !== undefined) updateData.expiry_type = d.expiry_type;
  if (d.expiry_days !== undefined) updateData.expiry_days = d.expiry_days;

  // Handle search window times
  if (d.search_start_time !== undefined) {
    updateData.search_start_time = d.search_start_time ? new Date(d.search_start_time) : null;
  }
  if (d.search_end_time !== undefined) {
    updateData.search_end_time = d.search_end_time ? new Date(d.search_end_time) : null;
  }

  // Handle plan change — update plan_guest_limit automatically
  if (d.plan !== undefined) {
    updateData.plan = d.plan;
    if (d.plan_guest_limit === undefined) {
      updateData.plan_guest_limit = planLimits[d.plan] ?? null;
    }
  }

  // Handle event_date change — recalculate expiry_at and album_release_at
  if (d.event_date !== undefined) {
    const eventDate = new Date(d.event_date);
    updateData.event_date = eventDate;

    const albumReleaseAt = new Date(eventDate);
    albumReleaseAt.setDate(albumReleaseAt.getDate() + 1);
    albumReleaseAt.setHours(0, 0, 0, 0);
    updateData.album_release_at = albumReleaseAt;

    const expiryType = d.expiry_type ?? "custom_days";
    const expiryDays = d.expiry_days ?? 3;

    if (expiryType === "next_day") {
      const expiryAt = new Date(albumReleaseAt);
      expiryAt.setDate(expiryAt.getDate() + 1);
      updateData.expiry_at = expiryAt;
    } else if (expiryType === "custom_days") {
      const expiryAt = new Date(eventDate);
      expiryAt.setDate(expiryAt.getDate() + expiryDays);
      updateData.expiry_at = expiryAt;
    } else {
      updateData.expiry_at = null;
    }
  } else if (d.expiry_type !== undefined || d.expiry_days !== undefined) {
    // Recalculate expiry without event_date change — fetch current event_date
    const currentEvent = await prisma.event.findFirst({
      where: admin ? { id } : { id, organizer_id: user.id },
      select: { event_date: true, expiry_type: true, expiry_days: true },
    });
    if (currentEvent) {
      const eventDate = new Date(currentEvent.event_date);
      const expiryType = d.expiry_type ?? currentEvent.expiry_type;
      const expiryDays = d.expiry_days ?? currentEvent.expiry_days;

      if (expiryType === "next_day") {
        const albumReleaseAt = new Date(eventDate);
        albumReleaseAt.setDate(albumReleaseAt.getDate() + 1);
        albumReleaseAt.setHours(0, 0, 0, 0);
        const expiryAt = new Date(albumReleaseAt);
        expiryAt.setDate(expiryAt.getDate() + 1);
        updateData.expiry_at = expiryAt;
      } else if (expiryType === "custom_days") {
        const expiryAt = new Date(eventDate);
        expiryAt.setDate(expiryAt.getDate() + expiryDays);
        updateData.expiry_at = expiryAt;
      } else {
        updateData.expiry_at = null;
      }
    }
  }

  const result = await prisma.event.updateMany({
    where: admin ? { id } : { id, organizer_id: user.id },
    data: updateData,
  });

  if (!result.count) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // Return updated event
  const updated = await prisma.event.findUnique({
    where: { id },
    include: {
      hosts: { include: { user: { select: { full_name: true, email: true, avatar_url: true } } } },
      access_codes: { where: { type: "global", is_active: true }, take: 1 },
      _count: { select: { registrations: true, matches: true, photos: true } },
    },
  });

  return NextResponse.json({ success: true, event: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = await isAdmin(user.id);

  // Only admin can hard-delete; organizers can only close
  const { searchParams } = new URL(req.url);
  const hard = searchParams.get("hard") === "true";

  if (hard && !admin) {
    return NextResponse.json({ error: "Solo admin puede eliminar eventos" }, { status: 403 });
  }

  if (hard) {
    // Cascade delete related records (preserving referential integrity)
    await prisma.$transaction([
      prisma.matchMessage.deleteMany({ where: { match: { event_id: id } } }),
      prisma.eventMatch.deleteMany({ where: { event_id: id } }),
      prisma.eventLike.deleteMany({ where: { event_id: id } }),
      prisma.photoReport.deleteMany({ where: { photo: { event_id: id } } }),
      prisma.eventPhoto.deleteMany({ where: { event_id: id } }),
      prisma.eventRegistration.deleteMany({ where: { event_id: id } }),
      prisma.eventHost.deleteMany({ where: { event_id: id } }),
      prisma.eventAccessCode.deleteMany({ where: { event_id: id } }),
      prisma.appReview.deleteMany({ where: { event_id: id } }),
      prisma.webhook.deleteMany({ where: { event_id: id } }),
      prisma.event.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true, deleted: true });
  }

  // Default: soft-close
  await prisma.event.updateMany({
    where: admin ? { id } : { id, organizer_id: user.id },
    data: { status: "closed" },
  });

  return NextResponse.json({ success: true, closed: true });
}
