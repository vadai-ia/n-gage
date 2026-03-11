import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/is-admin";
import { z } from "zod";

const CreateCodeSchema = z.object({
  type: z.enum(["global", "individual"]).default("global"),
  assigned_to_email: z.string().email().nullable().optional(),
});

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
    select: { id: true },
  });
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const codes = await prisma.eventAccessCode.findMany({
    where: { event_id: id },
    orderBy: { created_at: "asc" },
  });

  return NextResponse.json({ codes });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = await isAdmin(user.id);
  const event = await prisma.event.findFirst({
    where: admin ? { id } : { id, organizer_id: user.id },
    select: { id: true },
  });
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = CreateCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { type, assigned_to_email } = parsed.data;
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const newCode = await prisma.eventAccessCode.create({
    data: {
      event_id: id,
      code,
      type,
      assigned_to_email: assigned_to_email ?? null,
      is_active: true,
    },
  });

  return NextResponse.json({ code: newCode });
}
