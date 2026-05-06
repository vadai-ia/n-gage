"use client";

/**
 * FAQ — Variant-aware.
 * Cada variante tiene su propio set de preguntas/respuestas; comparten el shell
 * (acordeón con anim suave). El primero abierto por default.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "./Reveal";
import { useVariant } from "./VariantProvider";

type QA = { q: string; a: string };

const SETS: Record<"general" | "weddings" | "events", { eyebrow: string; title: string; titleEm: string; items: QA[] }> = {
  general: {
    eyebrow: "Preguntas frecuentes",
    title: "Las preguntas que",
    titleEm: "probablemente",
    items: [
      { q: "¿Mis invitados tienen que descargar una app?", a: "No. N'GAGE corre en el navegador del teléfono — basta con escanear el QR del evento. Cero fricciones, cero descargas, cero permisos del sistema. Funciona en iOS y Android sin distinción." },
      { q: "¿Qué pasa con la privacidad de los datos y las fotos?", a: "Todo es event-scoped: los perfiles existen solo dentro del evento y dejan de ser visibles cuando termina. Las fotos se guardan en un álbum colectivo accesible solo para los participantes. Cumplimos con la Ley Federal de Protección de Datos en México y, donde aplique, GDPR." },
      { q: "¿Puedo personalizar la app con la marca de mi evento?", a: "Sí, al 100%. Logo, paleta, tipografías, dominio propio, splash screen, copy del onboarding, emails transaccionales y QR con tu logo. Si tienes manual de marca, lo aplicamos." },
      { q: "¿Cuánto cuesta y qué incluye?", a: "Tenemos planes Spark, Vibe, Luxe (y Royal/Enterprise para eventos masivos). Cada plan incluye configuración, branding, soporte el día del evento y reportes post-evento. Visita /precios o cotiza directo." },
      { q: "¿Funciona sin internet en el lugar del evento?", a: "Necesita conexión, pero el consumo por invitado es mínimo (~1-3 MB durante toda la noche). Para zonas con mala señal, recomendamos Wi-Fi para invitados. En cruceros/hoteles aprovechamos la red interna del operador." },
      { q: "¿Cuánto tiempo necesitan para configurar mi evento?", a: "Para eventos estándar, 24 a 72 horas desde que recibimos tus assets. Para festivales o eventos masivos con integraciones especiales (CRM, ticketing, multi-zona), pedimos al menos 2 semanas." },
      { q: "¿Qué tan grande puede ser el evento?", a: "Diseñado para escalar de 50 a 50,000+ invitados simultáneos. La arquitectura es horizontal: agregamos capacidad por evento sin afectar la experiencia. Para eventos arriba de 10,000 personas pedimos confirmar fecha con anticipación." },
      { q: "¿Pueden integrarlo con mi CRM o herramienta de gestión?", a: "Sí. Tenemos webhooks (en tiempo real) y API REST para sincronizar leads, registros, matches y métricas con HubSpot, Salesforce, Cvent, Bizzabo, Notion o Airtable. Eventos firmados con HMAC para que tu equipo de IT esté tranquilo." },
      { q: "¿Qué pasa con los datos al terminar el evento?", a: "El álbum permanece para los invitados. Los perfiles individuales se cierran. El organizador recibe un reporte agregado y puede exportar datos de comportamiento (sin PII). Después del periodo de retención acordado, anonimizamos los registros." },
      { q: "¿Puedo verlo funcionando antes de comprar?", a: "Sí. Agendamos una demo en vivo donde te mostramos un evento real (anonimizado) corriendo, navegas la app brandeada para tu vertical, y te mostramos los reportes que recibirías. Llena el formulario y te respondemos en menos de 24 horas." },
    ],
  },
  weddings: {
    eyebrow: "Las dudas que ya nos hicieron otras parejas",
    title: "Lo que probablemente",
    titleEm: "te preguntas",
    items: [
      { q: "¿Mis invitados tienen que descargar algo?", a: "Cero descargas. Escanean el QR de la invitación y entran al instante desde su navegador. Tus tíos van a poder usarlo. Lo prometemos." },
      { q: "¿Esto no rompe la magia de la boda?", a: "Pasa al revés. Los primeros 30 minutos del cocktail son los más incómodos: gente que no se conoce, conversaciones forzadas. N'GAGE se enciende ahí: rompe el hielo digital para que las conversaciones reales fluyan en pista. Después se apaga solo." },
      { q: "¿Cuándo se activa? ¿Antes, durante o después?", a: "Donde tú quieras. Lo más común: dos semanas antes (save the date), día de la boda (matches en vivo), y dos semanas después (álbum colectivo). Pero podemos personalizar el calendario contigo." },
      { q: "¿Mis abuelos van a poder usarlo?", a: "Si pueden mandar WhatsApp, pueden usar N'GAGE. La interfaz es de 3 botones máximo. Letras grandes opcionales. Cero menús escondidos. Hemos visto a personas de 78 años hacer match con primos lejanos." },
      { q: "¿Quién puede ver a quién?", a: "Solo invitados de tu boda, exclusivamente entre ellos. Nadie de fuera entra. Cuando la boda termina, los perfiles se cierran. El álbum colectivo es lo único que permanece." },
      { q: "¿Se puede personalizar con el diseño de la invitación?", a: "Sí. Tipografía, paleta, monograma, fotos de la pareja, save the date integrado, RSVP. La app respira como respira tu boda. Te mandamos un mockup antes de imprimir invitaciones." },
      { q: "¿Cuánto cuesta?", a: "Spark $2,499 / Vibe $3,499 / Luxe $4,499 / Royal $5,000+ MXN. Depende del tamaño de la boda y el nivel de personalización. Cotización completa en menos de 24 horas." },
      { q: "¿Cuándo necesitan empezar a coordinar?", a: "Lo ideal son 4-6 semanas antes para integrar el QR a las invitaciones físicas. Si tu boda es en menos tiempo, podemos arrancar en 72 horas con QR digital + impreso aparte." },
      { q: "¿Y el wedding planner? ¿Necesita hacer algo?", a: "Lo amará. Le quitamos el problema de 'cómo hago que los invitados se conozcan' y le damos data del flow de la noche. Trabajamos en paralelo con tu planner — no compite con él." },
      { q: "¿Qué pasa con las fotos del álbum?", a: "Los invitados suben fotos durante la boda. Al día siguiente reciben un álbum colectivo curado. Tú decides quién puede ver qué. Las fotos no se usan para nada más, no se vende, no se entrenan modelos. Son tuyas." },
    ],
  },
  events: {
    eyebrow: "Lo que pregunta tu CFO",
    title: "Las dudas que",
    titleEm: "siempre nos hacen",
    items: [
      { q: "¿Cómo se diferencia de Bizzabo, Brella o Swapcard?", a: "Tres cosas: white-label real (tu marca, no la nuestra), matchmaking con IA (no solo por intereses declarados, sino por comportamiento), y onboarding sin descarga (3x el adoption rate vs apps nativas). Te mandamos benchmark detallado en la demo." },
      { q: "¿Qué métricas de ROI puedo presentarle a finanzas?", a: "Conexiones generadas (matches mutuos), conversaciones iniciadas, reuniones agendadas durante el evento, leads sponsor capturados, NPS post-evento por track. Reporte ejecutivo en PDF + dashboard interactivo. Integraciones con HubSpot, Salesforce, Cvent." },
      { q: "¿Tienen integraciones con nuestro stack?", a: "API REST + webhooks firmados con HMAC. HubSpot, Salesforce, Cvent, Bizzabo, Marketo, Notion, Airtable nativas. SCIM para SSO empresarial. Si usas un sistema custom, hay sandbox de pruebas y SLA de integración en 5 días hábiles." },
      { q: "¿Cumplen con privacidad para empresas reguladas?", a: "Sí. GDPR-ready, LFPDPPP-MX, infraestructura en AWS Frankfurt + AWS São Paulo (multi-región). DPA disponible. Datos del asistente nunca se comparten con terceros. Anonimización post-evento configurable. Auditorías SOC2 en proceso (Q3 2025)." },
      { q: "¿Cómo manejan eventos de 5,000+ personas?", a: "Arquitectura horizontal con auto-scaling. Hemos corrido eventos de 18,000 simultáneos sin degradación. Para eventos arriba de 10,000 hacemos load test 2 semanas antes. SLA del 99.9% durante ventanas de evento." },
      { q: "¿Qué tan branded queda?", a: "100% white-label: subdominio dedicado (tuevento.com), logo, paleta, tipografía, emails transaccionales con tu DNS, QR con tu logo embebido, idioma del evento, copy editable. Tus asistentes no ven 'powered by N'GAGE' a menos que tú lo decidas." },
      { q: "¿Cuánto tiempo de implementación?", a: "Standard: 5-7 días hábiles. Enterprise (con integraciones custom + DPA + onboarding del equipo): 2-3 semanas. Incluimos kick-off técnico, training del equipo del evento, y soporte day-of." },
      { q: "¿Cómo funciona el modelo de pricing?", a: "Eventos profesionales/corporativos requieren cotización (depende del tamaño, integraciones, SLA, white-label level). Para eventos recurrentes ofrecemos contratos anuales con descuento. Hablemos de tu caso." },
      { q: "¿Qué pasa con los datos después del evento?", a: "Configurable: retención de 30/60/90 días o eliminación al cierre. Reporte ejecutivo se entrega en PDF + acceso al dashboard durante 12 meses. Asistentes pueden exportar sus matches/contactos antes del cierre." },
      { q: "¿Tienen casos similares al nuestro?", a: "Sí. Tech summits de 2,400, congresos médicos de 1,800, off-sites corporativos de 320, hospitality de 7 noches con 1,200 huéspedes. En la demo te mostramos un caso anonimizado de tu vertical específica con métricas reales." },
    ],
  },
};

export function FAQ() {
  const { variant } = useVariant();
  const set = SETS[variant];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      data-screen-label={`06 FAQ · ${variant}`}
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute top-1/2 right-0 -z-10 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(var(--v-accent-rgb), 0.4), transparent 70%)",
        }}
      />

      <div className="max-w-4xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center mb-14">
          <p className="eyebrow-v mb-5">{set.eyebrow}</p>
          <h2
            className="font-display font-bold leading-tight"
            style={{
              fontSize: "clamp(1.85rem, 4.5vw, 3.5rem)",
              color: "var(--v-fg)",
              fontWeight: variant === "weddings" ? 500 : 700,
              letterSpacing: variant === "weddings" ? "-0.02em" : "-0.03em",
            }}
          >
            {set.title}{" "}
            <span className="gradient-text-v" style={{ fontStyle: "italic" }}>
              {set.titleEm}
            </span>{" "}
            tienes.
          </h2>
        </Reveal>

        <div className="space-y-3">
          {set.items.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <Reveal key={i} delay={Math.min(i * 0.04, 0.3)}>
                <div
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: isOpen ? "var(--v-card-strong)" : "var(--v-card)",
                    border: isOpen
                      ? "1px solid rgba(var(--v-accent-rgb), 0.28)"
                      : "1px solid var(--v-line)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="flex items-center justify-between w-full text-left p-5 lg:p-6 gap-4"
                    aria-expanded={isOpen}
                  >
                    <span
                      className="font-display font-semibold text-base lg:text-lg"
                      style={{ color: "var(--v-fg)" }}
                    >
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isOpen ? "var(--v-gradient)" : "var(--v-bg-2)",
                      }}
                    >
                      <Plus
                        size={16}
                        style={{ color: isOpen ? "#fff" : "var(--v-fg-2)" }}
                      />
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
                        <div
                          className="px-5 lg:px-6 pb-5 lg:pb-6 text-sm lg:text-base leading-relaxed"
                          style={{ color: "var(--v-fg-2)" }}
                        >
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
