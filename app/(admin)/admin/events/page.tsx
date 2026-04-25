"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatEventDate } from "@/lib/utils/date";

type Event = {
  id: string;
  name: string;
  status: string;
  plan: string;
  type: string;
  event_date: string;
  venue_name: string | null;
  venue_city: string | null;
  max_guests: number | null;
  plan_guest_limit: number | null;
  organizer: { full_name: string; email: string };
  _count: { registrations: number; matches: number; photos: number };
};

const STATUS_COLOR: Record<string, string> = {
  draft: "#8585A8", active: "#10B981", closed: "#EF4444", expired: "#F59E0B",
};
const PLAN_COLOR: Record<string, string> = {
  spark: "#8585A8", connect: "#1A6EFF", vibe: "#7B2FBE", luxe: "#FFB800", elite: "#FF2D78", exclusive: "#10B981",
};
const TYPE_LABEL: Record<string, string> = {
  wedding: "Boda", birthday: "Cumpleaños", corporate: "Corporativo",
  graduation: "Graduación", concert: "Concierto", cruise: "Crucero", other: "Otro",
};
const MX_CITIES = ["CDMX", "Guadalajara", "Monterrey", "Puebla", "Queretaro", "Mérida", "Morelia", "Cancun", "Tijuana", "Leon", "Aguascalientes", "Oaxaca"];

const STATUSES = ["", "draft", "active", "closed", "expired"];
const PLANS = ["", "spark", "connect", "vibe", "luxe", "elite", "exclusive"];
const TYPES = ["", "wedding", "birthday", "corporate", "graduation", "concert", "cruise", "other"];

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    if (plan) params.set("plan", plan);
    if (type) params.set("type", type);
    if (city) params.set("city", city);
    if (query) params.set("q", query);
    fetch(`/api/v1/admin/events?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events ?? []);
        setTotal(d.total ?? 0);
        setPages(d.pages ?? 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, status, plan, type, city, query]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(eventId: string, eventName: string) {
    const confirmed = confirm(`ELIMINAR "${eventName}"?\n\nEsto borrara:\n- Todos los registros\n- Matches y likes\n- Fotos del album\n- Resenas\n\nEsta accion NO se puede deshacer.`);
    if (!confirmed) return;

    const res = await fetch(`/api/v1/events/${eventId}?hard=true`, { method: "DELETE" });
    if (res.ok) {
      load();
    } else {
      alert("Error al eliminar el evento");
    }
  }

  async function handleClose(eventId: string, eventName: string) {
    if (!confirm(`Cerrar "${eventName}"? Los invitados no podran registrarse.`)) return;
    await fetch(`/api/v1/events/${eventId}`, { method: "DELETE" });
    load();
  }

  async function handleToggleStatus(eventId: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "draft" : "active";
    await fetch(`/api/v1/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  function clearFilters() {
    setStatus(""); setPlan(""); setType(""); setCity(""); setSearch(""); setQuery(""); setPage(1);
  }

  const hasFilters = status || plan || type || city || query;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight" style={{ color: "#F0F0FF" }}>
          Todos los Eventos
        </h1>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.04)" }}>
            <button onClick={() => setViewMode("card")}
              className="px-2.5 py-1.5 rounded-lg transition-all"
              style={{ background: viewMode === "card" ? "rgba(255,45,120,0.15)" : "transparent" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={viewMode === "card" ? "#FF2D78" : "#8585A8"} strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button onClick={() => setViewMode("list")}
              className="px-2.5 py-1.5 rounded-lg transition-all"
              style={{ background: viewMode === "list" ? "rgba(255,45,120,0.15)" : "transparent" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={viewMode === "list" ? "#FF2D78" : "#8585A8"} strokeWidth={2}>
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" />
              </svg>
            </button>
          </div>

          <Link href="/events/new"
            className="px-4 py-2 rounded-xl text-sm font-bold hidden lg:flex items-center gap-2 transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>
            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo
          </Link>
        </div>
      </div>
      <p className="text-sm mb-6" style={{ color: "#8585A8" }}>
        <span style={{ color: "#FFB800", fontWeight: 700 }}>{total}</span> eventos en la plataforma
      </p>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#44445A" strokeWidth={2}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento por nombre, ciudad..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#F0F0FF" }} />
        </div>
        <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: "rgba(255,45,120,0.12)", color: "#FF2D78" }}>
          Buscar
        </button>
      </form>

      {/* Filters */}
      <div className="space-y-2 mb-6">
        {/* Estado */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold uppercase tracking-wider mr-1 w-16" style={{ color: "#44445A" }}>Estado</span>
          {STATUSES.map((s) => {
            const active = status === s;
            return (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: active ? "rgba(255,45,120,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? "rgba(255,45,120,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: active ? "#FF2D78" : "#8585A8",
                }}>
                {s === "" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Plan */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold uppercase tracking-wider mr-1 w-16" style={{ color: "#44445A" }}>Plan</span>
          {PLANS.map((p) => {
            const active = plan === p;
            return (
              <button key={p} onClick={() => { setPlan(p); setPage(1); }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
                style={{
                  background: active ? "rgba(123,47,190,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? "rgba(123,47,190,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: active ? "#7B2FBE" : "#8585A8",
                }}>
                {p === "" ? "Todos" : p}
              </button>
            );
          })}
        </div>

        {/* Tipo */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold uppercase tracking-wider mr-1 w-16" style={{ color: "#44445A" }}>Tipo</span>
          {TYPES.map((t) => {
            const active = type === t;
            return (
              <button key={t} onClick={() => { setType(t); setPage(1); }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: active ? "rgba(26,110,255,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? "rgba(26,110,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: active ? "#1A6EFF" : "#8585A8",
                }}>
                {t === "" ? "Todos" : TYPE_LABEL[t] ?? t}
              </button>
            );
          })}
        </div>

        {/* Ciudad */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold uppercase tracking-wider mr-1 w-16" style={{ color: "#44445A" }}>Ciudad</span>
          <button onClick={() => { setCity(""); setPage(1); }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{
              background: city === "" ? "rgba(255,184,0,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${city === "" ? "rgba(255,184,0,0.4)" : "rgba(255,255,255,0.06)"}`,
              color: city === "" ? "#FFB800" : "#8585A8",
            }}>
            Todas
          </button>
          {MX_CITIES.map((c) => {
            const active = city === c;
            return (
              <button key={c} onClick={() => { setCity(c); setPage(1); }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: active ? "rgba(255,184,0,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? "rgba(255,184,0,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: active ? "#FFB800" : "#8585A8",
                }}>
                {c}
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <button onClick={clearFilters}
            className="text-xs font-semibold underline" style={{ color: "#EF4444" }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Events */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl skeleton" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm font-bold" style={{ color: "#8585A8" }}>No se encontraron eventos</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {events.map((ev) => (
            <EventCard key={ev.id} ev={ev}
              onDelete={() => handleDelete(ev.id, ev.name)}
              onClose={() => handleClose(ev.id, ev.name)}
              onToggleStatus={() => handleToggleStatus(ev.id, ev.status)} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
          <table className="w-full">
            <thead style={{ background: "rgba(255,255,255,0.02)" }}>
              <tr>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider px-4 py-3" style={{ color: "#44445A" }}>Evento</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider px-4 py-3" style={{ color: "#44445A" }}>Ciudad</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider px-4 py-3" style={{ color: "#44445A" }}>Plan</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider px-4 py-3" style={{ color: "#44445A" }}>Estado</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider px-4 py-3" style={{ color: "#44445A" }}>Reg/Cupo</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider px-4 py-3" style={{ color: "#44445A" }}>Matches</th>
                <th className="text-right text-[10px] font-bold uppercase tracking-wider px-4 py-3" style={{ color: "#44445A" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const limit = ev.plan_guest_limit ?? ev.max_guests;
                return (
                  <tr key={ev.id} style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "#0F0F1A" }}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/events/${ev.id}`} className="text-sm font-bold hover:underline" style={{ color: "#F0F0FF" }}>
                        {ev.name}
                      </Link>
                      <p className="text-[10px]" style={{ color: "#44445A" }}>
                        {formatEventDate(ev.event_date, { day: "numeric", month: "short", year: "numeric" })} &middot; {ev.organizer.full_name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#8585A8" }}>
                      {ev.venue_city ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                        style={{ background: `${PLAN_COLOR[ev.plan] ?? "#555"}18`, color: PLAN_COLOR[ev.plan] ?? "#555" }}>
                        {ev.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                        style={{ background: `${STATUS_COLOR[ev.status] ?? "#555"}18`, color: STATUS_COLOR[ev.status] ?? "#555" }}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#F0F0FF" }}>
                      {ev._count.registrations}{limit ? `/${limit}` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#F0F0FF" }}>
                      {ev._count.matches}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleToggleStatus(ev.id, ev.status)}
                          title={ev.status === "active" ? "Desactivar" : "Activar"}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5">
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={ev.status === "active" ? "#FFB800" : "#10B981"} strokeWidth={2}>
                            {ev.status === "active" ? (
                              <path d="M10 9v6M14 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                              <path d="M8 5l12 7-12 7V5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(ev.id, ev.name)}
                          title="Eliminar"
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10">
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={2}>
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)", color: "#F0F0FF" }}>
            Anterior
          </button>
          <span className="text-sm font-bold" style={{ color: "#8585A8" }}>{page} de {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)", color: "#F0F0FF" }}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

// ── Card component ──
function EventCard({ ev, onDelete, onClose, onToggleStatus }: {
  ev: Event;
  onDelete: () => void;
  onClose: () => void;
  onToggleStatus: () => void;
}) {
  const limit = ev.plan_guest_limit ?? ev.max_guests;
  const capacityPercent = limit ? Math.round((ev._count.registrations / limit) * 100) : 0;

  return (
    <div className="rounded-2xl p-4 transition-all" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link href={`/admin/events/${ev.id}`} className="min-w-0 flex-1 hover:opacity-80 transition-opacity">
          <p className="font-bold text-sm truncate mb-0.5" style={{ color: "#F0F0FF" }}>{ev.name}</p>
          <p className="text-[10px]" style={{ color: "#8585A8" }}>
            {ev.organizer.full_name} &middot; {ev.venue_city ?? "Sin ciudad"}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: "#44445A" }}>
            {formatEventDate(ev.event_date, { day: "numeric", month: "short", year: "numeric" })} &middot; {TYPE_LABEL[ev.type] ?? ev.type}
          </p>
        </Link>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
            style={{ background: `${STATUS_COLOR[ev.status] ?? "#555"}18`, color: STATUS_COLOR[ev.status] ?? "#555" }}>
            {ev.status}
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
            style={{ background: `${PLAN_COLOR[ev.plan] ?? "#555"}18`, color: PLAN_COLOR[ev.plan] ?? "#555" }}>
            {ev.plan}
          </span>
        </div>
      </div>

      {/* Capacity bar */}
      {limit && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span style={{ color: "#8585A8" }}>{ev._count.registrations} / {limit}</span>
            <span style={{ color: capacityPercent >= 90 ? "#EF4444" : capacityPercent >= 70 ? "#FFB800" : "#10B981" }}>
              {capacityPercent}%
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="h-full rounded-full"
              style={{
                width: `${Math.min(100, capacityPercent)}%`,
                background: capacityPercent >= 90 ? "#EF4444" : capacityPercent >= 70 ? "#FFB800" : "linear-gradient(90deg, #FF2D78, #7B2FBE)",
              }} />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2 text-[10px]" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: "#44445A" }}>
        <span>{ev._count.registrations} reg</span>
        <span>{ev._count.matches} matches</span>
        <span>{ev._count.photos} fotos</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <button onClick={onToggleStatus}
          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold"
          style={{
            background: ev.status === "active" ? "rgba(255,184,0,0.08)" : "rgba(16,185,129,0.08)",
            color: ev.status === "active" ? "#FFB800" : "#10B981",
          }}>
          {ev.status === "active" ? "Desactivar" : "Activar"}
        </button>
        <button onClick={onClose}
          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold"
          style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }}>
          Cerrar
        </button>
        <button onClick={onDelete}
          className="w-8 py-1.5 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.12)" }}
          title="Eliminar permanentemente">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={2}>
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
