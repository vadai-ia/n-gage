"use client";

import { ArrowRight, Star, Trophy } from "lucide-react";
import { useRecap } from "@/lib/contexts/RecapContext";
import { formatTime } from "@/lib/recap/format";
import RecapCard from "./RecapCard";
import AwardCard from "./AwardCard";
import PersonAvatar from "./PersonAvatar";

export default function RecapAwardsTab() {
  const { data, personById, openPerson } = useRecap();
  const superLikes = data.likes.filter((l) => l.type === "super_like");
  const matchedPairs = new Set(data.matches.flatMap((m) => [`${m.a}|${m.b}`, `${m.b}|${m.a}`]));

  return (
    <div className="flex flex-col gap-4 pt-4">
      <header className="px-1 pt-2">
        <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: "#FFB800" }}>And the award goes to…</p>
        <h1 className="mt-1 font-display text-2xl font-bold">Los premios de la noche</h1>
      </header>

      {data.awards.length === 0 ? (
        <RecapCard>
          <div className="py-8 text-center">
            <Trophy size={36} className="mx-auto mb-3" style={{ color: "var(--fg-3)" }} aria-hidden />
            <p className="font-display text-lg font-bold">Aún no hay ganadores</p>
            <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>Los premios aparecen en cuanto empiezan los likes y los matches.</p>
          </div>
        </RecapCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.awards.map((a) => <AwardCard key={a.id} award={a} />)}
        </div>
      )}

      {superLikes.length > 0 && (
        <RecapCard
          title="Los super likes de la noche"
          subtitle="Los likes más valientes: quién se la jugó por quién"
          icon={Star}
          accent="#FFB800"
        >
          <ul className="flex flex-col gap-2">
            {superLikes.map((l) => {
              const from = personById.get(l.from);
              const to = personById.get(l.to);
              if (!from || !to) return null;
              const matched = matchedPairs.has(`${l.from}|${l.to}`);
              return (
                <li key={`${l.from}-${l.to}`} className="flex items-center gap-2 rounded-2xl p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <PersonButton id={from.id} onOpen={openPerson}>
                    <PersonAvatar person={from} size={36} />
                    <span className="truncate">{from.name}</span>
                  </PersonButton>
                  <ArrowRight size={16} className="shrink-0" style={{ color: "#FFB800" }} aria-label="mandó super like a" />
                  <PersonButton id={to.id} onOpen={openPerson}>
                    <PersonAvatar person={to} size={36} />
                    <span className="truncate">{to.name}</span>
                  </PersonButton>
                  <span className="ml-auto shrink-0 text-right">
                    <span className="block font-mono text-[11px]" style={{ color: "var(--fg-3)" }}>{formatTime(l.at)}</span>
                    {matched && <span className="block text-[11px] font-bold" style={{ color: "#FF6B9D" }}>¡Match!</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </RecapCard>
      )}
    </div>
  );
}

function PersonButton({ id, onOpen, children }: { id: string; onOpen: (id: string) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(id)}
      className="flex min-h-[44px] min-w-0 items-center gap-2 rounded-xl pr-2 text-sm font-semibold cursor-pointer hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </button>
  );
}
