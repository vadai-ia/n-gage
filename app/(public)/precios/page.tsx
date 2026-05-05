import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { getLandingUserContext } from "@/lib/landing/get-user-context";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Planes y precios · N'GAGE",
  description:
    "Modelos de inversión para cada tamaño de evento — desde bodas íntimas hasta festivales masivos. N'GAGE adapta su propuesta a tu realidad.",
};

const TRACKS = [
  {
    name: "Eventos sociales",
    range: "50 a 500 invitados",
    desc: "Bodas, XV años, graduaciones, eventos privados. Setup llave en mano, branding del evento, álbum colectivo y reportes.",
    accent: "#FF2D78",
    plans: ["Spark", "Vibe", "Luxe", "Elite", "Exclusive"],
  },
  {
    name: "Eventos corporativos",
    range: "100 a 5,000 colaboradores",
    desc: "Off-sites, kick-offs, congresos. Branding corporativo, métricas para HR, integraciones con CRM/HRIS, multi-zona.",
    accent: "#1A6EFF",
    plans: ["Pro", "Enterprise"],
  },
  {
    name: "Festivales y masivos",
    range: "5,000 a 50,000+",
    desc: "Festivales, conciertos, ferias. Multi-escenario, multi-marca, activaciones de patrocinador, data first-party.",
    accent: "#7B2FBE",
    plans: ["Festival", "Festival Plus"],
  },
  {
    name: "Hotelería, cruceros y deporte",
    range: "Multi-día / multi-zona",
    desc: "Resorts, cruceros, hoteles boutique, ligas amateur, retos fitness. Re-engagement nocturno, comunidad post-evento.",
    accent: "#FFB800",
    plans: ["Stay", "Series"],
  },
];

export default async function PreciosPage() {
  const user = await getLandingUserContext();

  return (
    <>
      <Navbar user={user} />
      <main className="relative pt-32 lg:pt-40 pb-24">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[600px] opacity-50 blur-3xl"
          style={{ background: "radial-gradient(ellipse at top, rgba(255,184,0,0.18), transparent 60%)" }}
        />

        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-mono mb-8"
            style={{ color: "#8585A8" }}
          >
            <ArrowLeft size={14} /> Volver al inicio
          </Link>

          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#FFB800" }}>
            Planes & inversión
          </p>
          <h1
            className="font-display font-bold leading-tight mb-6"
            style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", color: "#F0F0FF" }}
          >
            Pronto, los <span className="gradient-text italic">números</span> exactos.
          </h1>
          <p className="text-base lg:text-xl mb-3 max-w-2xl" style={{ color: "#8585A8" }}>
            Estamos cerrando el modelo de negocio para hacerlo simple y honesto. Mientras tanto, te compartimos los <strong style={{ color: "#F0F0FF" }}>tracks</strong> que cubrimos hoy y cotizamos cada propuesta a la medida del evento.
          </p>
          <p className="font-display italic text-base mb-12" style={{ color: "#F0F0FF" }}>
            <span className="gradient-text font-bold">Lo que pase después, ya es entre ustedes.</span>
          </p>

          {/* Aviso */}
          <div
            className="mb-12 p-6 rounded-3xl flex items-start gap-4"
            style={{
              background: "linear-gradient(135deg, rgba(255,184,0,0.06), rgba(255,45,120,0.04))",
              border: "1px solid rgba(255,184,0,0.18)",
            }}
          >
            <span className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(7,7,15,0.6)", border: "1px solid rgba(255,184,0,0.3)" }}>
              <Sparkles size={18} style={{ color: "#FFB800" }} />
            </span>
            <div>
              <p className="text-sm leading-relaxed" style={{ color: "#F0F0FF" }}>
                Trabajamos por proyecto. Cada propuesta incluye configuración del evento, branding personalizado, soporte el día del evento, álbum colectivo y reportes post-evento. Algunos tracks suman: integraciones con CRM, multi-zona, activaciones de patrocinador, dominio propio.
              </p>
            </div>
          </div>

          {/* Tracks */}
          <div className="grid md:grid-cols-2 gap-4 mb-14">
            {TRACKS.map((t) => (
              <div
                key={t.name}
                className="p-7 rounded-3xl group transition-all"
                style={{
                  background: "rgba(15,15,26,0.6)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-[11px] font-mono font-bold tracking-widest uppercase mb-2" style={{ color: t.accent }}>
                  {t.range}
                </p>
                <h3 className="font-display font-bold text-2xl mb-3" style={{ color: "#F0F0FF" }}>{t.name}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#8585A8" }}>{t.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.plans.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: `${t.accent}15`, color: t.accent, border: `1px solid ${t.accent}30` }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className="p-8 lg:p-10 rounded-3xl text-center"
            style={{
              background: "linear-gradient(135deg, rgba(255,45,120,0.1), rgba(123,47,190,0.08), rgba(26,110,255,0.1))",
              border: "1px solid rgba(255,45,120,0.2)",
            }}
          >
            <h2 className="font-display font-bold text-2xl lg:text-3xl mb-3" style={{ color: "#F0F0FF" }}>
              Cuéntanos el evento, te armamos la propuesta.
            </h2>
            <p className="text-base mb-6 max-w-xl mx-auto" style={{ color: "#8585A8" }}>
              Llenas el formulario, en menos de 24 horas tienes una cotización a medida y, si quieres, una demo en vivo.
            </p>
            <Link
              href="/#contacto"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-base"
              style={{
                background: "linear-gradient(135deg, #FF2D78 0%, #7B2FBE 50%, #1A6EFF 100%)",
                color: "#fff",
                boxShadow: "0 0 30px rgba(255,45,120,0.4)",
              }}
            >
              Solicitar cotización <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
