"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";

type LikeEntry = {
  id: string;
  type: string;
  created_at: string;
  from_user_id: string;
  from_user: { full_name: string; avatar_url: string | null };
  event: {
    registrations: {
      selfie_url: string;
      display_name?: string | null;
      table_number: string | null;
      relation_type: string | null;
      user_id: string;
    }[];
  };
};

const RELATION_LABELS: Record<string, string> = {
  friend_bride: "Amigo/a de la novia", friend_groom: "Amigo/a del novio",
  family_bride: "Familia de la novia", family_groom: "Familia del novio",
  coworker: "Compañero/a", other: "Invitado/a",
};

export default function LikesPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const router = useRouter();
  const [likes, setLikes] = useState<LikeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/likes?direction=received`)
      .then((r) => r.json())
      .then((d) => { setLikes(d.likes ?? []); setLoading(false); });
  }, [eventId]);

  async function handleMatch(fromUserId: string) {
    setMatching(fromUserId);
    if (navigator.vibrate) navigator.vibrate(20);
    const res = await fetch(`/api/v1/events/${eventId}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ with_user_id: fromUserId }),
    });
    if (res.ok) {
      router.push(`/event/${eventId}/matches`);
    }
    setMatching(null);
  }

  if (loading) {
    return (
      <div className="p-4 pt-6">
        <div className="h-7 w-40 rounded-lg mb-6 skeleton" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6">
      <h1 className="text-2xl font-black mb-0.5" style={{ color: "#F0F0FF" }}>Likes</h1>
      <p className="text-xs font-medium mb-5" style={{ color: "#44445A" }}>
        {likes.length === 0 ? "Aún no tienes likes" : `${likes.length} persona${likes.length !== 1 ? "s" : ""} te ${likes.length !== 1 ? "dieron" : "dio"} like`}
      </p>

      {likes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: "rgba(255,45,120,0.08)" }}>
            <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: "#F0F0FF" }}>Sin likes todavía</p>
          <p className="text-xs" style={{ color: "#44445A" }}>
            Sigue haciendo swipe para recibir likes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {likes.map((like, i) => {
            const reg = like.event.registrations.find((r) => r.user_id === like.from_user_id);
            const photo = reg?.selfie_url || like.from_user.avatar_url;
            const isSuperLike = like.type === "super_like";
            const displayName = reg?.display_name || like.from_user.full_name;
            const firstName = displayName.split(" ")[0];

            return (
              <motion.div
                key={like.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="rounded-2xl overflow-hidden relative"
                style={{
                  background: "#0F0F1A",
                  border: isSuperLike
                    ? "1px solid rgba(255,184,0,0.2)"
                    : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {/* Photo */}
                <div className="relative aspect-[3/4]">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={firstName}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: "rgba(255,45,120,0.05)" }}>
                      <svg width={40} height={40} fill="none" viewBox="0 0 24 24" stroke="#44445A" strokeWidth={1}>
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(7,7,15,0.9) 0%, rgba(7,7,15,0.2) 50%, transparent 100%)" }} />

                  {/* Super like badge */}
                  {isSuperLike && (
                    <div className="absolute top-2 right-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,184,0,0.2)", border: "1px solid rgba(255,184,0,0.3)" }}>
                        <svg width={14} height={14} fill="#FFB800" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-bold text-sm truncate" style={{ color: "#F0F0FF" }}>{firstName}</p>
                    {reg?.relation_type && (
                      <p className="text-[10px] truncate font-medium" style={{ color: "#8585A8" }}>
                        {RELATION_LABELS[reg.relation_type] ?? "Invitado/a"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Match button */}
                <button
                  onClick={() => handleMatch(like.from_user_id)}
                  disabled={matching === like.from_user_id}
                  className="w-full py-3 text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-1.5"
                  style={{
                    background: isSuperLike
                      ? "linear-gradient(135deg, #FFB800, #FF8C00)"
                      : "linear-gradient(135deg, #FF2D78, #7B2FBE)",
                    color: "#fff",
                  }}
                >
                  {matching === like.from_user_id ? (
                    <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#fff", borderTopColor: "transparent" }} />
                  ) : (
                    <>
                      <svg width={14} height={14} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                      Match
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
