"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Match = {
  id: string;
  matched_at: string;
  user_a: { full_name: string };
  user_b: { full_name: string };
  reg_a: { selfie_url: string; table_number: string | null } | null;
  reg_b: { selfie_url: string; table_number: string | null } | null;
};

export default function HostMatchesPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/matches/all`)
      .then((r) => r.json())
      .then((d) => { setMatches(d.matches ?? []); setTotal(d.total ?? 0); setLoading(false); });
  }, [eventId]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-8 w-40 rounded-xl mb-4 animate-pulse" style={{ background: "#16161F" }} />
        {[1,2,3,4].map((i) => (
          <div key={i} className="h-20 rounded-2xl mb-3 animate-pulse" style={{ background: "#16161F" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">Matches del Evento</h1>
      <p className="text-sm mb-5" style={{ color: "#A0A0B0" }}>
        <span style={{ color: "#FF3CAC", fontWeight: 700 }}>{total}</span> conexiones generadas 💑
      </p>

      {matches.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💫</div>
          <p style={{ color: "#A0A0B0" }}>Aún no hay matches en este evento</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match, idx) => (
            <div key={match.id} className="rounded-2xl p-3 flex items-center gap-3"
              style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Número */}
              <span className="text-sm font-black w-6 text-center flex-shrink-0"
                style={{ color: "#555" }}>
                {idx + 1}
              </span>

              {/* Foto A */}
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: "2px solid #FF3CAC" }}>
                {match.reg_a?.selfie_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={match.reg_a.selfie_url} alt={match.user_a.full_name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg"
                    style={{ background: "rgba(255,60,172,0.1)" }}>👤</div>
                )}
              </div>

              {/* Nombres */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">
                  {match.user_a.full_name}
                </p>
                <div className="flex items-center gap-1 my-0.5">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,60,172,0.3)" }} />
                  <span className="text-xs">💗</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,60,172,0.3)" }} />
                </div>
                <p className="font-semibold text-sm leading-tight truncate">
                  {match.user_b.full_name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                  {new Date(match.matched_at).toLocaleTimeString("es-MX", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                  {match.reg_a?.table_number && ` · Mesa ${match.reg_a.table_number}`}
                </p>
              </div>

              {/* Foto B */}
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: "2px solid #784BA0" }}>
                {match.reg_b?.selfie_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={match.reg_b.selfie_url} alt={match.user_b.full_name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg"
                    style={{ background: "rgba(120,75,160,0.1)" }}>👤</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
