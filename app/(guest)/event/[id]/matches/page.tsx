"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { getRelationLabel } from "@/lib/utils/relationLabels";

type Match = {
  id: string;
  matched_at: string;
  other_user: { id: string; full_name: string; avatar_url: string | null };
  other_selfie: string | null;
  other_table: string | null;
  other_display_name: string | null;
  other_relation_type?: string | null;
  messages: { content: string; created_at: string; sender_id: string; read_at: string | null }[];
};

export default function MatchesPage() {
  const { id: eventId } = useParams<{ id: string }>();
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
      <h1 className="text-2xl font-black mb-0.5" style={{ color: "#F0F0FF" }}>Tus Matches</h1>
      <p className="text-xs font-medium mb-2" style={{ color: "#8585A8" }}>
        Empieza la mision de busqueda de tus posibles amores
      </p>
      <p className="text-xs mb-5" style={{ color: "#44445A" }}>
        {matches.length === 0 ? "Aun no tienes matches" : `${matches.length} conexion${matches.length !== 1 ? "es" : ""}`}
      </p>

      {matches.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: "rgba(255,45,120,0.08)" }}>
            <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: "#F0F0FF" }}>Aun no hay matches</p>
          <p className="text-xs" style={{ color: "#44445A" }}>
            Sigue haciendo swipe para encontrar tus matches
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {matches.map((match, i) => {
            const photo = match.other_selfie || match.other_user.avatar_url;
            const displayed = match.other_display_name || match.other_user.full_name;
            const firstName = displayed.split(" ")[0];
            const teamLabel = getRelationLabel(match.other_relation_type);

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-2xl overflow-hidden relative"
                style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {/* Photo */}
                <div className="aspect-[3/4] relative">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: "rgba(255,45,120,0.06)" }}>
                      <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{
                    background: "linear-gradient(to top, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.3) 50%, transparent 100%)"
                  }} />

                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-black text-sm truncate" style={{ color: "#F0F0FF" }}>{firstName}</p>
                    {match.other_table && (
                      <p className="text-[10px] font-bold mt-0.5" style={{ color: "#FFB800" }}>
                        Mesa {match.other_table}
                      </p>
                    )}
                    {teamLabel && (
                      <p className="text-[10px] font-medium mt-0.5" style={{ color: "#8585A8" }}>
                        {teamLabel}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
