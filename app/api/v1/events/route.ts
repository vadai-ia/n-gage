import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import QRCode from "qrcode";

const CreateEventSchema = z.object({
  name: z.string().min(3),
  type: z.enum(["wedding", "birthday", "corporate", "graduation", "concert", "cruise", "other"]),
  event_date: z.string(),
  venue_name: z.string().optional(),
  venue_city: z.string().optional(),
  search_duration_minutes: z.number().min(15).max(480).default(60),
  expiry_type: z.enum(["next_day", "custom_days", "never"]).default("custom_days"),
  expiry_days: z.number().min(1).max(30).default(3),
  max_guests: z.number().optional(),
  plan: z.enum(["spark", "connect", "vibe", "luxe", "elite", "exclusive"]).default("vibe"),
  gender_extended_mode: z.boolean().default(false),
  language: z.string().default("es-MX"),
  access_code: z.string().min(4).max(20),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const events = await prisma.event.findMany({
    where: { organizer_id: user.id },
    orderBy: { created_at: "desc" },
    include: { _count: { select: { registrations: true, matches: true } } },
  });

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const eventDate = new Date(d.event_date);

  // Calcular fechas
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

  // Generar slug único
  const baseSlug = d.name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 40);
  const unique_slug = `${baseSlug}-${Date.now().toString(36)}`;

  // URL del app
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const eventUrl = `${appUrl}/e/${unique_slug}?code=${d.access_code}`;

  // Generar QR
  const qrDataUrl = await QRCode.toDataURL(eventUrl, {
    width: 400, margin: 2,
    color: { dark: "#FF3CAC", light: "#0A0A0F" },
  });

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
      expiry_type: d.expiry_type as never,
      expiry_days: d.expiry_days,
      expiry_at: expiryAt,
      album_release_at: albumReleaseAt,
      max_guests: d.max_guests,
      plan: d.plan as never,
      plan_guest_limit: planLimits[d.plan],
      unique_slug,
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
}
