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
        _count: { select: { organized_events: true, registrations: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
}

// PATCH /api/v1/admin/users — suspender/activar usuario
export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { userId, action } = await req.json() as { userId: string; action: "suspend" | "activate" | "make_organizer" };

  const supabaseAdmin = getAdminClient();

  if (action === "suspend") {
    await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: "876600h" }); // ~100 años
    return NextResponse.json({ ok: true });
  }

  if (action === "activate") {
    await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: "none" });
    return NextResponse.json({ ok: true });
  }

  if (action === "make_organizer") {
    await prisma.user.update({ where: { id: userId }, data: { role: "EVENT_ORGANIZER" } });
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role: "EVENT_ORGANIZER" },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
