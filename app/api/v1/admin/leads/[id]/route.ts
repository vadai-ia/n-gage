import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/is-admin";

export const runtime = "nodejs";

const STATUS = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;

const updateSchema = z.object({
  status:      z.enum(STATUS).optional(),
  notes:       z.string().max(2000).optional(),
  lost_reason: z.string().max(160).optional().or(z.literal("")),
  assigned_to: z.string().max(80).optional().or(z.literal("")),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid", issues: parsed.error.flatten() }, { status: 422 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  // Time-stamps automáticos según transición
  if (parsed.data.status) {
    const now = new Date();
    if (parsed.data.status === "contacted") data.contacted_at = now;
    if (parsed.data.status === "qualified") data.qualified_at = now;
    if (parsed.data.status === "won")       data.won_at       = now;
    if (parsed.data.status === "lost")      data.lost_at      = now;
  }

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json({ lead });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
