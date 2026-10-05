import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getUserEventRole } from "@/lib/auth/event-access";
import { ensureRecapCode, generateRecapCode, recapUrl } from "@/lib/recap/code";

const ActionSchema = z.object({ action: z.literal("regenerate") });

async function loadEvent(eventId: string) {
  return prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, unique_slug: true, recap_code: true },
  });
}

// GET — link + código del portal de recuerdos (organizador, hosts y admin)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const role = await getUserEventRole(user.id, id);
  if (role === "guest") return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const event = await loadEvent(id);
  if (!event) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const code = await ensureRecapCode(event.id, event.recap_code);
  return NextResponse.json({
    code,
    url: recapUrl(event.unique_slug),
    direct_url: recapUrl(event.unique_slug, code),
    can_regenerate: role === "super_admin" || role === "organizer",
    can_email: role === "super_admin",
  });
}

// POST { action: "regenerate" } — invalida el código anterior (organizador o admin)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const role = await getUserEventRole(user.id, id);
  if (role !== "super_admin" && role !== "organizer") {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const parsed = ActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Acción inválida" }, { status: 400 });

  const event = await loadEvent(id);
  if (!event) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const code = generateRecapCode();
  await prisma.event.update({ where: { id }, data: { recap_code: code } });
  return NextResponse.json({
    code,
    url: recapUrl(event.unique_slug),
    direct_url: recapUrl(event.unique_slug, code),
  });
}
