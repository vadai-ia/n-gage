"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Mail, Phone, Building2, Calendar, MapPin, X, Trash2, ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  LEAD_EVENT_TYPE_LABELS,
  LEAD_EVENT_SIZE_LABELS,
  type LEAD_EVENT_TYPES,
  type LEAD_EVENT_SIZES,
} from "@/lib/validations/lead.schema";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string | null;
  event_type: typeof LEAD_EVENT_TYPES[number];
  event_type_other: string | null;
  event_size: typeof LEAD_EVENT_SIZES[number];
  event_date: string | null;
  event_location: string | null;
  message: string | null;
  referral_source: string | null;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  notes: string | null;
  lost_reason: string | null;
  contacted_at: string | null;
  qualified_at: string | null;
  won_at: string | null;
  lost_at: string | null;
  created_at: string;
};

const STAGES: { id: Lead["status"]; label: string; color: string; sub: string }[] = [
  { id: "new",       label: "Nuevo",       color: "#FF2D78", sub: "Sin contactar" },
  { id: "contacted", label: "Contactado",  color: "#FFB800", sub: "Conversación abierta" },
  { id: "qualified", label: "Calificado",  color: "#1A6EFF", sub: "Buen ajuste" },
  { id: "proposal",  label: "Propuesta",   color: "#7B2FBE", sub: "Cotización enviada" },
  { id: "won",       label: "Cerrado",     color: "#10B981", sub: "Cliente firmado" },
  { id: "lost",      label: "Perdido",     color: "#44445A", sub: "Cerró por otro lado" },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Lead | null>(null);
  const [filter, setFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/leads", { cache: "no-store" });
      if (res.ok) {
        const j = await res.json();
        setLeads(j.leads);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const result: Record<Lead["status"], Lead[]> = {
      new: [], contacted: [], qualified: [], proposal: [], won: [], lost: [],
    };
    if (!leads) return result;
    const term = filter.trim().toLowerCase();
    for (const l of leads) {
      if (term) {
        const hay = `${l.full_name} ${l.email} ${l.company ?? ""} ${l.event_location ?? ""}`.toLowerCase();
        if (!hay.includes(term)) continue;
      }
      result[l.status].push(l);
    }
    return result;
  }, [leads, filter]);

  const totals = useMemo(() => {
    const t: Record<Lead["status"], number> = { new: 0, contacted: 0, qualified: 0, proposal: 0, won: 0, lost: 0 };
    if (!leads) return t;
    for (const l of leads) t[l.status]++;
    return t;
  }, [leads]);

  async function updateStatus(id: string, status: Lead["status"]) {
    setLeads((prev) => prev ? prev.map((l) => l.id === id ? { ...l, status } : l) : prev);
    if (active?.id === id) setActive((a) => a ? { ...a, status } : a);
    await fetch(`/api/v1/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function saveNotes(id: string, notes: string, lost_reason?: string) {
    await fetch(`/api/v1/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, lost_reason }),
    });
    setLeads((prev) => prev ? prev.map((l) => l.id === id ? { ...l, notes, lost_reason: lost_reason ?? l.lost_reason } : l) : prev);
  }

  async function destroyLead(id: string) {
    if (!confirm("¿Eliminar este lead permanentemente?")) return;
    await fetch(`/api/v1/admin/leads/${id}`, { method: "DELETE" });
    setLeads((prev) => prev ? prev.filter((l) => l.id !== id) : prev);
    setActive(null);
  }

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: "#07070F" }}>
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: "#FF2D78" }}>
              Pipeline comercial
            </p>
            <h1 className="font-display font-bold text-2xl lg:text-3xl" style={{ color: "#F0F0FF" }}>
              Leads de la landing
            </h1>
            <p className="text-sm mt-1" style={{ color: "#8585A8" }}>
              {leads ? `${leads.length} leads totales · ${totals.new} sin contactar` : "Cargando…"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar por nombre, email, empresa…"
              className="px-3 py-2 rounded-xl text-sm outline-none w-64"
              style={{ background: "rgba(15,15,26,0.6)", color: "#F0F0FF", border: "1px solid rgba(255,255,255,0.06)" }}
            />
            <button
              onClick={load}
              className="px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-mono"
              style={{ background: "rgba(15,15,26,0.6)", color: "#F0F0FF", border: "1px solid rgba(255,255,255,0.06)" }}
              aria-label="Recargar"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Recargar
            </button>
          </div>
        </div>

        {/* Stats por etapa */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {STAGES.map((s) => (
            <div
              key={s.id}
              className="px-3 py-3 rounded-xl"
              style={{ background: "rgba(15,15,26,0.6)", border: `1px solid ${s.color}25` }}
            >
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1" style={{ color: s.color }}>
                {s.label}
              </p>
              <p className="font-display font-bold text-2xl" style={{ color: "#F0F0FF" }}>
                {totals[s.id]}
              </p>
            </div>
          ))}
        </div>

        {/* Pipeline */}
        {loading && !leads ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {STAGES.map((s) => (
              <div key={s.id} className="h-96 rounded-2xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
            {STAGES.map((stage) => (
              <div
                key={stage.id}
                className="rounded-2xl flex flex-col"
                style={{ background: "rgba(15,15,26,0.4)", border: "1px solid rgba(255,255,255,0.04)", minHeight: 480 }}
              >
                <div
                  className="p-3 border-b flex items-center justify-between"
                  style={{ borderColor: "rgba(255,255,255,0.04)" }}
                >
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: stage.color }}>
                      {stage.label}
                    </p>
                    <p className="text-[10px]" style={{ color: "#44445A" }}>{stage.sub}</p>
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${stage.color}15`, color: stage.color, border: `1px solid ${stage.color}30` }}
                  >
                    {grouped[stage.id].length}
                  </span>
                </div>

                <div className="p-2 space-y-2 flex-1 overflow-y-auto" style={{ maxHeight: 720 }}>
                  {grouped[stage.id].length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs" style={{ color: "#44445A" }}>Sin leads en esta etapa</p>
                    </div>
                  ) : (
                    grouped[stage.id].map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        accent={stage.color}
                        onClick={() => setActive(lead)}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead detail drawer */}
      <AnimatePresence>
        {active && (
          <LeadDrawer
            lead={active}
            onClose={() => setActive(null)}
            onUpdateStatus={(s) => updateStatus(active.id, s)}
            onSaveNotes={(notes, lostReason) => saveNotes(active.id, notes, lostReason)}
            onDelete={() => destroyLead(active.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LeadCard({ lead, accent, onClick }: { lead: Lead; accent: string; onClick: () => void }) {
  const created = new Date(lead.created_at);
  const ageDays = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
  const ageLabel = ageDays === 0 ? "Hoy" : ageDays === 1 ? "Ayer" : `Hace ${ageDays}d`;
  const eventType = lead.event_type === "other" && lead.event_type_other
    ? lead.event_type_other
    : LEAD_EVENT_TYPE_LABELS[lead.event_type];
  const isHot = ageDays === 0 && lead.status === "new";

  return (
    <button
      onClick={onClick}
      className="group block w-full text-left p-3 rounded-xl transition-all hover:scale-[1.02]"
      style={{
        background: "rgba(7,7,15,0.6)",
        border: `1px solid ${isHot ? `${accent}40` : "rgba(255,255,255,0.04)"}`,
        boxShadow: isHot ? `0 0 0 1px ${accent}20` : "none",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="font-semibold text-sm leading-tight truncate" style={{ color: "#F0F0FF" }}>
          {lead.full_name}
        </p>
        {isHot && (
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5" style={{ background: `${accent}20`, color: accent }}>
            <Sparkles size={8} /> Hot
          </span>
        )}
      </div>
      <p className="text-xs truncate mb-2" style={{ color: "#8585A8" }}>
        {eventType} · {LEAD_EVENT_SIZE_LABELS[lead.event_size]}
      </p>
      <div className="flex items-center justify-between text-[10px] font-mono" style={{ color: "#44445A" }}>
        <span>{ageLabel}</span>
        {lead.company && <span className="truncate max-w-[100px]" style={{ color: "#8585A8" }}>{lead.company}</span>}
      </div>
    </button>
  );
}

function LeadDrawer({
  lead, onClose, onUpdateStatus, onSaveNotes, onDelete,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdateStatus: (status: Lead["status"]) => void;
  onSaveNotes: (notes: string, lostReason?: string) => void;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [lostReason, setLostReason] = useState(lead.lost_reason ?? "");
  const stage = STAGES.find((s) => s.id === lead.status)!;
  const eventType = lead.event_type === "other" && lead.event_type_other
    ? lead.event_type_other
    : LEAD_EVENT_TYPE_LABELS[lead.event_type];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(7,7,15,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl h-full overflow-y-auto"
        style={{ background: "#0F0F1A", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b sticky top-0 z-10"
          style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(15,15,26,0.95)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: stage.color }}>
                {stage.label}
              </span>
              <h3 className="font-display font-bold text-xl mt-1" style={{ color: "#F0F0FF" }}>
                {lead.full_name}
              </h3>
              <p className="text-xs mt-1" style={{ color: "#8585A8" }}>
                Creado el {new Date(lead.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <button onClick={onClose} className="p-2 -m-2" aria-label="Cerrar"><X size={20} style={{ color: "#8585A8" }} /></button>
          </div>

          {/* Stage transitions */}
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => onUpdateStatus(s.id)}
                disabled={s.id === lead.status}
                className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full transition-all"
                style={{
                  background: s.id === lead.status ? `${s.color}20` : "rgba(255,255,255,0.03)",
                  color: s.id === lead.status ? s.color : "#8585A8",
                  border: `1px solid ${s.id === lead.status ? s.color + "40" : "rgba(255,255,255,0.04)"}`,
                  cursor: s.id === lead.status ? "default" : "pointer",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact */}
          <Section title="Contacto">
            <Row icon={Mail} label="Email">
              <a href={`mailto:${lead.email}`} className="hover:underline" style={{ color: "#F0F0FF" }}>{lead.email}</a>
            </Row>
            <Row icon={Phone} label="Teléfono">
              <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener" className="hover:underline" style={{ color: "#F0F0FF" }}>
                {lead.phone}
              </a>
            </Row>
            {lead.company && <Row icon={Building2} label="Empresa">{lead.company}</Row>}
          </Section>

          {/* Evento */}
          <Section title="Evento">
            <Row icon={Sparkles} label="Tipo">{eventType}</Row>
            <Row icon={ChevronRight} label="Tamaño">{LEAD_EVENT_SIZE_LABELS[lead.event_size]}</Row>
            {lead.event_date && (
              <Row icon={Calendar} label="Fecha tentativa">
                {new Date(lead.event_date).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
              </Row>
            )}
            {lead.event_location && <Row icon={MapPin} label="Lugar">{lead.event_location}</Row>}
            {lead.referral_source && <Row icon={ArrowRight} label="Origen">{lead.referral_source}</Row>}
          </Section>

          {/* Mensaje */}
          {lead.message && (
            <Section title="Mensaje">
              <div className="p-4 rounded-xl text-sm leading-relaxed" style={{ background: "rgba(7,7,15,0.6)", color: "#F0F0FF", border: "1px solid rgba(255,255,255,0.04)" }}>
                {lead.message}
              </div>
            </Section>
          )}

          {/* UTMs */}
          {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
            <Section title="Atribución">
              <div className="flex flex-wrap gap-1.5">
                {lead.utm_source &&   <Pill label={`source: ${lead.utm_source}`} />}
                {lead.utm_medium &&   <Pill label={`medium: ${lead.utm_medium}`} />}
                {lead.utm_campaign && <Pill label={`campaign: ${lead.utm_campaign}`} />}
              </div>
            </Section>
          )}

          {/* Timeline */}
          {(lead.contacted_at || lead.qualified_at || lead.won_at || lead.lost_at) && (
            <Section title="Timeline">
              <ul className="text-sm space-y-1.5" style={{ color: "#8585A8" }}>
                {lead.contacted_at && <li>· Contactado: {new Date(lead.contacted_at).toLocaleString("es-MX")}</li>}
                {lead.qualified_at && <li>· Calificado: {new Date(lead.qualified_at).toLocaleString("es-MX")}</li>}
                {lead.won_at &&       <li>· Cerrado: {new Date(lead.won_at).toLocaleString("es-MX")}</li>}
                {lead.lost_at &&      <li>· Perdido: {new Date(lead.lost_at).toLocaleString("es-MX")}</li>}
              </ul>
            </Section>
          )}

          {/* Notas internas */}
          <Section title="Notas internas">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onSaveNotes(notes, lead.status === "lost" ? lostReason : undefined)}
              rows={4}
              placeholder="Próximos pasos, contexto de la llamada, link a propuesta…"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "rgba(7,7,15,0.6)", color: "#F0F0FF", border: "1px solid rgba(255,255,255,0.06)" }}
            />
            {lead.status === "lost" && (
              <input
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                onBlur={() => onSaveNotes(notes, lostReason)}
                placeholder="Razón de pérdida (precio, timing, otro vendor…)"
                className="mt-2 w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "rgba(7,7,15,0.6)", color: "#F0F0FF", border: "1px solid rgba(255,255,255,0.06)" }}
              />
            )}
          </Section>

          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-mono"
            style={{ color: "#ef4444", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <Trash2 size={14} /> Eliminar lead
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: "#FF2D78" }}>{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm py-1.5">
      <Icon size={14} style={{ color: "#44445A", marginTop: 3, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-wider mb-0.5" style={{ color: "#44445A" }}>{label}</p>
        <p className="break-words" style={{ color: "#F0F0FF" }}>{children}</p>
      </div>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-mono px-2 py-1 rounded-full"
      style={{ background: "rgba(26,110,255,0.08)", color: "#1A6EFF", border: "1px solid rgba(26,110,255,0.2)" }}>
      {label}
    </span>
  );
}
