"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "./Reveal";

const QUESTIONS = [
  {
    q: "¿Mis invitados tienen que descargar una app?",
    a: "No. N'GAGE corre en el navegador del teléfono — basta con escanear el QR del evento. Cero fricciones, cero descargas, cero permisos del sistema. Funciona en iOS y Android sin distinción.",
  },
  {
    q: "¿Qué pasa con la privacidad de los datos y las fotos?",
    a: "Todo es event-scoped: los perfiles existen solo dentro del evento y dejan de ser visibles cuando termina. Las fotos se guardan en un álbum colectivo accesible solo para los participantes. Cumplimos con la Ley Federal de Protección de Datos Personales en México y, donde aplique, GDPR.",
  },
  {
    q: "¿Puedo personalizar la app con la marca de mi evento?",
    a: "Sí, al 100%. Logo, paleta, tipografías, dominio propio, splash screen, copy del onboarding, emails transaccionales y QR con tu logo. Si tienes manual de marca, lo aplicamos. Si no, te ayudamos a definir la identidad del evento.",
  },
  {
    q: "¿Cuánto cuesta y qué incluye?",
    a: "Tenemos planes por tamaño de evento (Spark, Vibe, Luxe, Elite, Exclusive y un track de Festivales/Masivos). Cada plan incluye configuración, branding básico, soporte el día del evento y reportes post-evento. Estamos finalizando los precios — visita la sección de planes o contáctanos para una cotización.",
  },
  {
    q: "¿Funciona sin internet en el lugar del evento?",
    a: "Necesita conexión, pero el consumo de datos por invitado es mínimo (~1-3 MB durante toda la noche). Para eventos en zonas con mala señal, recomendamos pre-disponer Wi-Fi para invitados. En cruceros/hoteles aprovechamos la red interna del operador.",
  },
  {
    q: "¿Cuánto tiempo necesitan para configurar mi evento?",
    a: "Para eventos estándar, 24 a 72 horas desde que recibimos tus assets de marca. Para festivales o eventos masivos con integraciones especiales (CRM, ticketing, multi-zona), pedimos al menos 2 semanas para hacer un kick-off técnico.",
  },
  {
    q: "¿Qué tan grande puede ser el evento? ¿Hay límite?",
    a: "Hemos diseñado N'GAGE para escalar de 50 a 50,000+ invitados simultáneos. La arquitectura es horizontal: agregamos capacidad por evento sin afectar la experiencia. Para eventos arriba de 10,000 personas pedimos confirmar fecha con anticipación.",
  },
  {
    q: "¿Pueden integrarlo con mi CRM o herramienta de gestión de eventos?",
    a: "Sí. Tenemos webhooks (en tiempo real) y API REST para sincronizar leads, registros, matches y métricas con HubSpot, Salesforce, Cvent, Bizzabo, Notion, Airtable o el sistema que uses. Disparamos eventos firmados con HMAC para que tu equipo de IT esté tranquilo.",
  },
  {
    q: "¿Qué pasa con los datos al terminar el evento?",
    a: "El álbum permanece para los invitados. Los perfiles individuales se cierran y dejan de ser visibles. El organizador recibe un reporte agregado y, si lo solicita, puede exportar datos de comportamiento (sin información personal identificable). Después del periodo de retención acordado, anonimizamos los registros.",
  },
  {
    q: "¿Funciona para eventos LGBT+ o no binarios?",
    a: "Por supuesto. Configuras el filtro inteligente de orientación y géneros disponibles según el contexto del evento. Soportamos identidades no binarias y orientaciones múltiples. Cero suposiciones binarias en el flujo del invitado.",
  },
  {
    q: "¿Puedo verlo funcionando antes de comprar?",
    a: "Sí. Agendamos una demo en vivo donde te mostramos un evento real (anonimizado) corriendo, te dejamos navegar la app brandeada para tu vertical, y te mostramos los reportes que recibirías. Llena el formulario de contacto y te respondemos en menos de 24 horas.",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div
        aria-hidden
        className="absolute top-1/2 right-0 -z-10 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,45,120,0.4), transparent 70%)" }}
      />

      <div className="max-w-4xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center mb-14">
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#1A6EFF" }}>
            Preguntas frecuentes
          </p>
          <h2 className="font-display font-bold leading-tight" style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.5rem)", color: "#F0F0FF" }}>
            Las preguntas que <span className="gradient-text italic">probablemente</span> tienes.
          </h2>
        </Reveal>

        <div className="space-y-3">
          {QUESTIONS.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <Reveal key={i} delay={Math.min(i * 0.04, 0.3)}>
                <div
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: isOpen ? "rgba(15,15,26,0.85)" : "rgba(15,15,26,0.5)",
                    border: isOpen ? "1px solid rgba(255,45,120,0.25)" : "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="flex items-center justify-between w-full text-left p-5 lg:p-6 gap-4"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display font-semibold text-base lg:text-lg" style={{ color: "#F0F0FF" }}>
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isOpen ? "linear-gradient(135deg, #FF2D78, #7B2FBE)" : "rgba(255,255,255,0.04)",
                      }}
                    >
                      <Plus size={16} style={{ color: isOpen ? "#fff" : "#8585A8" }} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="px-5 lg:px-6 pb-5 lg:pb-6 text-sm lg:text-base leading-relaxed" style={{ color: "#8585A8" }}>
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
