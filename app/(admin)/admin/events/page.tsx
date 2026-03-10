"use client";

export const dynamic = "force-dynamic";

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

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="skeleton h-4 w-44 rounded-lg mb-2.5" />
          <div className="skeleton h-3 w-32 rounded-lg mb-2" />
          <div className="skeleton h-3 w-24 rounded-lg" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
      </div>
      <div
        className="flex gap-5 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="skeleton h-3 w-20 rounded-lg" />
        <div className="skeleton h-3 w-20 rounded-lg" />
        <div className="skeleton h-3 w-20 rounded-lg" />
      </div>
    </div>
  );
}

/* SVG micro-icons for stats */
function IconUsers({ color = "#44445A" }: { color?: string }) {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconHeart({ color = "#44445A" }: { color?: string }) {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconCamera({ color = "#44445A" }: { color?: string }) {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1
          className="text-2xl lg:text-3xl font-black tracking-tight"
          style={{ color: "#F0F0FF" }}
        >
          Todos los Eventos
        </h1>
        <Link
          href="/events/new"
          className="px-5 py-2.5 rounded-xl text-sm font-bold hidden lg:flex items-center gap-2 transition-transform hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
            color: "#fff",
            boxShadow: "0 0 24px rgba(255,45,120,0.3), 0 0 48px rgba(123,47,190,0.15)",
          }}
        >
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo Evento
        </Link>
      </div>
      <p className="text-sm mb-6" style={{ color: "#8585A8" }}>
        <span style={{ color: "#FFB800", fontWeight: 700 }}>{total}</span>{" "}
        eventos en la plataforma
      </p>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#44445A"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento por nombre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-1"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#F0F0FF",
            }}
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-125"
          style={{ background: "rgba(255,45,120,0.12)", color: "#FF2D78" }}
        >
          Buscar
        </button>
      </form>

      {/* Status Filters */}
      <div className="flex gap-2 mb-3 flex-wrap items-center">
        <span
          className="text-xs font-bold uppercase tracking-wider mr-1"
          style={{ color: "#44445A" }}
        >
          Estado
        </span>
        {STATUSES.map((s) => {
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: active ? "rgba(255,45,120,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "rgba(255,45,120,0.4)" : "rgba(255,255,255,0.06)"}`,
                color: active ? "#FF2D78" : "#8585A8",
              }}
            >
              {s === "" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Plan Filters */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        <span
          className="text-xs font-bold uppercase tracking-wider mr-1"
          style={{ color: "#44445A" }}
        >
          Plan
        </span>
        {PLANS.map((p) => {
          const active = plan === p;
          return (
            <button
              key={p}
              onClick={() => {
                setPlan(p);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
              style={{
                background: active ? "rgba(123,47,190,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "rgba(123,47,190,0.4)" : "rgba(255,255,255,0.06)"}`,
                color: active ? "#7B2FBE" : "#8585A8",
              }}
            >
              {p === "" ? "Todos" : p}
            </button>
          );
        })}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <div
            className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <svg
              width={32}
              height={32}
              fill="none"
              viewBox="0 0 24 24"
              stroke="#44445A"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <p className="text-sm font-bold" style={{ color: "#8585A8" }}>
            No se encontraron eventos
          </p>
          <p className="text-xs mt-1" style={{ color: "#44445A" }}>
            Intenta cambiar los filtros o crear un nuevo evento
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((ev) => (
            <Link
              key={ev.id}
              href={`/admin/events/${ev.id}`}
              className="rounded-2xl p-5 block transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: "#0F0F1A",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p
                    className="font-bold text-sm truncate mb-0.5"
                    style={{ color: "#F0F0FF" }}
                  >
                    {ev.name}
                  </p>
                  <p className="text-xs" style={{ color: "#8585A8" }}>
                    {ev.organizer.full_name} &middot;{" "}
                    {ev.venue_name ?? ev.venue_city ?? "Sin ubicacion"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#44445A" }}>
                    {new Date(ev.event_date).toLocaleDateString("es-MX", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                    style={{
                      background: `${STATUS_COLOR[ev.status] ?? "#555"}18`,
                      color: STATUS_COLOR[ev.status] ?? "#555",
                    }}
                  >
                    {ev.status}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                    style={{
                      background: `${PLAN_COLOR[ev.plan] ?? "#555"}18`,
                      color: PLAN_COLOR[ev.plan] ?? "#555",
                    }}
                  >
                    {ev.plan}
                  </span>
                </div>
              </div>
              <div
                className="flex gap-5 pt-3 text-xs"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  color: "#44445A",
                }}
              >
                <span className="flex items-center gap-1.5">
                  <IconUsers />
                  {ev._count.registrations} registros
                </span>
                <span className="flex items-center gap-1.5">
                  <IconHeart />
                  {ev._count.matches} matches
                </span>
                <span className="flex items-center gap-1.5">
                  <IconCamera />
                  {ev._count.photos} fotos
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{
              background: "#0F0F1A",
              border: "1px solid rgba(255,255,255,0.04)",
              color: page === 1 ? "#44445A" : "#F0F0FF",
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            Anterior
          </button>
          <span className="text-sm font-bold" style={{ color: "#8585A8" }}>
            {page}{" "}
            <span style={{ color: "#44445A", fontWeight: 400 }}>de</span>{" "}
            {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{
              background: "#0F0F1A",
              border: "1px solid rgba(255,255,255,0.04)",
              color: page === pages ? "#44445A" : "#F0F0FF",
              cursor: page === pages ? "not-allowed" : "pointer",
            }}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Mobile FAB */}
      <Link
        href="/events/new"
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 z-50"
        style={{
          background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
          boxShadow: "0 0 24px rgba(255,45,120,0.4), 0 0 48px rgba(123,47,190,0.2)",
        }}
      >
        <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </div>
  );
}
