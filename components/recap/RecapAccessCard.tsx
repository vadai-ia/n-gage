"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Mail, MessageCircle, RefreshCw, Sparkles } from "lucide-react";

type RecapAccess = {
  code: string;
  url: string;
  direct_url: string;
  can_regenerate: boolean;
  can_email: boolean;
};

const buttonClass = "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]";
const neutralStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#B8B8D0" };

export default function RecapAccessCard({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [access, setAccess] = useState<RecapAccess | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [copied, setCopied] = useState<"link" | "message" | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [recipients, setRecipients] = useState("");
  const [emailState, setEmailState] = useState<{ status: "idle" | "sending" | "sent" | "error"; message?: string }>({ status: "idle" });

  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/recap`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setAccess)
      .catch(() => setLoadError(true));
  }, [eventId]);

  if (loadError) return null;
  if (!access) {
    return <div className="mb-4 h-44 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />;
  }

  const shareMessage =
    `Los recuerdos de ${eventName} ya están listos ✨\n` +
    `Entra aquí: ${access.direct_url}\n` +
    `Código de acceso: ${access.code}`;

  async function copy(text: string, kind: "link" | "message") {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  async function regenerate() {
    if (!confirm("Se generará un código nuevo y el anterior dejará de funcionar. ¿Continuar?")) return;
    setRegenerating(true);
    const res = await fetch(`/api/v1/events/${eventId}/recap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "regenerate" }),
    });
    if (res.ok) {
      const next = await res.json();
      setAccess((a) => (a ? { ...a, ...next } : a));
    }
    setRegenerating(false);
  }

  async function openEmail() {
    setEmailOpen(true);
    setEmailState({ status: "idle" });
    if (recipients) return;
    const res = await fetch(`/api/v1/events/${eventId}/recap/email`);
    if (res.ok) {
      const body = await res.json();
      setRecipients((body.recipients as string[]).join(", "));
    }
  }

  async function sendEmail() {
    const list = recipients.split(/[,;\s]+/).map((r) => r.trim()).filter(Boolean);
    if (list.length === 0) {
      setEmailState({ status: "error", message: "Agrega al menos un correo" });
      return;
    }
    setEmailState({ status: "sending" });
    const res = await fetch(`/api/v1/events/${eventId}/recap/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipients: list }),
    });
    const body = await res.json().catch(() => ({}));
    setEmailState(res.ok
      ? { status: "sent", message: `Enviado a ${list.join(", ")}` }
      : { status: "error", message: body.error ?? "No se pudo enviar" });
  }

  return (
    <section
      className="mb-6 rounded-2xl p-4"
      style={{ background: "linear-gradient(160deg, rgba(255,45,120,0.08), rgba(26,110,255,0.05))", border: "1px solid rgba(255,45,120,0.2)" }}
    >
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}>
          <Sparkles size={18} aria-hidden />
        </span>
        <div>
          <h3 className="text-sm font-black tracking-tight" style={{ color: "#F0F0FF" }}>Portal de recuerdos</h3>
          <p className="text-xs" style={{ color: "#8585A8" }}>
            Resumen público del evento con matches, premios y fotos. Se actualiza en vivo y nunca caduca.
          </p>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl p-3" style={{ background: "rgba(7,7,15,0.6)" }}>
        <div className="min-w-0">
          <p className="text-xs" style={{ color: "#8585A8" }}>Código de acceso</p>
          <p className="font-mono text-2xl font-bold tracking-[0.3em]" style={{ color: "#FF2D78" }}>{access.code}</p>
          <p className="truncate font-mono text-xs" style={{ color: "#6F6F8C" }}>{access.url.replace(/^https?:\/\//, "")}</p>
        </div>
        {access.can_regenerate && (
          <button
            type="button"
            onClick={regenerate}
            disabled={regenerating}
            aria-label="Generar un código nuevo"
            title="Generar un código nuevo"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
            style={neutralStyle}
          >
            <RefreshCw size={16} className={regenerating ? "animate-spin" : ""} aria-hidden />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => copy(access.direct_url, "link")} className={buttonClass} style={neutralStyle}>
          {copied === "link" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          {copied === "link" ? "¡Copiado!" : "Copiar link"}
        </button>
        <button type="button" onClick={() => copy(shareMessage, "message")} className={buttonClass} style={neutralStyle}>
          {copied === "message" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          {copied === "message" ? "¡Copiado!" : "Copiar mensaje"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)", color: "#25D366" }}
        >
          <MessageCircle size={16} aria-hidden /> WhatsApp
        </a>
        <a href={access.direct_url} target="_blank" rel="noopener noreferrer" className={buttonClass} style={{ background: "rgba(255,45,120,0.1)", border: "1px solid rgba(255,45,120,0.25)", color: "#FF2D78" }}>
          <ExternalLink size={16} aria-hidden /> Abrir
        </a>
      </div>

      {access.can_email && (
        <div className="mt-3">
          {!emailOpen ? (
            <button type="button" onClick={openEmail} className={`${buttonClass} w-full`} style={neutralStyle}>
              <Mail size={16} aria-hidden /> Enviar por email
            </button>
          ) : (
            <div className="rounded-xl p-3" style={{ background: "rgba(7,7,15,0.6)" }}>
              <label htmlFor={`recap-email-${eventId}`} className="mb-1.5 block text-xs font-semibold" style={{ color: "#B8B8D0" }}>
                Destinatarios (separados por coma)
              </label>
              <input
                id={`recap-email-${eventId}`}
                type="text"
                inputMode="email"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="novia@correo.com, novio@correo.com"
                className="mb-2 h-11 w-full rounded-xl px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#F0F0FF" }}
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setEmailOpen(false)} className={buttonClass} style={neutralStyle}>Cancelar</button>
                <button
                  type="button"
                  onClick={sendEmail}
                  disabled={emailState.status === "sending"}
                  className={buttonClass}
                  style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}
                >
                  {emailState.status === "sending" ? "Enviando…" : "Enviar"}
                </button>
              </div>
              {emailState.message && (
                <p role="status" className="mt-2 text-xs" style={{ color: emailState.status === "error" ? "#F87171" : "#34D399" }}>
                  {emailState.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
