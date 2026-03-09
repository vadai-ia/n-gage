"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WelcomePage() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0A0A0F" }}>
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,60,172,0.1) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(43,134,197,0.08) 0%, transparent 70%)" }} />

      <div className="text-center relative z-10 max-w-sm">
        <h1 className="text-4xl font-bold mb-2 gradient-text" style={{ fontFamily: "var(--font-playfair)" }}>
          N&apos;GAGE
        </h1>
        <p className="text-sm mb-10" style={{ color: "#A0A0B0" }}>Conecta en el momento</p>

        <div className="rounded-2xl p-6 mb-4"
          style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-4xl mb-3">🎉</div>
          <p className="font-semibold mb-2">Bienvenido a N&apos;GAGE</p>
          <p className="text-sm" style={{ color: "#A0A0B0", lineHeight: 1.6 }}>
            Para participar en un evento, escanea el código QR que te proporcionó el organizador
            o pide el enlace directo del evento.
          </p>
        </div>

        <button onClick={handleLogout}
          className="text-sm py-2 px-4 rounded-xl"
          style={{ color: "#A0A0B0", background: "rgba(255,255,255,0.04)" }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
