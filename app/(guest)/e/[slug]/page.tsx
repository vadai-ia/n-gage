"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SelfieCapture from "@/components/camera/SelfieCapture";
import {
  EventPublic, EVENT_TYPE_LABELS, RELATION_TYPE_OPTIONS,
  GENDER_OPTIONS, LOOKING_FOR_OPTIONS, INTERESTS_CATALOG, DRINK_OPTIONS,
} from "@/types/event";

type Step = "loading" | "landing" | "auth" | "selfie" | "interests" | "done";

export default function EventLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [event, setEvent] = useState<EventPublic | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("loading");
  const [, setUser] = useState<{ id: string; email?: string } | null>(null);

  // Form state
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [relationType, setRelationType] = useState("");
  const [gender, setGender] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [drink, setDrink] = useState("");
  const [interestStep, setInterestStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Auth form
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // 1. Cargar evento
  useEffect(() => {
    async function loadEvent() {
      const res = await fetch(`/api/v1/events/slug/${slug}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error); setStep("landing"); return; }
      setEvent(data.event);

      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        setUser(u);
        // Verificar si ya está registrado
        const regRes = await fetch(`/api/v1/events/${data.event.id}/my-registration`);
        if (regRes.ok) { router.push(`/event/${data.event.id}/search`); return; }
        setStep("selfie");
      } else {
        setStep("landing");
      }
    }
    loadEvent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Auth
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    if (authMode === "register") {
      const { error: err } = await supabase.auth.signUp({
        email: authEmail, password: authPassword,
        options: { data: { full_name: authName } },
      });
      if (err) { setAuthError("Error al crear cuenta. Intenta con otro correo."); setAuthLoading(false); return; }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (err) { setAuthError("Correo o contraseña incorrectos."); setAuthLoading(false); return; }
    }

    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    setAuthLoading(false);
    setStep("selfie");
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/e/${slug}` },
    });
  }

  // Toggle interés
  const toggleInterest = useCallback((val: string) => {
    setSelectedInterests((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );
  }, []);

  // Subir selfie a Cloudinary
  async function uploadSelfie(dataUrl: string): Promise<string> {
    const res = await fetch("/api/v1/upload/selfie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });
    const data = await res.json();
    return data.url;
  }

  // Submit registro final
  async function handleSubmit() {
    if (!selfieDataUrl || !gender || !lookingFor || !event) return;
    setSubmitting(true);

    const selfie_url = await uploadSelfie(selfieDataUrl);

    const res = await fetch(`/api/v1/events/${event.id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selfie_url,
        table_number: tableNumber || null,
        relation_type: relationType || null,
        interests: [...selectedInterests, drink].filter(Boolean),
        gender,
        looking_for: lookingFor,
      }),
    });

    if (res.ok) {
      setStep("done");
    } else {
      const d = await res.json();
      setAuthError(d.error || "Error al registrarte. Intenta de nuevo.");
    }
    setSubmitting(false);
  }

  const genderOptions = event?.gender_extended_mode
    ? GENDER_OPTIONS
    : GENDER_OPTIONS.filter((g) => g.value === "male" || g.value === "female");

  // ─────────────────────────────────────────────
  // RENDERS
  // ─────────────────────────────────────────────

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0F" }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">💫</div>
          <p style={{ color: "#A0A0B0" }}>Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0A0A0F" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2">Evento no disponible</h2>
          <p style={{ color: "#A0A0B0" }}>{error || "Este evento no existe o ya expiró."}</p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.event_date).toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // STEP: Landing del evento
  if (step === "landing") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#0A0A0F" }}>
        {/* Cover */}
        <div className="relative h-56 flex-shrink-0"
          style={{ background: event.cover_image_url ? `url(${event.cover_image_url}) center/cover` : "linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, #0A0A0F 100%)" }} />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
              {EVENT_TYPE_LABELS[event.type] || "Evento"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 px-4 pt-2 pb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
            {event.name}
          </h1>
          <p className="text-sm mb-4" style={{ color: "#A0A0B0" }}>
            {eventDate}
            {event.venue_name && ` · ${event.venue_name}`}
            {event.venue_city && `, ${event.venue_city}`}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: "⏱️", label: "Tiempo de búsqueda", value: `${event.search_duration_minutes} min` },
              { icon: "👥", label: "Participantes", value: `${event._count.registrations} registrados` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3"
                style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-xs mb-1" style={{ color: "#A0A0B0" }}>{s.label}</div>
                <div className="font-bold text-sm">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 mb-6"
            style={{ background: "rgba(255,60,172,0.08)", border: "1px solid rgba(255,60,172,0.2)" }}>
            <p className="text-sm" style={{ color: "#FF3CAC", fontWeight: 600 }}>
              ¿Estás soltero/a y buscas conectar?
            </p>
            <p className="text-sm mt-1" style={{ color: "#A0A0B0" }}>
              Regístrate, haz swipe y conecta con personas del mismo evento. Tu perfil expira en {event.expiry_days} días.
            </p>
          </div>

          <button
            onClick={() => setStep("auth")}
            className="w-full py-4 rounded-2xl font-bold text-lg"
            style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff",
              boxShadow: "0 8px 30px rgba(255,60,172,0.4)" }}
          >
            ¡Quiero participar! 🔥
          </button>
        </div>
      </div>
    );
  }

  // STEP: Auth
  if (step === "auth") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: "#0A0A0F" }}>
        <button onClick={() => setStep("landing")} className="text-sm mb-6 flex items-center gap-1" style={{ color: "#A0A0B0" }}>
          ← Volver
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-1">Crea tu cuenta</h2>
          <p style={{ color: "#A0A0B0", fontSize: "14px" }}>para participar en <strong style={{ color: "#fff" }}>{event.name}</strong></p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: "#16161F" }}>
          {(["register", "login"] as const).map((m) => (
            <button key={m} onClick={() => setAuthMode(m)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: authMode === m ? "linear-gradient(135deg, #FF3CAC, #784BA0)" : "transparent",
                color: authMode === m ? "#fff" : "#A0A0B0",
              }}>
              {m === "register" ? "Crear cuenta" : "Ya tengo cuenta"}
            </button>
          ))}
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {authMode === "register" && (
            <input type="text" placeholder="Tu nombre completo" value={authName}
              onChange={(e) => setAuthName(e.target.value)} required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
          )}
          <input type="email" placeholder="tu@correo.com" value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)} required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
          <input type="password" placeholder="Contraseña" value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)} required minLength={8}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />

          {authError && <p className="text-sm text-center" style={{ color: "#FF3CAC" }}>{authError}</p>}

          <button type="submit" disabled={authLoading}
            className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff" }}>
            {authLoading ? "Un momento..." : authMode === "register" ? "Crear cuenta" : "Ingresar"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="text-xs" style={{ color: "#A0A0B0" }}>o</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        <button onClick={handleGoogle}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>
      </div>
    );
  }

  // STEP: Selfie + datos básicos
  if (step === "selfie") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: "#0A0A0F" }}>
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {["Selfie", "Intereses", "Listo"].map((label, i) => (
            <div key={label} className="flex-1">
              <div className="h-1 rounded-full" style={{ background: i === 0 ? "#FF3CAC" : "rgba(255,255,255,0.1)" }} />
              <p className="text-xs mt-1 text-center" style={{ color: i === 0 ? "#FF3CAC" : "#555" }}>{label}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-1">Tu selfie del día</h2>
        <p className="text-sm mb-6" style={{ color: "#A0A0B0" }}>
          Esta foto te representará en <strong style={{ color: "#fff" }}>{event.name}</strong>. Solo desde cámara, no galería.
        </p>

        <div className="flex justify-center mb-6">
          <SelfieCapture
            onCapture={(url) => setSelfieDataUrl(url)}
            onRetake={() => setSelfieDataUrl(null)}
            captured={selfieDataUrl}
          />
        </div>

        {selfieDataUrl && (
          <div className="flex flex-col gap-4">
            {/* Mesa */}
            <div>
              <label className="text-sm mb-1 block" style={{ color: "#A0A0B0" }}>
                Número de mesa <span style={{ color: "#555" }}>(opcional)</span>
              </label>
              <input type="text" placeholder="Ej. Mesa 5" value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
            </div>

            {/* Relación con el evento */}
            <div>
              <label className="text-sm mb-2 block" style={{ color: "#A0A0B0" }}>¿Cómo conoces a los anfitriones?</label>
              <div className="grid grid-cols-2 gap-2">
                {RELATION_TYPE_OPTIONS.map((r) => (
                  <button key={r.value} onClick={() => setRelationType(r.value)}
                    className="py-2 px-3 rounded-xl text-sm font-medium text-left transition-all"
                    style={{
                      background: relationType === r.value ? "rgba(255,60,172,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${relationType === r.value ? "#FF3CAC" : "rgba(255,255,255,0.08)"}`,
                      color: relationType === r.value ? "#FF3CAC" : "#ccc",
                    }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Género */}
            <div>
              <label className="text-sm mb-2 block" style={{ color: "#A0A0B0" }}>Soy</label>
              <div className="grid grid-cols-2 gap-2">
                {genderOptions.map((g) => (
                  <button key={g.value} onClick={() => setGender(g.value)}
                    className="py-2 px-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: gender === g.value ? "rgba(255,60,172,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${gender === g.value ? "#FF3CAC" : "rgba(255,255,255,0.08)"}`,
                      color: gender === g.value ? "#FF3CAC" : "#ccc",
                    }}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Busco */}
            <div>
              <label className="text-sm mb-2 block" style={{ color: "#A0A0B0" }}>Me interesan</label>
              <div className="grid grid-cols-2 gap-2">
                {LOOKING_FOR_OPTIONS.map((l) => (
                  <button key={l.value} onClick={() => setLookingFor(l.value)}
                    className="py-2 px-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: lookingFor === l.value ? "rgba(43,134,197,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${lookingFor === l.value ? "#2B86C5" : "rgba(255,255,255,0.08)"}`,
                      color: lookingFor === l.value ? "#2B86C5" : "#ccc",
                    }}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep("interests")}
              disabled={!gender || !lookingFor}
              className="w-full py-3 rounded-xl font-bold text-sm mt-2 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff" }}>
              Continuar →
            </button>
          </div>
        )}
      </div>
    );
  }

  // STEP: Intereses (3 pasos)
  if (step === "interests") {
    const currentCatalog = INTERESTS_CATALOG[interestStep];
    const isLastStep = interestStep === INTERESTS_CATALOG.length - 1;

    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: "#0A0A0F" }}>
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {["Selfie", "Intereses", "Listo"].map((label, i) => (
            <div key={label} className="flex-1">
              <div className="h-1 rounded-full" style={{ background: i <= 1 ? "#FF3CAC" : "rgba(255,255,255,0.1)" }} />
              <p className="text-xs mt-1 text-center" style={{ color: i <= 1 ? "#FF3CAC" : "#555" }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,60,172,0.15)", color: "#FF3CAC" }}>
            Paso {interestStep + 1} de {INTERESTS_CATALOG.length}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-1">{currentCatalog.title}</h2>
        <p className="text-sm mb-6" style={{ color: "#A0A0B0" }}>Elige todos los que quieras</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {currentCatalog.options.map((opt) => {
            const selected = selectedInterests.includes(opt.value);
            return (
              <button key={opt.value} onClick={() => toggleInterest(opt.value)}
                className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all"
                style={{
                  background: selected ? "rgba(255,60,172,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selected ? "#FF3CAC" : "rgba(255,255,255,0.08)"}`,
                  transform: selected ? "scale(1.03)" : "scale(1)",
                }}>
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-xs text-center" style={{ color: selected ? "#FF3CAC" : "#ccc" }}>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bebida favorita en el último paso */}
        {isLastStep && (
          <div className="mb-6">
            <p className="text-sm mb-3 font-semibold">¿Tu bebida favorita?</p>
            <div className="flex flex-wrap gap-2">
              {DRINK_OPTIONS.map((d) => (
                <button key={d.value} onClick={() => setDrink(d.value)}
                  className="py-2 px-4 rounded-xl text-sm transition-all"
                  style={{
                    background: drink === d.value ? "rgba(120,75,160,0.25)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${drink === d.value ? "#784BA0" : "rgba(255,255,255,0.08)"}`,
                    color: drink === d.value ? "#c48dff" : "#ccc",
                  }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-auto">
          {interestStep > 0 && (
            <button onClick={() => setInterestStep((s) => s - 1)}
              className="flex-1 py-3 rounded-xl font-semibold text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc" }}>
              ← Atrás
            </button>
          )}
          <button
            onClick={() => isLastStep ? handleSubmit() : setInterestStep((s) => s + 1)}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff" }}>
            {submitting ? "Registrando..." : isLastStep ? "¡Listo! Entrar al evento 🚀" : "Siguiente →"}
          </button>
        </div>
      </div>
    );
  }

  // STEP: Done
  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: "#0A0A0F" }}>
        <div className="text-6xl mb-6 animate-bounce">🎉</div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
          ¡Ya estás adentro!
        </h1>
        <p className="mb-2" style={{ color: "#A0A0B0" }}>
          Bienvenido a <strong style={{ color: "#fff" }}>{event.name}</strong>
        </p>
        <p className="text-sm mb-8" style={{ color: "#666" }}>
          Cuando estés listo, presiona el botón para empezar a buscar conexiones
        </p>
        <button
          onClick={() => router.push(`/event/${event.id}/search`)}
          className="px-8 py-4 rounded-2xl font-bold text-xl"
          style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0, #2B86C5)",
            boxShadow: "0 8px 40px rgba(255,60,172,0.5)", color: "#fff" }}>
          INICIAR BÚSQUEDA 🔍
        </button>
      </div>
    );
  }

  return null;
}
