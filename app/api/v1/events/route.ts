import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/is-admin";
import { z } from "zod";
import QRCode from "qrcode";

const CreateEventSchema = z.object({
  name: z.string().min(3),
  type: z.enum(["wedding", "birthday", "corporate", "graduation", "concert", "cruise", "other"]),
  event_date: z.string(),
  venue_name: z.string().optional(),
  venue_city: z.string().optional(),
  search_duration_minutes: z.number().min(15).max(480).default(60),
  search_start_time: z.string().nullable().optional(),
  search_end_time: z.string().nullable().optional(),
  expiry_type: z.enum(["next_day", "custom_days", "never"]).default("custom_days"),
  expiry_days: z.number().min(1).max(30).default(3),
  max_guests: z.number().optional(),
  plan: z.enum(["spark", "connect", "vibe", "luxe", "elite", "exclusive"]).default("vibe"),
  gender_extended_mode: z.boolean().default(false),
  language: z.string().default("es-MX"),
  access_code: z.string().min(4).max(20),
  whatsapp_group_url: z.string().url().optional().or(z.literal("")),
  event_photos: z.array(z.string().url()).max(10).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = await isAdmin(user.id);
  const events = await prisma.event.findMany({
    where: admin ? {} : { organizer_id: user.id },
    orderBy: { created_at: "desc" },
    include: { _count: { select: { registrations: true, matches: true } } },
  });

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const body = await req.json();
    const parsed = CreateEventSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Event create validation failed:", parsed.error.flatten());
      return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const d = parsed.data;
    const eventDate = new Date(d.event_date);

    // Calculate dates
    const albumReleaseAt = new Date(eventDate);
    albumReleaseAt.setDate(albumReleaseAt.getDate() + 1);
    albumReleaseAt.setHours(0, 0, 0, 0);

    let expiryAt: Date | null = null;
    if (d.expiry_type === "next_day") {
      expiryAt = new Date(albumReleaseAt);
      expiryAt.setDate(expiryAt.getDate() + 1);
    } else if (d.expiry_type === "custom_days") {
      expiryAt = new Date(eventDate);
      expiryAt.setDate(expiryAt.getDate() + d.expiry_days);
    }

    // Plan guest limits
    const planLimits: Record<string, number> = {
      spark: 50, connect: 100, vibe: 200, luxe: 350, elite: 500, exclusive: 9999,
    };

    // Generate unique slug
    const baseSlug = d.name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 40);
    const unique_slug = `${baseSlug}-${Date.now().toString(36)}`;

    // App URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const eventUrl = `${appUrl}/e/${unique_slug}?code=${d.access_code}`;

    // Generate QR
    const qrDataUrl = await QRCode.toDataURL(eventUrl, {
      width: 400, margin: 2,
      color: { dark: "#FF2D78", light: "#0A0A0F" },
    });

    // Build optional search window fields
    const searchStartTime = d.search_start_time ? new Date(d.search_start_time) : undefined;
    const searchEndTime = d.search_end_time ? new Date(d.search_end_time) : undefined;

    const event = await prisma.event.create({
      data: {
        organizer_id: user.id,
        name: d.name,
        type: d.type as never,
        event_date: eventDate,
        venue_name: d.venue_name,
        venue_city: d.venue_city,
        status: "draft",
        language: d.language,
        gender_extended_mode: d.gender_extended_mode,
        search_duration_minutes: d.search_duration_minutes,
        search_start_time: searchStartTime,
        search_end_time: searchEndTime,
        expiry_type: d.expiry_type as never,
        expiry_days: d.expiry_days,
        expiry_at: expiryAt,
        album_release_at: albumReleaseAt,
        max_guests: d.max_guests,
        plan: d.plan as never,
        plan_guest_limit: planLimits[d.plan],
        unique_slug,
        whatsapp_group_url: d.whatsapp_group_url?.trim() || null,
        event_photos: d.event_photos ?? [],
        qr_code_url: qrDataUrl,
        access_codes: {
          create: {
            code: d.access_code,
            type: "global",
            is_active: true,
          },
        },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error("POST /api/v1/events error:", err);
    const message = err instanceof Error ? err.message : "Error desconocido al crear el evento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
