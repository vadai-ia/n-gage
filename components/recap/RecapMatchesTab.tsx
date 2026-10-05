"use client";

import { useMemo, useState } from "react";
import { HeartHandshake, MessageCircle, Search } from "lucide-react";
import { useRecap } from "@/lib/contexts/RecapContext";
import { formatTime } from "@/lib/recap/format";
import RecapCard from "./RecapCard";
import MatchPairAvatars from "./MatchPairAvatars";

type Filter = "all" | "super" | "chat" | "chemistry";
type Sort = "time" | "messages" | "affinity";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "super", label: "Con super like" },
  { id: "chat", label: "Con plática" },
  { id: "chemistry", label: "Gustos en común" },
];

const SORTS: { id: Sort; label: string }[] = [
  { id: "time", label: "Orden de la noche" },
  { id: "messages", label: "Más mensajes" },
  { id: "affinity", label: "Más afinidad" },
];

export default function RecapMatchesTab() {
  const { data, personById, openMatch } = useRecap();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("time");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.matches
      .filter((m) =>
        filter === "all" ? true
        : filter === "super" ? m.superLike
        : filter === "chat" ? m.messages > 0
        : m.sharedInterests.length > 0)
      .filter((m) => {
        if (!q) return true;
        const names = `${personById.get(m.a)?.name ?? ""} ${personById.get(m.b)?.name ?? ""}`.toLowerCase();
        return names.includes(q);
      })
      .sort((x, y) =>
        sort === "messages" ? y.messages - x.messages
        : sort === "affinity" ? y.affinity - x.affinity
        : Date.parse(x.at) - Date.parse(y.at));
  }, [data.matches, filter, sort, query, personById]);

  if (data.matches.length === 0) {
    return (
      <div className="pt-6">
        <RecapCard>
          <div className="py-10 text-center">
            <HeartHandshake size={40} className="mx-auto mb-3" style={{ color: "var(--fg-3)" }} aria-hidden />
            <p className="font-display text-lg font-bold">Todavía no hay matches</p>
            <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>Cuando dos invitados se den like mutuamente, aparecerán aquí.</p>
          </div>
        </RecapCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <header className="px-1 pt-2">
        <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: "#FF6B9D" }}>Se gustaron</p>
        <h1 className="mt-1 font-display text-2xl font-bold">{data.matches.length} {data.matches.length === 1 ? "match" : "matches"}</h1>
      </header>

      <div className="flex flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">Buscar por nombre</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-3)" }} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre"
            className="h-12 w-full rounded-2xl pl-11 pr-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
          />
        </label>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filtrar matches">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className="min-h-[40px] shrink-0 rounded-full px-4 text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
              style={{
                background: filter === f.id ? "#FF2D78" : "rgba(255,255,255,0.05)",
                color: filter === f.id ? "#fff" : "var(--fg-2)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 self-end text-sm" style={{ color: "var(--fg-3)" }}>
          Ordenar
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-10 rounded-xl px-3 text-sm font-semibold outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-primary)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {SORTS.map((s) => <option key={s.id} value={s.id} style={{ background: "#0F0F1A" }}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm" style={{ color: "var(--fg-3)" }}>Ningún match coincide con ese filtro.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {visible.map((m) => {
            const a = personById.get(m.a);
            const b = personById.get(m.b);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => openMatch(m.id)}
                  aria-label={`Match entre ${a?.name} y ${b?.name}`}
                  className="flex w-full flex-col items-center rounded-3xl px-3 pb-4 pt-5 text-center cursor-pointer transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
                  style={{
                    background: m.superLike ? "linear-gradient(160deg, rgba(255,184,0,0.12), rgba(15,15,26,0.7))" : "rgba(15,15,26,0.7)",
                    border: `1px solid ${m.superLike ? "rgba(255,184,0,0.3)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <MatchPairAvatars a={a} b={b} size={56} superLike={m.superLike} />
                  <p className="mt-3 w-full truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {a?.name} & {b?.name}
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-mono text-[11px]" style={{ color: "var(--fg-3)" }}>
                    {formatTime(m.at)}
                    {m.messages > 0 && (
                      <span className="flex items-center gap-0.5" style={{ color: "#5B9BFF" }}>
                        <MessageCircle size={11} aria-hidden />{m.messages}
                      </span>
                    )}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
