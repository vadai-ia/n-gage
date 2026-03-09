"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Event = {
  id: string;
  name: string;
  status: string;
  plan: string;
  type: string;
  event_date: string;
  venue_name: string | null;
  venue_city: string | null;
  organizer: { full_name: string; email: string };
  _count: { registrations: number; matches: number; photos: number };
};

const STATUS_COLOR: Record<string, string> = {
  draft: "#8585A8",
  active: "#10B981",
  closed: "#EF4444",
  expired: "#F59E0B",
};

const PLAN_COLOR: Record<string, string> = {
  spark: "#8585A8",
  connect: "#1A6EFF",
  vibe: "#7B2FBE",
  luxe: "#FFB800",
  elite: "#FF2D78",
  exclusive: "#10B981",
};

const STATUSES = ["", "draft", "active", "closed", "expired"];
const PLANS = ["", "spark", "connect", "vibe", "luxe", "elite", "exclusive"];

function SkeletonRow() {
  return (
    <div
      className="rounded-2xl p-4 animate-pulse"
      style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <div className="h-4 w-40 rounded mb-2" style={{ background: "#1a1a2e" }} />
          <div className="h-3 w-28 rounded" style={{ background: "#1a1a2e" }} />
        </div>
        <div className="h-5 w-16 rounded-full" style={{ background: "#1a1a2e" }} />
      </div>
      <div className="h-3 w-48 rounded" style={{ background: "#1a1a2e" }} />
    </div>
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    if (plan) params.set("plan", plan);
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
  }, [page, status, plan, query]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "#F0F0FF" }}>
          Todos los Eventos
        </h1>
        <Link
          href="/dashboard/events/new"
          className="px-4 py-2 rounded-xl text-sm font-semibold hidden lg:flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}
        >
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo Evento
        </Link>
      </div>
      <p className="text-sm mb-5" style={{ color: "#8585A8" }}>
        <span style={{ color: "#FFB800", fontWeight: 700 }}>{total}</span> eventos en la plataforma
      </p>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar evento por nombre..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-1"
          style={{
            background: "#0F0F1A",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#F0F0FF",
          }}
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}
        >
          Buscar
        </button>
      </form>

      {/* Status Filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <span className="text-xs font-semibold self-center mr-1" style={{ color: "#44445A" }}>
          Estado:
        </span>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
            style={{
              background: status === s ? "rgba(255,45,120,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${status === s ? "#FF2D78" : "rgba(255,255,255,0.06)"}`,
              color: status === s ? "#FF2D78" : "#8585A8",
            }}
          >
            {s === "" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Plan Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <span className="text-xs font-semibold self-center mr-1" style={{ color: "#44445A" }}>
          Plan:
        </span>
        {PLANS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setPlan(p);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors"
            style={{
              background: plan === p ? "rgba(123,47,190,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${plan === p ? "#7B2FBE" : "rgba(255,255,255,0.06)"}`,
              color: plan === p ? "#7B2FBE" : "#8585A8",
            }}
          >
            {p === "" ? "Todos" : p}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">
            <svg
              width={48}
              height={48}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              className="mx-auto"
              style={{ color: "#44445A" }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <p style={{ color: "#8585A8" }}>No se encontraron eventos</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((ev) => (
            <Link
              key={ev.id}
              href={`/admin/events/${ev.id}`}
              className="rounded-2xl p-4 transition-colors hover:brightness-110 block"
              style={{
                background: "#0F0F1A",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate" style={{ color: "#F0F0FF" }}>
                    {ev.name}
                  </p>
                  <p className="text-xs" style={{ color: "#8585A8" }}>
                    {ev.organizer.full_name} &middot; {ev.venue_name ?? ev.venue_city ?? "Sin ubicacion"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#44445A" }}>
                    {new Date(ev.event_date).toLocaleDateString("es-MX", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                    style={{
                      background: `${STATUS_COLOR[ev.status] ?? "#555"}22`,
                      color: STATUS_COLOR[ev.status] ?? "#555",
                    }}
                  >
                    {ev.status}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase"
                    style={{
                      background: `${PLAN_COLOR[ev.plan] ?? "#555"}22`,
                      color: PLAN_COLOR[ev.plan] ?? "#555",
                    }}
                  >
                    {ev.plan}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 text-xs" style={{ color: "#44445A" }}>
                <span>{ev._count.registrations} registros</span>
                <span>{ev._count.matches} matches</span>
                <span>{ev._count.photos} fotos</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: "#0F0F1A",
              border: "1px solid rgba(255,255,255,0.06)",
              color: page === 1 ? "#44445A" : "#F0F0FF",
            }}
          >
            Anterior
          </button>
          <span className="text-sm" style={{ color: "#8585A8" }}>
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: "#0F0F1A",
              border: "1px solid rgba(255,255,255,0.06)",
              color: page === pages ? "#44445A" : "#F0F0FF",
            }}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
