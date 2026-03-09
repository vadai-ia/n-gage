"use client";

import { useEffect, useState, useCallback } from "react";

type Event = {
  id: string;
  name: string;
  status: string;
  plan: string;
  type: string;
  event_date: string;
  venue_city: string | null;
  organizer: { full_name: string; email: string };
  _count: { registrations: number; matches: number; photos: number };
};

const STATUS_COLOR: Record<string, string> = {
  draft: "#A0A0B0", active: "#10B981", closed: "#EF4444", archived: "#555",
};

const PLAN_COLOR: Record<string, string> = {
  free: "#A0A0B0", basic: "#2B86C5", pro: "#784BA0", elite: "#F59E0B",
};

export default function AdminEventsPage() {
  const [events,  setEvents]  = useState<Event[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState("");
  const [search,  setSearch]  = useState("");
  const [query,   setQuery]   = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    if (query)  params.set("q", query);
    fetch(`/api/v1/admin/events?${params}`)
      .then((r) => r.json())
      .then((d) => { setEvents(d.events ?? []); setTotal(d.total ?? 0); setPages(d.pages ?? 1); setLoading(false); });
  }, [page, status, query]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">Todos los Eventos</h1>
      <p className="text-sm mb-4" style={{ color: "#A0A0B0" }}>
        <span style={{ color: "#F59E0B", fontWeight: 700 }}>{total}</span> eventos en la plataforma
      </p>

      {/* Búsqueda */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar evento..."
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}
        />
        <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B" }}>
          Buscar
        </button>
      </form>

      {/* Filtros estado */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["", "draft", "active", "closed", "archived"].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              background: status === s ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${status === s ? "#F59E0B" : "rgba(255,255,255,0.08)"}`,
              color: status === s ? "#F59E0B" : "#A0A0B0",
            }}>
            {s === "" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "#16161F" }} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎉</div>
          <p style={{ color: "#A0A0B0" }}>No se encontraron eventos</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((ev) => (
            <div key={ev.id} className="rounded-2xl p-4"
              style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{ev.name}</p>
                  <p className="text-xs" style={{ color: "#A0A0B0" }}>
                    {ev.organizer.full_name} · {ev.venue_city ?? "Sin ciudad"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                    {new Date(ev.event_date).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                    style={{ background: `${STATUS_COLOR[ev.status]}22`, color: STATUS_COLOR[ev.status] }}>
                    {ev.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase"
                    style={{ background: `${PLAN_COLOR[ev.plan] ?? "#555"}22`, color: PLAN_COLOR[ev.plan] ?? "#555" }}>
                    {ev.plan}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 text-xs" style={{ color: "#555" }}>
                <span>👥 {ev._count.registrations} reg.</span>
                <span>💑 {ev._count.matches} matches</span>
                <span>📸 {ev._count.photos} fotos</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm" style={{ background: "#16161F", color: page === 1 ? "#555" : "#ccc" }}>
            ← Ant.
          </button>
          <span className="px-4 py-2 text-sm" style={{ color: "#A0A0B0" }}>{page} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            className="px-4 py-2 rounded-xl text-sm" style={{ background: "#16161F", color: page === pages ? "#555" : "#ccc" }}>
            Sig. →
          </button>
        </div>
      )}
    </div>
  );
}
