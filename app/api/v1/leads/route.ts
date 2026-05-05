import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import {
  leadFormSchema,
  LEAD_EVENT_TYPE_LABELS,
  LEAD_EVENT_SIZE_LABELS,
} from "@/lib/validations/lead.schema";

export const runtime = "nodejs";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM     = process.env.RESEND_FROM_EMAIL ?? "noreply@automail.ngage.com.mx";
const TO_TEAM  = process.env.LEADS_TO_EMAIL    ?? "hola@ngage.com.mx";
const TEAM_LBL = "Equipo N'GAGE";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = leadFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const userAgent  = request.headers.get("user-agent") ?? null;
  const ipCountry  = request.headers.get("x-vercel-ip-country") ?? null;
  const eventDate  = data.event_date ? new Date(data.event_date) : null;

  let leadId: string;
  try {
    const lead = await prisma.lead.create({
      data: {
        full_name:         data.full_name.trim(),
        email:             data.email.trim().toLowerCase(),
        phone:             data.phone.trim(),
        company:           data.company?.trim() || null,
        event_type:        data.event_type,
        event_type_other:  data.event_type === "other" ? data.event_type_other?.trim() || null : null,
        event_size:        data.event_size,
        event_date:        eventDate,
        event_location:    data.event_location?.trim() || null,
        message:           data.message?.trim() || null,
        referral_source:   data.referral_source?.trim() || null,
        newsletter_opt_in: data.newsletter_opt_in,
        source:            "landing-main",
        utm_source:        data.utm_source   || null,
        utm_medium:        data.utm_medium   || null,
        utm_campaign:      data.utm_campaign || null,
        utm_content:       data.utm_content  || null,
        utm_term:          data.utm_term     || null,
        user_agent:        userAgent,
        ip_country:        ipCountry,
      },
      select: { id: true },
    });
    leadId = lead.id;
  } catch (err) {
    console.error("[/api/v1/leads] DB insert failed:", err);
    return NextResponse.json({ success: false, error: "DB error" }, { status: 500 });
  }

  // Send emails (best-effort: no fallar el endpoint si Resend falla)
  if (resend) {
    const internalSubject = `Nuevo lead: ${data.full_name} · ${LEAD_EVENT_TYPE_LABELS[data.event_type]} · ${LEAD_EVENT_SIZE_LABELS[data.event_size]}`;
    const internalHtml = renderInternalEmail({ ...data, leadId, eventDateIso: eventDate?.toISOString() ?? null });
    const confirmHtml  = renderConfirmationEmail({ fullName: data.full_name });

    try {
      await Promise.allSettled([
        resend.emails.send({
          from: `${TEAM_LBL} <${FROM}>`,
          to: TO_TEAM,
          replyTo: data.email,
          subject: internalSubject,
          html: internalHtml,
        }),
        resend.emails.send({
          from: `${TEAM_LBL} <${FROM}>`,
          to: data.email,
          subject: "Recibimos tu solicitud · N'GAGE",
          html: confirmHtml,
        }),
      ]);
    } catch (err) {
      console.error("[/api/v1/leads] Resend error:", err);
    }
  } else {
    console.warn("[/api/v1/leads] RESEND_API_KEY no configurado — email skip");
  }

  return NextResponse.json({ success: true, leadId });
}

function renderInternalEmail(d: {
  full_name: string; email: string; phone: string; company?: string;
  event_type: keyof typeof LEAD_EVENT_TYPE_LABELS; event_type_other?: string;
  event_size: keyof typeof LEAD_EVENT_SIZE_LABELS;
  eventDateIso: string | null; event_location?: string; message?: string; referral_source?: string;
  newsletter_opt_in: boolean; leadId: string;
  utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string; utm_term?: string;
}) {
  const row = (k: string, v?: string | null) =>
    v ? `<tr><td style="padding:8px 12px;color:#8585A8;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">${k}</td><td style="padding:8px 12px;color:#F0F0FF;font-weight:600;">${v}</td></tr>` : "";
  return `<!doctype html><html><body style="margin:0;background:#07070F;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#F0F0FF;">
    <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
      <div style="background:linear-gradient(135deg,#FF2D78,#7B2FBE,#1A6EFF);padding:1px;border-radius:16px;">
        <div style="background:#0F0F1A;border-radius:15px;padding:32px;">
          <p style="margin:0 0 8px;color:#FF2D78;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;">Nuevo lead landing</p>
          <h1 style="margin:0 0 24px;font-size:24px;color:#F0F0FF;">${d.full_name}</h1>
          <table style="width:100%;border-collapse:collapse;border-spacing:0;">
            ${row("Email", d.email)}
            ${row("Teléfono", d.phone)}
            ${row("Empresa", d.company)}
            ${row("Tipo de evento", `${LEAD_EVENT_TYPE_LABELS[d.event_type]}${d.event_type === "other" && d.event_type_other ? ` (${d.event_type_other})` : ""}`)}
            ${row("Tamaño", LEAD_EVENT_SIZE_LABELS[d.event_size])}
            ${row("Fecha tentativa", d.eventDateIso ? new Date(d.eventDateIso).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }) : null)}
            ${row("Ubicación", d.event_location)}
            ${row("Origen", d.referral_source)}
            ${row("Newsletter", d.newsletter_opt_in ? "Sí" : "No")}
            ${row("UTM source", d.utm_source)}
            ${row("UTM medium", d.utm_medium)}
            ${row("UTM campaign", d.utm_campaign)}
          </table>
          ${d.message ? `<div style="margin-top:24px;padding:16px;background:#161625;border-radius:12px;"><p style="margin:0 0 8px;color:#8585A8;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Mensaje</p><p style="margin:0;color:#F0F0FF;line-height:1.6;">${escapeHtml(d.message)}</p></div>` : ""}
          <p style="margin-top:24px;color:#44445A;font-size:11px;font-family:monospace;">Lead ID: ${d.leadId}</p>
        </div>
      </div>
    </div>
  </body></html>`;
}

function renderConfirmationEmail({ fullName }: { fullName: string }) {
  const firstName = fullName.split(" ")[0];
  return `<!doctype html><html><body style="margin:0;background:#07070F;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#F0F0FF;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#FF2D78,#7B2FBE,#1A6EFF);color:#fff;font-size:18px;font-weight:900;line-height:48px;text-align:center;box-shadow:0 0 24px rgba(255,45,120,0.4);">N</div>
      </div>
      <div style="background:#0F0F1A;border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:36px 28px;">
        <h1 style="margin:0 0 12px;font-size:28px;line-height:1.15;color:#F0F0FF;">Recibimos tu solicitud, ${escapeHtml(firstName)}.</h1>
        <p style="margin:0 0 20px;color:#8585A8;font-size:15px;line-height:1.65;">Te contactamos en menos de 24 horas para entender tu evento y armarte una propuesta a medida. Si nos contactaste fuera de horario de oficina (CDMX), respondemos al inicio del siguiente día hábil.</p>
        <p style="margin:0 0 24px;color:#F0F0FF;font-size:18px;font-style:italic;line-height:1.4;">Mientras tanto, una promesa: <strong style="background:linear-gradient(135deg,#FF2D78,#1A6EFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">no todo son looks, también son feels</strong>.</p>
        <a href="https://www.ngage.com.mx" style="display:inline-block;padding:14px 28px;border-radius:999px;background:linear-gradient(135deg,#FF2D78,#7B2FBE,#1A6EFF);color:#fff;font-weight:700;text-decoration:none;font-size:14px;">Volver a la web</a>
      </div>
      <p style="margin-top:24px;text-align:center;color:#44445A;font-size:12px;line-height:1.6;">N&apos;GAGE · Conecta. Aquí y ahora.<br/>Si no esperabas este correo, ignóralo. No fuiste agregado a ninguna lista.</p>
    </div>
  </body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
