"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";

type Match = {
  id: string;
  matched_at: string;
  other_user: { id: string; full_name: string; avatar_url: string | null };
  other_selfie: string | null;
  other_table: string | null;
  other_display_name: string | null;
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
      <div className="p-4 pt-6">
        <div className="h-7 w-36 rounded-lg mb-6 skeleton" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl mb-3 skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 pt-6">
      <h1 className="text-2xl font-black mb-0.5" style={{ color: "#F0F0FF" }}>Matches</h1>
      <p className="text-xs font-medium mb-5" style={{ color: "#44445A" }}>
        {matches.length === 0 ? "Aún no tienes matches" : `${matches.length} conexion${matches.length !== 1 ? "es" : ""}`}
      </p>

      {matches.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: "rgba(255,45,120,0.08)" }}>
            <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: "#F0F0FF" }}>Aún no hay matches</p>
          <p className="text-xs" style={{ color: "#44445A" }}>
            Cuando hagas match con alguien, aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {matches.map((match, i) => {
            const photo = match.other_selfie || match.other_user.avatar_url;
            const lastMsg = match.messages[0];
            const isUnread = lastMsg && !lastMsg.read_at && lastMsg.sender_id !== match.other_user.id;
            const displayed = match.other_display_name || match.other_user.full_name;
            const firstName = displayed.split(" ")[0];
            const timeAgo = lastMsg
              ? new Date(lastMsg.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
              : new Date(match.matched_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" });

            return (
              <motion.button
                key={match.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                onClick={() => router.push(`/event/${eventId}/matches/${match.id}`)}
                className="flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all active:scale-[0.98]"
                style={{
                  background: "#0F0F1A",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-14 h-14 rounded-full overflow-hidden"
                    style={{
                      border: "2px solid rgba(255,45,120,0.3)",
                      boxShadow: isUnread ? "0 0 12px rgba(255,45,120,0.2)" : "none",
                    }}
                  >
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={firstName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: "rgba(255,45,120,0.08)" }}>
                        <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Unread dot */}
                  {isUnread && (
                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
                      style={{ background: "#FF2D78", border: "2px solid #0F0F1A" }} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-sm truncate" style={{ color: "#F0F0FF" }}>{firstName}</p>
                    <span className="text-[10px] flex-shrink-0 ml-2 font-medium" style={{ color: "#44445A" }}>{timeAgo}</span>
                  </div>
                  {match.other_table && (
                    <p className="text-[10px] mb-0.5 font-medium" style={{ color: "#FFB800" }}>Mesa {match.other_table}</p>
                  )}
                  <p className="text-xs truncate" style={{ color: isUnread ? "#F0F0FF" : "#8585A8", fontWeight: isUnread ? 600 : 400 }}>
                    {lastMsg ? lastMsg.content : "¡Nuevo match! Di hola 👋"}
                  </p>
                </div>

                <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#44445A" strokeWidth={2}>
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" />
                </svg>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
