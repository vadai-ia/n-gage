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

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const plan   = searchParams.get("plan");
  const type   = searchParams.get("type");
  const city   = searchParams.get("city");
  const search = searchParams.get("q");
  const page   = parseInt(searchParams.get("page") ?? "1");
  const limit  = 20;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (plan)   where.plan   = plan;
  if (type)   where.type   = type;
  if (city)   where.venue_city = { contains: city, mode: "insensitive" };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { venue_city: { contains: search, mode: "insensitive" } },
      { venue_name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        organizer: { select: { full_name: true, email: true } },
        _count: { select: { registrations: true, matches: true, photos: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({ events, total, page, pages: Math.ceil(total / limit) });
}
