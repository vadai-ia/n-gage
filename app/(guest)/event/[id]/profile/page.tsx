"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { id: eventId } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

      <div className="rounded-2xl p-4 mb-4"
        style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ background: "rgba(255,60,172,0.15)", border: "2px solid #FF3CAC" }}>
            👤
          </div>
          <div>
            <p className="font-bold">{user?.user_metadata?.full_name || "Usuario"}</p>
            <p className="text-sm" style={{ color: "#A0A0B0" }}>{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={() => router.push(`/event/${eventId}/album`)}
            className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4 flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#ccc" }}>
            <span>📸</span> Mi álbum del evento
          </button>
          <button onClick={() => router.push(`/event/${eventId}/matches`)}
            className="w-full py-3 rounded-xl text-sm font-semibold text-left px-4 flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#ccc" }}>
            <span>💑</span> Mis matches
          </button>
        </div>
      </div>

      <button onClick={handleLogout}
        className="w-full py-3 rounded-xl text-sm font-semibold"
        style={{ background: "rgba(255,60,172,0.08)", border: "1px solid rgba(255,60,172,0.2)", color: "#FF3CAC" }}>
        Cerrar sesión
      </button>
    </div>
  );
}
