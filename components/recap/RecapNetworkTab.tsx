"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Network, Search, Users } from "lucide-react";
import { useRecap } from "@/lib/contexts/RecapContext";
import type { RecapPerson } from "@/lib/recap/types";
import RecapCard from "./RecapCard";
import ConnectionGraph from "./ConnectionGraph";
import PersonAvatar from "./PersonAvatar";

type Sort = "received" | "matches" | "sent" | "name";

const SORTS: { id: Sort; label: string; metric: (p: RecapPerson) => number }[] = [
  { id: "received", label: "Más likes recibidos", metric: (p) => p.likesReceived },
  { id: "matches", label: "Más matches", metric: (p) => p.matches },
  { id: "sent", label: "Más likes dados", metric: (p) => p.likesSent },
  { id: "name", label: "Nombre", metric: () => 0 },
];

export default function RecapNetworkTab() {
  const { data, openPerson } = useRecap();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("received");

  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    const metric = SORTS.find((s) => s.id === sort)!.metric;
    return data.people
      .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.table ?? "").toLowerCase().includes(q))
      .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name, "es") : metric(b) - metric(a)));
  }, [data.people, query, sort]);

  return (
    <div className="flex flex-col gap-4 pt-4">
      <header className="px-1 pt-2">
        <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: "#B57BFF" }}>Quién le echó el ojo a quién</p>
        <h1 className="mt-1 font-display text-2xl font-bold">La red de la noche</h1>
      </header>

      <RecapCard title="Mapa de conexiones" icon={Network} accent="#B57BFF">
        <ConnectionGraph />
      </RecapCard>

      <RecapCard title="Todos los invitados" subtitle={`${data.people.length} participaron`} icon={Users} accent="#B8B8D0">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <label className="relative block flex-1">
            <span className="sr-only">Buscar invitado</span>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-3)" }} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o mesa"
              className="h-12 w-full rounded-2xl pl-11 pr-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
            />
          </label>
          <label className="sr-only" htmlFor="recap-people-sort">Ordenar invitados</label>
          <select
            id="recap-people-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-12 rounded-2xl px-3 text-sm font-semibold outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-primary)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {SORTS.map((s) => <option key={s.id} value={s.id} style={{ background: "#0F0F1A" }}>{s.label}</option>)}
          </select>
        </div>

        {people.length === 0 ? (
          <p className="py-6 text-center text-sm" style={{ color: "var(--fg-3)" }}>Nadie coincide con esa búsqueda.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {people.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => openPerson(p.id)}
                  className="flex min-h-[60px] w-full items-center gap-3 rounded-2xl px-2 py-2 text-left cursor-pointer transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
                >
                  <PersonAvatar person={p} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {p.name}
                      {p.team && <span className="ml-2 text-xs font-medium" style={{ color: p.team === "Team Novia" ? "#FF6B9D" : "#5B9BFF" }}>{p.team}</span>}
                    </span>
                    <span className="block text-xs" style={{ color: "var(--fg-3)" }}>
                      {p.likesReceived} recibidos · {p.likesSent} dados{p.superLikesReceived > 0 ? ` · ${p.superLikesReceived} super` : ""}
                      {p.table ? ` · Mesa ${p.table}` : ""}
                    </span>
                  </span>
                  {p.matches > 0 && (
                    <span className="rounded-full px-2.5 py-1 font-mono text-xs font-bold" style={{ background: "rgba(255,45,120,0.15)", color: "#FF6B9D" }}>
                      {p.matches} {p.matches === 1 ? "match" : "matches"}
                    </span>
                  )}
                  <ChevronRight size={16} style={{ color: "var(--fg-3)" }} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </RecapCard>
    </div>
  );
}
