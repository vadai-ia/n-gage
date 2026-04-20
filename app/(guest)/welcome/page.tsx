"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PoweredBy from "@/components/event/PoweredBy";

type EventItem = {
  id: string;
  event_id: string;
  event: {
    id: string;
    name: string;
    event_date: string;
    venue_name: string | null;
    status: string;
  };
};

export default function WelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserName(user.user_metadata?.full_name || user.user_metadata?.name || "");

      // Load user's event registrations
      try {
        const res = await fetch("/api/v1/me/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.registrations || []);
        }
      } catch { /* ignore */ }

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
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

  return (
    <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: "#07070F" }}>
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#F0F0FF" }}>
              Hola{userName ? `, ${userName.split(" ")[0]}` : ""}
            </h1>
            <p className="text-sm" style={{ color: "#8585A8" }}>Bienvenido a N&apos;GAGE</p>
          </div>
          <button onClick={handleLogout} className="text-sm px-3 py-1.5 rounded-lg"
            style={{ color: "#8585A8", background: "rgba(255,255,255,0.05)" }}>
            Salir
          </button>
        </div>

        {/* No events */}
        {events.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: "rgba(255,45,120,0.1)" }}>
              <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#F0F0FF" }}>
              Aún no tienes eventos
            </h2>
            <p className="text-sm mb-2" style={{ color: "#8585A8" }}>
              Para participar en un evento, escanea el código QR que encontrarás en el lugar del evento.
            </p>
            <p className="text-xs" style={{ color: "#44445A" }}>
              El organizador del evento te proporcionará un código QR o un enlace de acceso.
            </p>
          </div>
        )}

        {/* Events list */}
        {events.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#8585A8" }}>
              Tus eventos
            </h2>
            <div className="flex flex-col gap-3">
              {events.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => router.push(`/event/${reg.event.id}/search`)}
                  className="rounded-xl p-4 text-left transition-all hover:brightness-110"
                  style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="font-semibold text-sm" style={{ color: "#F0F0FF" }}>{reg.event.name}</p>
                  <p className="text-xs mt-1" style={{ color: "#8585A8" }}>
                    {new Date(reg.event.event_date).toLocaleDateString("es-MX", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                    {reg.event.venue_name && ` · ${reg.event.venue_name}`}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full mt-2 inline-block capitalize"
                    style={{
                      background: reg.event.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                      color: reg.event.status === "active" ? "#10B981" : "#8585A8",
                    }}>
                    {reg.event.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        <PoweredBy variant="muted" />
      </div>
    </div>
  );
}
