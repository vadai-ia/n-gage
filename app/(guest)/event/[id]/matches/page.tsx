"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Match = {
  id: string;
  matched_at: string;
  other_user: { id: string; full_name: string; avatar_url: string | null };
  other_selfie: string | null;
  other_table: string | null;
  messages: { content: string; created_at: string; sender_id: string; read_at: string | null }[];
};

export default function MatchesPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/matches`)
      .then((r) => r.json())
      .then((d) => { setMatches(d.matches ?? []); setLoading(false); });
  }, [eventId]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-7 w-32 rounded-xl mb-4 animate-pulse" style={{ background: "#16161F" }} />
        {[1,2,3].map((i) => (
          <div key={i} className="h-20 rounded-2xl mb-3 animate-pulse" style={{ background: "#16161F" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">Mis Matches</h1>
      <p className="text-sm mb-5" style={{ color: "#A0A0B0" }}>
        {matches.length === 0 ? "Aún no tienes matches" : `${matches.length} match${matches.length !== 1 ? "es" : ""}`}
      </p>

      {matches.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💫</div>
          <p className="font-semibold mb-2">Aún no hay matches</p>
          <p style={{ color: "#A0A0B0", fontSize: "14px" }}>
            Cuando hagas match con alguien, aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match) => {
            const photo = match.other_selfie || match.other_user.avatar_url;
            const lastMsg = match.messages[0];
            const timeAgo = lastMsg
              ? new Date(lastMsg.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
              : new Date(match.matched_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" });

            return (
              <button
                key={match.id}
                onClick={() => router.push(`/event/${eventId}/matches/${match.id}`)}
                className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 relative"
                  style={{ border: "2px solid #FF3CAC" }}>
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={match.other_user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl"
                      style={{ background: "rgba(255,60,172,0.1)" }}>👤</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold truncate">{match.other_user.full_name}</p>
                    <span className="text-xs flex-shrink-0 ml-2" style={{ color: "#555" }}>{timeAgo}</span>
                  </div>
                  {match.other_table && (
                    <p className="text-xs" style={{ color: "#555" }}>Mesa {match.other_table}</p>
                  )}
                  <p className="text-sm truncate mt-0.5" style={{ color: "#A0A0B0" }}>
                    {lastMsg ? lastMsg.content : "¡Nuevo match! Di hola 👋"}
                  </p>
                </div>

                <span style={{ color: "#A0A0B0" }}>›</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
