"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, ArrowRight, Heart, GraduationCap, Music, Sparkles, Trophy, Briefcase, Ship, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";
import Link from "next/link";

type UseCase = {
  id: string;
  category: string;
  title: string;
  pitch: string;
  detail: string;
  tag: string;
  icon: LucideIcon;
  gradient: string;
  accent: string;
};

const CASES: UseCase[] = [
  {
    id: "bodas",
    category: "Bodas y XV años",
    title: "Que tu boda no termine con el pastel.",
    pitch: "Tus invitados solteros se conocen, se conectan, y se llevan un álbum del día más importante. Comienzan historias que nadie planeó.",
    detail: "El protocolo dice una cosa, la noche dice otra. N'GAGE convierte la mesa de solteros en territorio de exploración: matches en vivo, fotos compartidas, y un álbum colectivo que les llega días después. Tus novios viven el evento sabiendo que algo está pasando entre los suyos. El planner se diferencia con un servicio que ningún otro ofrece.",
    tag: "El éxito social del evento, garantizado",
    icon: Heart,
    gradient: "linear-gradient(135deg, rgba(255,45,120,0.4), rgba(123,47,190,0.2))",
    accent: "#FF2D78",
  },
  {
    id: "graduaciones",
    category: "Graduaciones",
    title: "La generación que nunca se olvida.",
    pitch: "Prom, fin de carrera, semana cultural. Los estudiantes conectan más allá de su grupo de siempre. Memoria generacional con marca institucional.",
    detail: "Una generación entera reunida una sola vez, con la misma adrenalina de cierre de etapa. N'GAGE captura ese momento con identidad de la institución: colores, escudo, hashtags. El álbum colectivo se convierte en patrimonio digital de la promoción. RH/alumni aprovecha el dato para programas de comunidad post-egreso.",
    tag: "Branding institucional · Memoria generacional",
    icon: GraduationCap,
    gradient: "linear-gradient(135deg, rgba(26,110,255,0.4), rgba(255,45,120,0.2))",
    accent: "#1A6EFF",
  },
  {
    id: "festivales",
    category: "Festivales y conciertos",
    title: "Miles de personas, mismas frecuencias.",
    pitch: "El mismo gusto musical, el mismo lugar, la misma noche. N'GAGE convierte el caos en miles de microhistorias. Brandeable con line-up, escenarios y patrocinadores.",
    detail: "Tres días de festival son un universo paralelo. N'GAGE crea zonas (escenario A, food court, camping) y match contextual entre ellas. Los patrocinadores activan en pantalla con call-outs reales: 'Cervezas X te invita un super like esta noche'. Datos first-party de comportamiento por hora, por escenario, por género musical.",
    tag: "Hasta 50,000+ invitados · Zonas múltiples · Multimarca",
    icon: Music,
    gradient: "linear-gradient(135deg, rgba(123,47,190,0.4), rgba(26,110,255,0.2))",
    accent: "#7B2FBE",
  },
  {
    id: "privados",
    category: "Eventos privados",
    title: "Cuando la lista es chica, la noche es enorme.",
    pitch: "Cumpleaños grandes, after-parties, lanzamientos íntimos. Para esa fiesta donde todos se conocen a medias y nadie quiere romper el hielo primero.",
    detail: "Eventos donde el host curó a los invitados pero todos vienen de mundos distintos. N'GAGE elimina la incomodidad de los primeros 30 minutos: cada quién explora la red de invitados, identifica a las personas que le interesan, y conecta sin la performance del 'hola, soy amigo de…'. Privacidad absoluta: solo los invitados al evento se ven entre sí.",
    tag: "Lista cerrada · Privacidad total",
    icon: Sparkles,
    gradient: "linear-gradient(135deg, rgba(255,184,0,0.4), rgba(255,45,120,0.2))",
    accent: "#FFB800",
  },
  {
    id: "deportivos",
    category: "Eventos deportivos",
    title: "Comunidad antes, durante y después de la prueba.",
    pitch: "Carreras, retos fitness, ligas amateur. Los participantes conectan, comparten energía, y construyen comunidad. Match por categoría, equipo o ciudad.",
    detail: "El reto físico genera adrenalina compartida que las apps tradicionales no capitalizan. N'GAGE arranca antes (warm-up social entre inscritos), explota durante (matches en estaciones, después de cruzar meta), y se queda después (comunidad permanente para la siguiente temporada). Re-engagement entre eventos vía email del organizador.",
    tag: "Comunidad post-evento · Engagement entre temporadas",
    icon: Trophy,
    gradient: "linear-gradient(135deg, rgba(255,45,120,0.4), rgba(255,184,0,0.2))",
    accent: "#FF2D78",
  },
  {
    id: "corporativos",
    category: "Eventos corporativos",
    title: "Networking que de verdad ocurre.",
    pitch: "Onboardings, kick-offs, congresos, off-sites. Rompe el hielo entre áreas, sucursales, países. Métricas reales de conexión interna para RH.",
    detail: "El cocktail de networking corporativo es notorio: tres ejecutivos talkando entre sí, todos los demás en sus celulares. N'GAGE da estructura sin perder casualidad: ice-breakers contextuales, match por área/intereses, mensajes asíncronos para retomar al día siguiente. RH recibe reportes: cuántas conexiones cross-team se generaron, qué nodos quedaron aislados, qué áreas se conectaron más.",
    tag: "Networking medible · Reportes para HR · Multidominio",
    icon: Briefcase,
    gradient: "linear-gradient(135deg, rgba(26,110,255,0.4), rgba(123,47,190,0.2))",
    accent: "#1A6EFF",
  },
  {
    id: "cruceros",
    category: "Cruceros, hoteles y resorts",
    title: "Multi-día, multi-zona, multi-noche.",
    pitch: "Una semana embarcado, un resort all-inclusive, un hotel boutique. Aumenta el NPS y el tiempo de estancia social. Re-engagement nocturno garantizado.",
    detail: "El huésped solo o en pareja libre llega con expectativa social que el operador rara vez resuelve. N'GAGE crea capas: zona piscina de día, lounge de noche, excursiones del miércoles. La estancia se convierte en un mini-festival íntimo que dura 7 noches. F&B y entretenimiento brandean activaciones in-app. NPS post-estancia sube por la dimensión social que ningún competidor ofrece.",
    tag: "Multi-día · Multi-zona · Re-engagement nocturno",
    icon: Ship,
    gradient: "linear-gradient(135deg, rgba(255,184,0,0.4), rgba(26,110,255,0.2))",
    accent: "#FFB800",
  },
  {
    id: "universidades",
    category: "Universidades",
    title: "Tu casa de estudios, también vive en pantalla.",
    pitch: "Bienvenida de generación, semana cultural, congresos académicos. La universidad se brandea como parte del recuerdo y de la cultura institucional.",
    detail: "Los estudiantes se gradúan habiendo conocido al 12% de su generación. N'GAGE abre la red durante eventos clave: bienvenida, ferias, congresos. La universidad mantiene control total del branding y los datos. Casos de uso secundarios: ferias de empleo (matching estudiante–reclutador), open houses (match prospectos–programa), reuniones de exalumnos.",
    tag: "Branding institucional · Comunidad académica",
    icon: Building2,
    gradient: "linear-gradient(135deg, rgba(123,47,190,0.4), rgba(255,184,0,0.2))",
    accent: "#7B2FBE",
  },
];

export function UseCases() {
  const [active, setActive] = useState<UseCase | null>(null);

  return (
    <section id="casos-de-uso" className="relative py-24 lg:py-32 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40"
        style={{ background: "radial-gradient(ellipse at top, rgba(123,47,190,0.15), transparent 60%)" }}
      />

      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#FF2D78" }}>
            Casos de uso
          </p>
          <h2 className="font-display font-bold leading-tight mb-5" style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.5rem)", color: "#F0F0FF" }}>
            Donde sea que la gente se encuentre,{" "}
            <span className="gradient-text italic">N&apos;GAGE pertenece</span>.
          </h2>
          <p className="text-base lg:text-lg" style={{ color: "#8585A8" }}>
            Una sola plataforma, infinitas configuraciones. Estos son algunos mundos donde N&apos;GAGE ya vive.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {CASES.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.id} delay={(i % 4) * 0.08}>
                <button
                  onClick={() => setActive(c)}
                  className="group relative w-full h-full text-left rounded-3xl overflow-hidden transition-all duration-300"
                  style={{
                    background: "rgba(15,15,26,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    minHeight: 280,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${c.accent}50`;
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-50 group-hover:opacity-90 transition-opacity duration-500"
                    style={{ background: c.gradient }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, transparent 0%, rgba(7,7,15,0.85) 100%)" }}
                  />

                  <div className="relative p-6 h-full flex flex-col justify-between min-h-[280px]">
                    <div>
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                        style={{ background: "rgba(7,7,15,0.6)", border: `1px solid ${c.accent}40`, backdropFilter: "blur(8px)" }}
                      >
                        <Icon size={20} style={{ color: c.accent }} strokeWidth={1.6} />
                      </div>
                      <p className="text-[10px] font-mono font-bold tracking-widest uppercase mb-2" style={{ color: c.accent }}>
                        {c.category}
                      </p>
                      <h3 className="font-display font-bold text-lg leading-tight" style={{ color: "#F0F0FF" }}>
                        {c.title}
                      </h3>
                    </div>

                    <div className="mt-4">
                      <span
                        className="inline-block text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full mb-3"
                        style={{ background: "rgba(7,7,15,0.6)", color: "#F0F0FF", border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        {c.tag}
                      </span>
                      <p className="text-xs flex items-center gap-1.5 font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: c.accent }}>
                        Ver caso completo <ArrowRight size={12} />
                      </p>
                    </div>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {active && <UseCaseModal useCase={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

function UseCaseModal({ useCase, onClose }: { useCase: UseCase; onClose: () => void }) {
  const Icon = useCase.icon;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-8"
      style={{ background: "rgba(7,7,15,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl"
        style={{
          background: "rgba(15,15,26,0.96)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${useCase.accent}30`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${useCase.accent}20`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(255,255,255,0.06)", color: "#F0F0FF" }}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div
          className="relative p-8 lg:p-10 pb-6"
          style={{ background: useCase.gradient, borderRadius: "24px 24px 0 0" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "rgba(7,7,15,0.6)", border: `1px solid ${useCase.accent}50` }}
          >
            <Icon size={26} style={{ color: useCase.accent }} strokeWidth={1.5} />
          </div>
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-3" style={{ color: useCase.accent }}>
            {useCase.category}
          </p>
          <h3 className="font-display font-bold text-2xl lg:text-3xl leading-tight" style={{ color: "#F0F0FF" }}>
            {useCase.title}
          </h3>
        </div>

        <div className="p-8 lg:p-10 pt-2 space-y-5">
          <p className="text-base lg:text-lg leading-relaxed" style={{ color: "#F0F0FF" }}>
            {useCase.pitch}
          </p>
          <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          <p className="text-sm lg:text-base leading-relaxed" style={{ color: "#8585A8" }}>
            {useCase.detail}
          </p>
          <span
            className="inline-block text-xs font-mono font-semibold px-3 py-1.5 rounded-full"
            style={{ background: `${useCase.accent}15`, color: useCase.accent, border: `1px solid ${useCase.accent}30` }}
          >
            {useCase.tag}
          </span>

          <Link
            href={`#contacto?case=${useCase.id}`}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-full font-bold text-base transition-all mt-2"
            style={{
              background: `linear-gradient(135deg, ${useCase.accent}, #7B2FBE)`,
              color: "#fff",
              boxShadow: `0 0 30px ${useCase.accent}40`,
            }}
          >
            Quiero esto para mi evento <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
