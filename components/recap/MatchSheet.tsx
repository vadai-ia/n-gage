"use client";

import { Clock, MessageCircle, Sparkles, Star, Timer, UserRound } from "lucide-react";
import { useRecap } from "@/lib/contexts/RecapContext";
import { formatTime } from "@/lib/recap/format";
import BottomSheet from "./BottomSheet";
import MatchPairAvatars from "./MatchPairAvatars";

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))} seg`;
  const min = Math.round(seconds / 60);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`;
}

export default function MatchSheet({ matchId, onClose }: { matchId: string | null; onClose: () => void }) {
  const { matchById, personById, openPerson } = useRecap();
  const match = matchId ? matchById.get(matchId) : undefined;
  const a = match ? personById.get(match.a) : undefined;
  const b = match ? personById.get(match.b) : undefined;
  const firstMover = match?.firstMove ? personById.get(match.firstMove) : undefined;

  return (
    <BottomSheet open={!!match} onClose={onClose} title="Match">
      {match && (
        <div className="pb-2">
          <div className="flex flex-col items-center py-4 text-center">
            <MatchPairAvatars a={a} b={b} size={92} superLike={match.superLike} />
            <p className="mt-4 font-display text-2xl font-bold">{a?.name} & {b?.name}</p>
            {match.superLike && (
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold" style={{ color: "#FFB800" }}>
                <Star size={14} fill="#FFB800" aria-hidden /> Hubo super like de por medio
              </p>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-2">
            <Fact icon={Clock} label="Hicieron match" value={`a las ${formatTime(match.at)}`} />
            <Fact icon={MessageCircle} label="Se escribieron" value={match.messages > 0 ? `${match.messages} mensajes` : "Aún nada"} />
            {firstMover && <Fact icon={UserRound} label="Dio el primer paso" value={firstMover.name} />}
            {match.secondsToMatch !== null && <Fact icon={Timer} label="Tardaron en corresponder" value={formatSeconds(match.secondsToMatch)} />}
          </dl>

          {match.sharedInterests.length > 0 && (
            <div className="mt-4 rounded-2xl p-4" style={{ background: "rgba(123,47,190,0.12)" }}>
              <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#E3CCFF" }}>
                <Sparkles size={16} aria-hidden /> {match.affinity}% de afinidad
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {match.sharedInterests.map((i) => (
                  <li key={i} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}>{i}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 text-xs" style={{ color: "var(--fg-3)" }}>
            Los mensajes son privados: solo mostramos cuántos fueron, nunca lo que se dijeron.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[a, b].map((p) => p && (
              <button
                key={p.id}
                type="button"
                onClick={() => openPerson(p.id)}
                className="min-h-[48px] rounded-2xl text-sm font-semibold cursor-pointer transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
                style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-primary)" }}
              >
                Ver a {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
      <dt className="flex items-center gap-1.5 text-xs" style={{ color: "var(--fg-3)" }}>
        <Icon size={13} aria-hidden /> {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</dd>
    </div>
  );
}
