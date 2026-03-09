"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SelfieCapture from "@/components/camera/SelfieCapture";
import {
  EventPublic, EVENT_TYPE_LABELS, RELATION_TYPE_OPTIONS,
  GENDER_OPTIONS, LOOKING_FOR_OPTIONS, INTERESTS_CATALOG, DRINK_OPTIONS,
} from "@/types/event";

type Step = "loading" | "access_code" | "landing" | "auth" | "selfie" | "interests" | "done";

export default function EventLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [event, setEvent] = useState<EventPublic | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("loading");
  const [, setUser] = useState<{ id: string; email?: string } | null>(null);

  // Access code
  const [accessCode, setAccessCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeValidating, setCodeValidating] = useState(false);

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

  // 1. Load event and validate access code
  useEffect(() => {
    async function loadEvent() {
      const codeFromUrl = searchParams.get("code") || "";

      // Fetch event with optional code validation
      const url = codeFromUrl
        ? `/api/v1/events/slug/${slug}?code=${encodeURIComponent(codeFromUrl)}`
        : `/api/v1/events/slug/${slug}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.eventFull) {
          setError("Este evento ya esta lleno. No es posible registrar mas invitados.");
        } else if (res.status === 410) {
          setError("Este evento ha expirado.");
        } else {
          setError(data.error || "Evento no disponible.");
        }
        setStep("landing");
        return;
      }

      setEvent(data.event);

      // Check access code requirement
      if (data.requiresCode) {
        if (codeFromUrl && data.accessValid) {
          // Code from URL is valid, proceed
          await checkAuthAndRegistration(data.event);
        } else if (codeFromUrl && data.accessValid === false) {
          // Code from URL is invalid
          setCodeError("Codigo de acceso invalido. Intenta de nuevo.");
          setStep("access_code");
        } else {
          // No code provided, ask for it
          setStep("access_code");
        }
      } else {
        // No code required, proceed
        await checkAuthAndRegistration(data.event);
      }
    }

    async function checkAuthAndRegistration(evt: EventPublic) {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        setUser(u);
        // Check if already registered
        const regRes = await fetch(`/api/v1/events/${evt.id}/my-registration`);
        if (regRes.ok) {
          router.push(`/event/${evt.id}/search`);
          return;
        }
        setStep("selfie");
      } else {
        setStep("landing");
      }
    }

    loadEvent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Validate access code manually entered
  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessCode.trim()) return;
    setCodeValidating(true);
    setCodeError("");

    const res = await fetch(`/api/v1/events/slug/${slug}?code=${encodeURIComponent(accessCode.trim())}`);
    const data = await res.json();

    if (!res.ok) {
      setCodeError(data.error || "Error al validar el codigo.");
      setCodeValidating(false);
      return;
    }

    if (data.accessValid) {
      setEvent(data.event);
      // Check auth status
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        setUser(u);
        const regRes = await fetch(`/api/v1/events/${data.event.id}/my-registration`);
        if (regRes.ok) {
          router.push(`/event/${data.event.id}/search`);
          setCodeValidating(false);
          return;
        }
        setStep("selfie");
      } else {
        setStep("landing");
      }
    } else {
      setCodeError("Codigo de acceso invalido. Verifica e intenta de nuevo.");
    }
    setCodeValidating(false);
  }

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
      if (err) { setAuthError("Correo o contrasena incorrectos."); setAuthLoading(false); return; }
    }

    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    setAuthLoading(false);

    if (u) {
      // Check if already registered
      const regRes = await fetch(`/api/v1/events/${event?.id}/my-registration`);
      if (regRes.ok) {
        router.push(`/event/${event?.id}/search`);
        return;
      }
    }
    setStep("selfie");
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/e/${slug}${searchParams.get("code") ? `?code=${searchParams.get("code")}` : ""}` },
    });
  }

  // Toggle interest
  const toggleInterest = useCallback((val: string) => {
    setSelectedInterests((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );
  }, []);

  // Upload selfie to Cloudinary
  async function uploadSelfie(dataUrl: string): Promise<string> {
    const res = await fetch("/api/v1/upload/selfie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });
    const data = await res.json();
    return data.url;
  }

  // Submit final registration
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070F" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }} />
          <p style={{ color: "#8585A8" }}>Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#07070F" }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(255,45,120,0.1)" }}>
            <span className="text-2xl" style={{ color: "#FF2D78" }}>!</span>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#F0F0FF" }}>Evento no disponible</h2>
          <p style={{ color: "#8585A8" }}>{error || "Este evento no existe o ya expiro."}</p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.event_date).toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // STEP: Access Code
  if (step === "access_code") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#07070F" }}>
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(255,45,120,0.1)" }}>
            <span className="text-2xl">🔑</span>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#F0F0FF", fontFamily: "var(--font-playfair)" }}>
            Codigo de acceso
          </h2>
          <p className="text-sm mb-6" style={{ color: "#8585A8" }}>
            Ingresa el codigo que recibiste en tu invitacion
          </p>

          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Ej. BODA2026"
              value={accessCode}
              onChange={(e) => { setAccessCode(e.target.value.toUpperCase()); setCodeError(""); }}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${codeError ? "#FF2D78" : "rgba(255,255,255,0.1)"}`, color: "#F0F0FF" }}
            />

            {codeError && (
              <p className="text-sm" style={{ color: "#FF2D78" }}>{codeError}</p>
            )}

            <button
              type="submit"
              disabled={codeValidating || !accessCode.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #FF2D78, #784BA0)", color: "#fff" }}
            >
              {codeValidating ? "Validando..." : "Verificar codigo"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // STEP: Landing del evento
  if (step === "landing") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#07070F" }}>
        {/* Cover */}
        <div className="relative h-56 flex-shrink-0"
          style={{ background: event.cover_image_url ? `url(${event.cover_image_url}) center/cover` : "linear-gradient(225deg, #FF2D78 0%, #784BA0 50%, #2B86C5 100%)" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, #07070F 100%)" }} />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#F0F0FF" }}>
              {EVENT_TYPE_LABELS[event.type] || "Evento"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 px-4 pt-2 pb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair)", color: "#F0F0FF" }}>
            {event.name}
          </h1>
          <p className="text-sm mb-4" style={{ color: "#8585A8" }}>
            {eventDate}
            {event.venue_name && ` · ${event.venue_name}`}
            {event.venue_city && `, ${event.venue_city}`}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "Tiempo de busqueda", value: `${event.search_duration_minutes} min` },
              { label: "Participantes", value: `${event._count.registrations} registrados` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3"
                style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-xs mb-1" style={{ color: "#8585A8" }}>{s.label}</div>
                <div className="font-bold text-sm" style={{ color: "#F0F0FF" }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 mb-6"
            style={{ background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.2)" }}>
            <p className="text-sm" style={{ color: "#FF2D78", fontWeight: 600 }}>
              Estas soltero/a y buscas conectar?
            </p>
            <p className="text-sm mt-1" style={{ color: "#8585A8" }}>
              Registrate, haz swipe y conecta con personas del mismo evento. Tu perfil expira en {event.expiry_days} dias.
            </p>
          </div>

          <button
            onClick={() => setStep("auth")}
            className="w-full py-4 rounded-2xl font-bold text-lg"
            style={{ background: "linear-gradient(135deg, #FF2D78, #784BA0)", color: "#fff",
              boxShadow: "0 8px 30px rgba(255,45,120,0.4)" }}
          >
            Quiero participar!
          </button>
        </div>
      </div>
    );
  }

  // STEP: Auth
  if (step === "auth") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: "#07070F" }}>
        <button onClick={() => setStep("landing")} className="text-sm mb-6 flex items-center gap-1" style={{ color: "#8585A8" }}>
          &larr; Volver
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-1" style={{ color: "#F0F0FF" }}>Crea tu cuenta</h2>
          <p style={{ color: "#8585A8", fontSize: "14px" }}>para participar en <strong style={{ color: "#F0F0FF" }}>{event.name}</strong></p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: "#0F0F1A" }}>
          {(["register", "login"] as const).map((m) => (
            <button key={m} onClick={() => setAuthMode(m)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: authMode === m ? "linear-gradient(135deg, #FF2D78, #784BA0)" : "transparent",
                color: authMode === m ? "#fff" : "#8585A8",
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
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0F0FF" }} />
          )}
          <input type="email" placeholder="tu@correo.com" value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)} required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0F0FF" }} />
          <input type="password" placeholder="Contrasena" value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)} required minLength={8}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0F0FF" }} />

          {authError && <p className="text-sm text-center" style={{ color: "#FF2D78" }}>{authError}</p>}

          <button type="submit" disabled={authLoading}
            className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #FF2D78, #784BA0)", color: "#fff" }}>
            {authLoading ? "Un momento..." : authMode === "register" ? "Crear cuenta" : "Ingresar"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="text-xs" style={{ color: "#8585A8" }}>o</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        <button onClick={handleGoogle}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0F0FF" }}>
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

  // STEP: Selfie + basic data
  if (step === "selfie") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: "#07070F" }}>
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {["Selfie", "Intereses", "Listo"].map((label, i) => (
            <div key={label} className="flex-1">
              <div className="h-1 rounded-full" style={{ background: i === 0 ? "#FF2D78" : "rgba(255,255,255,0.1)" }} />
              <p className="text-xs mt-1 text-center" style={{ color: i === 0 ? "#FF2D78" : "#555" }}>{label}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-1" style={{ color: "#F0F0FF" }}>Tu selfie del dia</h2>
        <p className="text-sm mb-6" style={{ color: "#8585A8" }}>
          Esta foto te representara en <strong style={{ color: "#F0F0FF" }}>{event.name}</strong>. Solo desde camara, no galeria.
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
              <label className="text-sm mb-1 block" style={{ color: "#8585A8" }}>
                Numero de mesa <span style={{ color: "#555" }}>(opcional)</span>
              </label>
              <input type="text" placeholder="Ej. Mesa 5" value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0F0FF" }} />
            </div>

            {/* Relation type */}
            <div>
              <label className="text-sm mb-2 block" style={{ color: "#8585A8" }}>Como conoces a los anfitriones?</label>
              <div className="grid grid-cols-2 gap-2">
                {RELATION_TYPE_OPTIONS.map((r) => (
                  <button key={r.value} onClick={() => setRelationType(r.value)}
                    className="py-2 px-3 rounded-xl text-sm font-medium text-left transition-all"
                    style={{
                      background: relationType === r.value ? "rgba(255,45,120,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${relationType === r.value ? "#FF2D78" : "rgba(255,255,255,0.08)"}`,
                      color: relationType === r.value ? "#FF2D78" : "#ccc",
                    }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm mb-2 block" style={{ color: "#8585A8" }}>Soy</label>
              <div className="grid grid-cols-2 gap-2">
                {genderOptions.map((g) => (
                  <button key={g.value} onClick={() => setGender(g.value)}
                    className="py-2 px-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: gender === g.value ? "rgba(255,45,120,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${gender === g.value ? "#FF2D78" : "rgba(255,255,255,0.08)"}`,
                      color: gender === g.value ? "#FF2D78" : "#ccc",
                    }}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Looking for */}
            <div>
              <label className="text-sm mb-2 block" style={{ color: "#8585A8" }}>Me interesan</label>
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
              style={{ background: "linear-gradient(135deg, #FF2D78, #784BA0)", color: "#fff" }}>
              Continuar
            </button>
          </div>
        )}
      </div>
    );
  }

  // STEP: Interests (3 steps)
  if (step === "interests") {
    const currentCatalog = INTERESTS_CATALOG[interestStep];
    const isLastStep = interestStep === INTERESTS_CATALOG.length - 1;

    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: "#07070F" }}>
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {["Selfie", "Intereses", "Listo"].map((label, i) => (
            <div key={label} className="flex-1">
              <div className="h-1 rounded-full" style={{ background: i <= 1 ? "#FF2D78" : "rgba(255,255,255,0.1)" }} />
              <p className="text-xs mt-1 text-center" style={{ color: i <= 1 ? "#FF2D78" : "#555" }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}>
            Paso {interestStep + 1} de {INTERESTS_CATALOG.length}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: "#F0F0FF" }}>{currentCatalog.title}</h2>
        <p className="text-sm mb-6" style={{ color: "#8585A8" }}>Elige todos los que quieras</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {currentCatalog.options.map((opt) => {
            const selected = selectedInterests.includes(opt.value);
            return (
              <button key={opt.value} onClick={() => toggleInterest(opt.value)}
                className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all"
                style={{
                  background: selected ? "rgba(255,45,120,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selected ? "#FF2D78" : "rgba(255,255,255,0.08)"}`,
                  transform: selected ? "scale(1.03)" : "scale(1)",
                }}>
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-xs text-center" style={{ color: selected ? "#FF2D78" : "#ccc" }}>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drink on last step */}
        {isLastStep && (
          <div className="mb-6">
            <p className="text-sm mb-3 font-semibold" style={{ color: "#F0F0FF" }}>Tu bebida favorita?</p>
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
              &larr; Atras
            </button>
          )}
          <button
            onClick={() => isLastStep ? handleSubmit() : setInterestStep((s) => s + 1)}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #FF2D78, #784BA0)", color: "#fff" }}>
            {submitting ? "Registrando..." : isLastStep ? "Listo! Entrar al evento" : "Siguiente"}
          </button>
        </div>
      </div>
    );
  }

  // STEP: Done
  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: "#07070F" }}>
        <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center" style={{ background: "rgba(255,45,120,0.15)" }}>
          <span className="text-3xl" style={{ color: "#FF2D78" }}>&#10003;</span>
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair)", color: "#F0F0FF" }}>
          Ya estas adentro!
        </h1>
        <p className="mb-2" style={{ color: "#8585A8" }}>
          Bienvenido a <strong style={{ color: "#F0F0FF" }}>{event.name}</strong>
        </p>
        <p className="text-sm mb-8" style={{ color: "#555" }}>
          Cuando estes listo, presiona el boton para empezar a buscar conexiones
        </p>
        <button
          onClick={() => router.push(`/event/${event.id}/search`)}
          className="px-8 py-4 rounded-2xl font-bold text-xl"
          style={{ background: "linear-gradient(135deg, #FF2D78, #784BA0, #2B86C5)",
            boxShadow: "0 8px 40px rgba(255,45,120,0.5)", color: "#fff" }}>
          INICIAR BUSQUEDA
        </button>
      </div>
    );
  }

  return null;
}
