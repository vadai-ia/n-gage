"use client";

import { Atom, Camera, Heart, Magnet, MessageCircle, Sparkles, Star, Timer, Zap, type LucideIcon } from "lucide-react";
import type { RecapAward, RecapAwardIcon } from "@/lib/recap/types";
import { useRecap } from "@/lib/contexts/RecapContext";
import { formatTime } from "@/lib/recap/format";
import PersonAvatar from "./PersonAvatar";

const ICONS: Record<RecapAwardIcon, { icon: LucideIcon; color: string }> = {
  magnet: { icon: Magnet, color: "#FF2D78" },
  star: { icon: Star, color: "#FFB800" },
  zap: { icon: Zap, color: "#FFD166" },
  heart: { icon: Heart, color: "#FF6B9D" },
  message: { icon: MessageCircle, color: "#5B9BFF" },
  sparkles: { icon: Sparkles, color: "#E3CCFF" },
  atom: { icon: Atom, color: "#B57BFF" },
  camera: { icon: Camera, color: "#34D399" },
  timer: { icon: Timer, color: "#FF8A5B" },
};

export default function AwardCard({ award, compact = false }: { award: RecapAward; compact?: boolean }) {
  const { personById, openPerson, openMatch } = useRecap();
  const { icon: Icon, color } = ICONS[award.icon];
  const people = award.personIds.map((id) => personById.get(id)).filter((p): p is NonNullable<typeof p> => !!p);
  const isPair = !!award.matchId;
  const value = award.at ? `a las ${formatTime(award.at)}` : award.value;

  const handleOpen = () => {
    if (award.matchId) openMatch(award.matchId);
    else if (people.length === 1) openPerson(people[0].id);
  };
  const clickable = isPair || people.length === 1;

  const body = (
    <>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${color}22`, color }}>
          <Icon size={16} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{award.title}</p>
          {!compact && <p className="text-xs" style={{ color: "var(--fg-3)" }}>{award.description}</p>}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-3">
          {people.map((p) => <PersonAvatar key={p.id} person={p} size={compact ? 40 : 52} ring />)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {people.map((p) => p.name).join(isPair ? " & " : ", ")}
          </p>
          {value && <p className="font-mono text-xs" style={{ color }}>{value}</p>}
        </div>
      </div>
    </>
  );

  const className = "w-full rounded-2xl p-4 text-left";
  const style = { background: `linear-gradient(160deg, ${color}14, rgba(255,255,255,0.02))`, border: `1px solid ${color}2E` };

  // Empates entre 2-3 personas: cada una se abre desde la lista de nombres
  if (!clickable) {
    return (
      <div className={className} style={style}>
        {body}
        <div className="mt-3 flex flex-wrap gap-2">
          {people.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => openPerson(p.id)}
              className="min-h-[36px] rounded-full px-3 text-xs font-semibold cursor-pointer hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
              style={{ background: "rgba(255,255,255,0.06)", color: "var(--fg-2)" }}
            >
              Ver a {p.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={`${className} cursor-pointer transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]`}
      style={style}
    >
      {body}
    </button>
  );
}
