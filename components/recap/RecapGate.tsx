"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { unlockRecap } from "@/app/(public)/recuerdos/[slug]/actions";
import { formatEventDate } from "@/lib/utils/date";
import { recapImage } from "@/lib/recap/images";

const CODE_LENGTH = 6;

type Props = {
  slug: string;
  eventName: string;
  eventDate: string;
  venue: string | null;
  cover: string | null;
  invalidCode: boolean;
};

export default function RecapGate({ slug, eventName, eventDate, venue, cover, invalidCode }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [chars, setChars] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(invalidCode ? "El código del enlace no es válido. Escríbelo de nuevo." : null);
  const [pending, startTransition] = useTransition();
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const code = chars.join("");

  function setFromString(raw: string, startAt = 0) {
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!clean) return;
    const next = [...chars];
    for (let i = 0; i < clean.length && startAt + i < CODE_LENGTH; i++) next[startAt + i] = clean[i];
    setChars(next);
    setError(null);
    inputs.current[Math.min(startAt + clean.length, CODE_LENGTH - 1)]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !chars[i] && i > 0) {
      const next = [...chars];
      next[i - 1] = "";
      setChars(next);
      inputs.current[i - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) {
      inputs.current[i + 1]?.focus();
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < CODE_LENGTH) {
      setError("El código tiene 6 caracteres");
      inputs.current[code.length]?.focus();
      return;
    }
    startTransition(async () => {
      const res = await unlockRecap(slug, code);
      if (res.ok) {
        router.replace(`/recuerdos/${slug}`);
        router.refresh();
      } else {
        setError(res.error ?? "No pudimos validar el código");
        inputs.current[0]?.focus();
      }
    });
  }

  return (
    <main className="relative min-h-dvh flex flex-col overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* Portada del evento */}
      <div className="absolute inset-0" aria-hidden>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recapImage.hero(cover)} alt="" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full" style={{ background: "var(--gradient-brand-soft)" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #07070F 30%, rgba(7,7,15,0.7) 65%, rgba(7,7,15,0.35) 100%)" }} />
      </div>

      <div
        className="relative z-10 flex flex-col flex-1 px-5 max-w-md w-full mx-auto"
        style={{ paddingTop: "max(env(safe-area-inset-top), 24px)", paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
      >
        <Logo size={28} />

        <motion.div
          className="mt-auto"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.24em] mb-3" style={{ color: "var(--brand-pink)" }}>
            Los recuerdos de
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight mb-3" style={{ color: "var(--text-primary)" }}>
            {eventName}
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--fg-2)" }}>
            {formatEventDate(eventDate, { day: "numeric", month: "long", year: "numeric" })}
            {venue ? ` · ${venue}` : ""}
          </p>

          <form
            onSubmit={submit}
            className="rounded-3xl p-5 backdrop-blur-xl"
            style={{ background: "rgba(15,15,26,0.72)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <label htmlFor="recap-code-0" className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              <Lock size={16} aria-hidden style={{ color: "var(--brand-pink)" }} />
              Escribe tu código de acceso
            </label>

            <div className="flex gap-2 justify-between mb-3" role="group" aria-label="Código de 6 caracteres">
              {chars.map((c, i) => (
                <input
                  key={i}
                  id={`recap-code-${i}`}
                  ref={(el) => { inputs.current[i] = el; }}
                  value={c}
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  aria-label={`Caracter ${i + 1}`}
                  aria-invalid={!!error}
                  maxLength={CODE_LENGTH}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) {
                      const next = [...chars];
                      next[i] = "";
                      setChars(next);
                      return;
                    }
                    setFromString(v.length > 1 ? v.slice(c ? 1 : 0) : v, i);
                  }}
                  onPaste={(e) => { e.preventDefault(); setFromString(e.clipboardData.getData("text"), 0); }}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  className="w-full aspect-[4/5] max-w-[52px] rounded-2xl text-center font-mono text-2xl font-semibold uppercase outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${error ? "rgba(239,68,68,0.6)" : c ? "rgba(255,45,120,0.5)" : "rgba(255,255,255,0.1)"}`,
                    color: "var(--text-primary)",
                    minHeight: 56,
                  }}
                />
              ))}
            </div>

            <p role="alert" aria-live="polite" className="text-sm min-h-[20px] mb-3" style={{ color: "#F87171" }}>
              {error}
            </p>

            <button
              type="submit"
              disabled={pending}
              className="w-full min-h-[52px] rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-pink)" }}
            >
              {pending ? "Abriendo…" : "Entrar a los recuerdos"}
              {!pending && <ArrowRight size={18} aria-hidden />}
            </button>

            <p className="text-xs mt-4 text-center" style={{ color: "var(--fg-3)" }}>
              El código viene en el mensaje que te enviamos. ¿No lo tienes? Pídeselo a quien organizó el evento.
            </p>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
