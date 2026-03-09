"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type LikeEntry = {
  id: string;
  type: string;
  created_at: string;
  from_user_id: string;
  from_user: { full_name: string; avatar_url: string | null };
  event: {
    registrations: {
      selfie_url: string;
      table_number: string | null;
      relation_type: string | null;
      user_id: string;
    }[];
  };
};

const RELATION_LABELS: Record<string, string> = {
  friend_bride: "Amigo/a de la novia", friend_groom: "Amigo/a del novio",
  family_bride: "Familia de la novia", family_groom: "Familia del novio",
  coworker: "Compañero/a de trabajo", other: "Invitado/a",
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
      <div className="p-4">
        <div className="h-7 w-36 rounded-xl mb-4 animate-pulse" style={{ background: "#16161F" }} />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background: "#16161F" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">Likes recibidos</h1>
      <p className="text-sm mb-5" style={{ color: "#A0A0B0" }}>
        {likes.length === 0 ? "Aún no tienes likes" : `${likes.length} persona${likes.length !== 1 ? "s" : ""} te dieron like`}
      </p>

      {likes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💔</div>
          <p style={{ color: "#A0A0B0" }}>Sigue haciendo swipe para recibir likes</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {likes.map((like) => {
            const reg = like.event.registrations.find((r) => r.user_id === like.from_user_id);
            const photo = reg?.selfie_url || like.from_user.avatar_url;
            const isSuperLike = like.type === "super_like";

            return (
              <div key={like.id} className="rounded-2xl overflow-hidden relative"
                style={{ background: "#16161F", border: `1px solid ${isSuperLike ? "#F59E0B44" : "rgba(255,255,255,0.07)"}` }}>
                {/* Foto */}
                <div className="relative h-44">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={like.from_user.full_name}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl"
                      style={{ background: "rgba(255,60,172,0.1)" }}>👤</div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
                  {isSuperLike && (
                    <div className="absolute top-2 right-2 text-lg">⭐</div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="font-bold text-sm leading-tight truncate">{like.from_user.full_name}</p>
                    {reg?.relation_type && (
                      <p className="text-xs truncate" style={{ color: "#A0A0B0" }}>
                        {RELATION_LABELS[reg.relation_type] ?? "Invitado/a"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botón match */}
                <button
                  onClick={() => handleMatch(like.from_user_id)}
                  disabled={matching === like.from_user_id}
                  className="w-full py-2.5 text-sm font-bold transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff" }}>
                  {matching === like.from_user_id ? "..." : "💑 Hacer match"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
