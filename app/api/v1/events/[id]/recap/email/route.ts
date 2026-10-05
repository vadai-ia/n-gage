import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/is-admin";
import { ensureRecapCode, recapUrl } from "@/lib/recap/code";
import { renderRecapEmail } from "@/lib/recap/email";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@ngage.com.mx";

const EmailSchema = z.object({
  recipients: z.array(z.string().email()).min(1).max(10),
});

// GET — destinatarios sugeridos (organizador + hosts). Solo admin.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      organizer: { select: { email: true } },
      hosts: { select: { user: { select: { email: true } } } },
    },
  });
  if (!event) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const recipients = Array.from(new Set([event.organizer.email, ...event.hosts.map((h) => h.user.email)]));
  return NextResponse.json({ recipients });
}

// POST { recipients } — envía el link + código del portal de recuerdos. Solo admin.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const parsed = EmailSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa los correos" }, { status: 400 });
  if (!resend) return NextResponse.json({ error: "RESEND_API_KEY no configurado" }, { status: 500 });

  const event = await prisma.event.findUnique({
    where: { id },
    select: { id: true, name: true, unique_slug: true, recap_code: true },
  });
  if (!event) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const code = await ensureRecapCode(event.id, event.recap_code);
  const { error } = await resend.emails.send({
    from: `N'GAGE <${FROM}>`,
    to: parsed.data.recipients,
    subject: `Los recuerdos de ${event.name} · N'GAGE`,
    html: renderRecapEmail({
      eventName: event.name,
      url: recapUrl(event.unique_slug),
      directUrl: recapUrl(event.unique_slug, code),
      code,
    }),
  });
  if (error) {
    console.error("[recap/email] Resend error:", error);
    return NextResponse.json({ error: "No se pudo enviar el email" }, { status: 502 });
  }

  return NextResponse.json({ success: true, sent_to: parsed.data.recipients });
}
