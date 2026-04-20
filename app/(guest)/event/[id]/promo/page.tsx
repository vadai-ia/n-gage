"use client";

import { useParams, useRouter } from "next/navigation";
import Logo from "@/components/brand/Logo";
import PoweredBy from "@/components/event/PoweredBy";

export default function PromoPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <div className="min-h-screen p-4 pt-6" style={{ background: "#07070F" }}>
      <div className="flex justify-center mb-6">
        <Logo size={28} />
      </div>

      {/* Quick links */}
      <div className="flex flex-col gap-2 mb-6 max-w-md mx-auto">
        <button onClick={() => router.push(`/event/${eventId}/profile`)}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-left px-4 flex items-center gap-3 transition-transform active:scale-[0.98]"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#F0F0FF" }}>
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#8585A8" strokeWidth={1.5}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          Mi perfil
        </button>
        <button onClick={() => router.push(`/event/${eventId}/album`)}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-left px-4 flex items-center gap-3 transition-transform active:scale-[0.98]"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#F0F0FF" }}>
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#8585A8" strokeWidth={1.5}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
          Galeria del evento
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6 max-w-md mx-auto">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#44445A" }}>Nuestros servicios</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>

      {/* Cross-sell cards */}
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        {/* VADAI - IA */}
        <a
          href="https://vadai.com.mx"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl p-5 transition-transform active:scale-[0.98]"
          style={{
            background: "#0F0F1A",
            border: "1px solid rgba(255,45,120,0.2)",
            boxShadow: "0 8px 32px rgba(255,45,120,0.1)",
          }}
        >
          <div className="flex items-start gap-4 mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)" }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.5">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-black mb-0.5" style={{ color: "#F0F0FF" }}>
                Buscas desarrollar una idea con IA?
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: "#8585A8" }}>
                Transformamos ideas en productos digitales con inteligencia artificial. Apps, plataformas y soluciones a medida.
              </p>
            </div>
          </div>
          <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center"
            style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>
            Contactanos
          </div>
        </a>

        {/* KIBAH - Bienes raices */}
        <a
          href="https://kibah.com.mx"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl p-5 transition-transform active:scale-[0.98]"
          style={{
            background: "#0F0F1A",
            border: "1px solid rgba(255,184,0,0.2)",
            boxShadow: "0 8px 32px rgba(255,184,0,0.1)",
          }}
        >
          <div className="flex items-start gap-4 mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #FFB800, #FF6B00)" }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.5">
                <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-black mb-0.5" style={{ color: "#F0F0FF" }}>
                Te interesa invertir en bienes raices?
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: "#8585A8" }}>
                Crece tu patrimonio con inversiones inmobiliarias inteligentes y acompanamiento profesional.
              </p>
            </div>
          </div>
          <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center"
            style={{ background: "linear-gradient(135deg, #FFB800, #FF6B00)", color: "#fff" }}>
            Contactanos
          </div>
        </a>
      </div>

      <PoweredBy />
    </div>
  );
}
