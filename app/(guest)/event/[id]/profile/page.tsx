"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type MyReg = {
  selfie_url: string;
  display_name: string | null;
  table_number: string | null;
  super_like_used: boolean;
  photos_taken: number;
  search_started_at: string | null;
};

export default function ProfilePage() {
  const { id: eventId } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [reg, setReg] = useState<MyReg | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    fetch(`/api/v1/events/${eventId}/my-registration`)
      .then((r) => r.json())
      .then((d) => {
        if (d.registration) setReg(d.registration);
        setLoading(false);
      });
  }, [eventId]);

  async function handleLogout() {
    if (!confirm("Cerrar sesion?")) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070F" }}>
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const displayName = reg?.display_name || user?.user_metadata?.full_name || "Tu";

  return (
    <div className="min-h-screen p-4 pt-6" style={{ background: "#07070F" }}>
      <h1 className="text-2xl font-black mb-6" style={{ color: "#F0F0FF" }}>Mi Perfil</h1>

      {/* Selfie + nombre */}
      <div className="rounded-2xl p-5 mb-4 text-center"
        style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-3"
          style={{ border: "2px solid rgba(255,45,120,0.4)", boxShadow: "0 0 20px rgba(255,45,120,0.15)" }}>
          {reg?.selfie_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={reg.selfie_url} alt="Tu selfie" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-black"
              style={{ background: "rgba(255,45,120,0.1)", color: "#FF2D78" }}>
              {displayName[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <p className="font-bold text-lg" style={{ color: "#F0F0FF" }}>{displayName}</p>
        <p className="text-xs mt-1" style={{ color: "#8585A8" }}>{user?.email}</p>
        {reg?.table_number && (
          <p className="text-xs mt-2 inline-block px-3 py-1 rounded-full font-semibold"
            style={{ background: "rgba(255,184,0,0.12)", color: "#FFB800" }}>
            Mesa {reg.table_number}
          </p>
        )}
      </div>

      {/* Stats del evento */}
      {reg && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-3 text-center"
            style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="text-xl font-black" style={{ color: "#FFB800" }}>
              {reg.super_like_used ? "Usado" : "1"}
            </div>
            <div className="text-xs mt-1" style={{ color: "#8585A8" }}>
              Super like {reg.super_like_used ? "usado" : "disponible"}
            </div>
          </div>
          <div className="rounded-xl p-3 text-center"
            style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="text-xl font-black" style={{ color: "#7B2FBE" }}>
              {reg.photos_taken}/10
            </div>
            <div className="text-xs mt-1" style={{ color: "#8585A8" }}>Fotos tomadas</div>
          </div>
        </div>
      )}

      {/* Acciones rapidas */}
      <div className="flex flex-col gap-2 mb-4">
        <button onClick={() => router.push(`/event/${eventId}/album`)}
          className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4 flex items-center gap-3 transition-transform active:scale-[0.98]"
          style={{ background: "rgba(123,47,190,0.08)", border: "1px solid rgba(123,47,190,0.15)", color: "#F0F0FF" }}>
          Mi album del evento
        </button>
        <button onClick={() => router.push(`/event/${eventId}/matches`)}
          className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4 flex items-center gap-3 transition-transform active:scale-[0.98]"
          style={{ background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.15)", color: "#F0F0FF" }}>
          Mis matches
        </button>
        <button onClick={() => router.push(`/event/${eventId}/likes`)}
          className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4 flex items-center gap-3 transition-transform active:scale-[0.98]"
          style={{ background: "rgba(26,110,255,0.08)", border: "1px solid rgba(26,110,255,0.15)", color: "#F0F0FF" }}>
          Quien me dio like
        </button>
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98]"
        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>
        Cerrar sesion
      </button>
    </div>
  );
}
