"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Mail, MessageCircle, Send, Check, AlertCircle, Sparkles, Clock } from "lucide-react";
import {
  leadFormSchema,
  LEAD_EVENT_TYPES,
  LEAD_EVENT_SIZES,
  LEAD_EVENT_TYPE_LABELS,
  LEAD_EVENT_SIZE_LABELS,
  type LeadFormInput,
} from "@/lib/validations/lead.schema";
import { Reveal } from "./Reveal";
import { captureUtmFromUrl, readStoredUtm } from "@/lib/landing/utm";

const REFERRAL_OPTIONS = [
  "Instagram", "TikTok", "Recomendación de un colega", "Búsqueda en Google",
  "LinkedIn", "Evento donde lo vi en vivo", "Otro",
];

export function ContactForm() {
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [utm, setUtm] = useState<Record<string, string>>({});

  const {
    register, handleSubmit, watch, formState: { errors }, reset,
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema) as unknown as Resolver<LeadFormInput>,
    defaultValues: { newsletter_opt_in: false, privacy_accepted: false as unknown as true },
  });

  const eventType = watch("event_type");
  const messageVal = watch("message") ?? "";

  useEffect(() => {
    const captured = captureUtmFromUrl();
    const stored = readStoredUtm();
    setUtm({ ...stored, ...captured });
  }, []);

  const onSubmit: SubmitHandler<LeadFormInput> = async (values) => {
    setSubmitState("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...utm }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Error al enviar");
      }
      setSubmitState("success");
      reset();
      // Confetti burst
      const fire = (origin: { x: number; y: number }) => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin,
          colors: ["#FF2D78", "#7B2FBE", "#1A6EFF", "#FFB800"],
          ticks: 200,
        });
      };
      fire({ x: 0.3, y: 0.6 });
      setTimeout(() => fire({ x: 0.7, y: 0.6 }), 200);
    } catch (err) {
      setSubmitState("error");
      setErrorMsg(err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo o escríbenos directo.");
    }
  };

  return (
    <section id="contacto" className="relative py-24 lg:py-32 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, rgba(255,45,120,0.18), transparent 60%)" }}
      />

      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#FF2D78" }}>
            Hablemos de tu evento
          </p>
          <h2 className="font-display font-bold leading-tight mb-5" style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)", color: "#F0F0FF" }}>
            Cuéntanos sobre <span className="gradient-text italic">tu evento</span>.
          </h2>
          <p className="text-base lg:text-lg" style={{ color: "#8585A8" }}>
            Te respondemos en menos de 24 horas con una propuesta personalizada y, si quieres, una demo en vivo.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Form */}
          <Reveal className="lg:col-span-7">
            <div
              className="rounded-3xl p-6 lg:p-8 relative overflow-hidden"
              style={{
                background: "rgba(15,15,26,0.7)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
              }}
            >
              <AnimatePresence mode="wait">
                {submitState === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="py-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.7 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #FF2D78, #7B2FBE, #1A6EFF)",
                        boxShadow: "0 0 60px rgba(255,45,120,0.5)",
                      }}
                    >
                      <Check size={36} className="text-white" strokeWidth={3} />
                    </motion.div>
                    <h3 className="font-display font-bold text-2xl lg:text-3xl mb-3" style={{ color: "#F0F0FF" }}>
                      ¡Listo! Recibimos tu información.
                    </h3>
                    <p className="text-base mb-2 max-w-md mx-auto" style={{ color: "#8585A8" }}>
                      Te contactamos en menos de 24 horas.
                    </p>
                    <p className="font-display italic text-sm mb-8" style={{ color: "#F0F0FF" }}>
                      <span className="gradient-text font-bold">Lo que pase después, ya es entre ustedes.</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitState("idle")}
                      className="text-sm underline"
                      style={{ color: "#8585A8" }}
                    >
                      Enviar otro mensaje
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Nombre completo" error={errors.full_name?.message} required>
                        <input
                          {...register("full_name")}
                          autoComplete="name"
                          placeholder="Camila Vega"
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Email" error={errors.email?.message} required>
                        <input
                          type="email"
                          autoComplete="email"
                          {...register("email")}
                          placeholder="camila@evento.com"
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Teléfono / WhatsApp" error={errors.phone?.message} required>
                        <input
                          type="tel"
                          autoComplete="tel"
                          {...register("phone")}
                          placeholder="+52 55 1234 5678"
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Empresa / Organización (opcional)">
                        <input
                          {...register("company")}
                          autoComplete="organization"
                          placeholder="Hacienda San Marcos"
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Tipo de evento" error={errors.event_type?.message} required>
                        <select {...register("event_type")} className={inputClass}>
                          <option value="">Selecciona…</option>
                          {LEAD_EVENT_TYPES.map((t) => (
                            <option key={t} value={t}>{LEAD_EVENT_TYPE_LABELS[t]}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Tamaño aproximado" error={errors.event_size?.message} required>
                        <select {...register("event_size")} className={inputClass}>
                          <option value="">Selecciona…</option>
                          {LEAD_EVENT_SIZES.map((s) => (
                            <option key={s} value={s}>{LEAD_EVENT_SIZE_LABELS[s]}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    {eventType === "other" && (
                      <Field label="Especifica el tipo de evento">
                        <input
                          {...register("event_type_other")}
                          placeholder="Describe brevemente"
                          className={inputClass}
                        />
                      </Field>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Fecha tentativa">
                        <input type="date" {...register("event_date")} className={inputClass} />
                      </Field>
                      <Field label="Ciudad / país">
                        <input
                          {...register("event_location")}
                          placeholder="CDMX, México"
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <Field label="Cuéntanos más (opcional)" hint={`${messageVal.length}/500`}>
                      <textarea
                        {...register("message")}
                        rows={4}
                        maxLength={500}
                        placeholder="Detalles del evento, qué buscas, qué te llamó la atención…"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="¿Cómo nos conociste? (opcional)">
                      <select {...register("referral_source")} className={inputClass}>
                        <option value="">Selecciona…</option>
                        {REFERRAL_OPTIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
                      </select>
                    </Field>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register("privacy_accepted")}
                          className="mt-1 w-4 h-4 rounded accent-[#FF2D78]"
                        />
                        <span className="text-sm" style={{ color: "#8585A8" }}>
                          Acepto el{" "}
                          <a href="/privacidad" target="_blank" rel="noopener" className="underline" style={{ color: "#F0F0FF" }}>
                            aviso de privacidad
                          </a>{" "}
                          y los{" "}
                          <a href="/terminos-condiciones" target="_blank" rel="noopener" className="underline" style={{ color: "#F0F0FF" }}>
                            términos
                          </a>.
                          {errors.privacy_accepted && (
                            <span className="block text-xs mt-1" style={{ color: "#ef4444" }}>
                              {errors.privacy_accepted.message}
                            </span>
                          )}
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" {...register("newsletter_opt_in")} className="mt-1 w-4 h-4 rounded accent-[#FF2D78]" />
                        <span className="text-sm" style={{ color: "#8585A8" }}>
                          Quiero recibir novedades de N&apos;GAGE (eventos, casos de uso, lanzamientos).
                        </span>
                      </label>
                    </div>

                    {submitState === "error" && (
                      <div
                        className="flex items-start gap-3 p-4 rounded-xl"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}
                      >
                        <AlertCircle size={18} style={{ color: "#ef4444", flexShrink: 0, marginTop: 2 }} />
                        <p className="text-sm" style={{ color: "#F0F0FF" }}>
                          {errorMsg ?? "Algo salió mal. Intenta de nuevo o escríbenos a hola@ngage.com.mx."}
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitState === "loading"}
                      className="group flex items-center justify-center gap-2 w-full py-4 rounded-full font-bold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, #FF2D78 0%, #7B2FBE 50%, #1A6EFF 100%)",
                        color: "#fff",
                        boxShadow: "0 0 30px rgba(255,45,120,0.4)",
                      }}
                    >
                      {submitState === "loading" ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                          Enviando…
                        </>
                      ) : (
                        <>
                          Enviar y agendar demo
                          <Send size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>

          {/* Info lateral */}
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="space-y-4">
              <div
                className="p-6 rounded-3xl"
                style={{ background: "rgba(15,15,26,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <h3 className="font-display font-bold text-lg mb-4" style={{ color: "#F0F0FF" }}>
                  También nos puedes contactar:
                </h3>
                <div className="space-y-3">
                  <a
                    href="mailto:hola@ngage.com.mx"
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,45,120,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  >
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,45,120,0.12)", border: "1px solid rgba(255,45,120,0.25)" }}>
                      <Mail size={16} style={{ color: "#FF2D78" }} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs" style={{ color: "#8585A8" }}>Email directo</p>
                      <p className="text-sm font-semibold truncate" style={{ color: "#F0F0FF" }}>hola@ngage.com.mx</p>
                    </div>
                  </a>
                  <a
                    href="https://wa.me/5215555555555?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20de%20N%27GAGE%20para%20mi%20evento"
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  >
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
                      <MessageCircle size={16} style={{ color: "#10B981" }} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs" style={{ color: "#8585A8" }}>WhatsApp Business</p>
                      <p className="text-sm font-semibold" style={{ color: "#F0F0FF" }}>
                        {/* TODO: confirmar número real */}
                        +52 55 5555 5555
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              <div
                className="p-6 rounded-3xl flex items-center gap-4"
                style={{
                  background: "linear-gradient(135deg, rgba(255,45,120,0.08), rgba(123,47,190,0.08))",
                  border: "1px solid rgba(255,45,120,0.2)",
                }}
              >
                <span className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(7,7,15,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Clock size={20} style={{ color: "#FFB800" }} />
                </span>
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "#FFB800" }}>Tiempo de respuesta</p>
                  <p className="font-display font-bold text-lg" style={{ color: "#F0F0FF" }}>
                    Menos de 4 horas
                  </p>
                  <p className="text-xs" style={{ color: "#8585A8" }}>en horario laboral CDMX</p>
                </div>
              </div>

              <div
                className="p-6 rounded-3xl"
                style={{ background: "rgba(15,15,26,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest mb-4" style={{ color: "#1A6EFF" }}>
                  <Sparkles size={12} /> Lo que pasa cuando envías
                </p>
                <ul className="space-y-3 text-sm" style={{ color: "#8585A8" }}>
                  {[
                    "Te llega un correo de confirmación al instante.",
                    "Revisamos tu evento y te llamamos en menos de 24h.",
                    "Si encaja, agendamos una demo en vivo de 20 min.",
                    "Recibes propuesta económica y técnica a medida.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-mono text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: "#FF2D78" }}>
                        0{i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all bg-[#07070F]/60 border border-white/[0.08] text-[#F0F0FF] placeholder:text-[#44445A] focus:border-[#FF2D78]/60 focus:shadow-[0_0_0_3px_rgba(255,45,120,0.15)]";

function Field({
  label, error, hint, required, children,
}: {
  label: string; error?: string; hint?: string; required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-mono font-semibold tracking-wider uppercase" style={{ color: "#8585A8" }}>
          {label}{required && <span style={{ color: "#FF2D78" }}> *</span>}
        </span>
        {hint && <span className="text-[10px] font-mono" style={{ color: "#44445A" }}>{hint}</span>}
      </span>
      {children}
      {error && (
        <span className="block text-xs mt-1 font-medium" style={{ color: "#ef4444" }}>{error}</span>
      )}
    </label>
  );
}
