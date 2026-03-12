"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
  const [displayName, setDisplayName] = useState("");
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
        setDisplayName(u.user_metadata?.full_name || u.user_metadata?.name || "");
        // Check if already registered
        const regRes = await fetch(`/api/v1/events/${evt.id}/my-registration`);
        if (regRes.ok) {
          window.location.href = `/event/${evt.id}/search`;
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
          window.location.href = `/event/${data.event.id}/search`;
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
      const { data, error: err } = await supabase.auth.signUp({
        email: authEmail, password: authPassword,
        options: { data: { full_name: authName } },
      });
      if (err) { setAuthError("Error al crear cuenta. Intenta con otro correo."); setAuthLoading(false); return; }

      // If email confirmation is required and no session, show message
      if (!data.session) {
        setAuthError("Te enviamos un correo de confirmación. Revísalo para continuar.");
        setAuthLoading(false);
        return;
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (err) { setAuthError("Correo o contrasena incorrectos."); setAuthLoading(false); return; }
    }

    // Sync user to DB
    try {
      await fetch("/api/v1/auth/sync", { method: "POST" });
    } catch { /* non-blocking */ }

    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    setAuthLoading(false);

    if (u) {
      setDisplayName(u.user_metadata?.full_name || u.user_metadata?.name || authName || "");
      // Check if already registered
      const regRes = await fetch(`/api/v1/events/${event?.id}/my-registration`);
      if (regRes.ok) {
        window.location.href = `/event/${event?.id}/search`;
        return;
      }
    }
    setStep("selfie");
  }

  async function handleGoogle() {
    // Build the return URL for after OAuth — go through /auth/callback which syncs the user
    const eventUrl = `/e/${slug}${searchParams.get("code") ? `?code=${searchParams.get("code")}` : ""}`;
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(eventUrl)}`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
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
    if (!res.ok) throw new Error("Error al subir la foto. Intenta de nuevo.");
    const data = await res.json();
    if (!data.url) throw new Error("Error al subir la foto. Intenta de nuevo.");
    return data.url;
  }

  // Submit final registration
  async function handleSubmit() {
    if (!gender || !lookingFor || !event) return;
    setSubmitting(true);
    setAuthError("");

    try {
      // Try to upload selfie — if it fails, proceed anyway without blocking the user
      let selfie_url: string | null = null;
      if (selfieDataUrl) {
        try {
          selfie_url = await uploadSelfie(selfieDataUrl);
        } catch {
          selfie_url = null;
        }
      }

      const res = await fetch(`/api/v1/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfie_url,
          display_name: displayName.trim() || null,
          table_number: tableNumber || null,
          relation_type: relationType || null,
          interests: [...selectedInterests, drink].filter(Boolean),
          gender,
          looking_for: lookingFor,
        }),
      });

      if (res.ok) {
        window.location.href = `/event/${event.id}/search`;
      } else {
        const d = await res.json();
        setAuthError(d.error || "Error al registrarte. Intenta de nuevo.");
      }
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Error inesperado. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const genderOptions = event?.gender_extended_mode
    ? GENDER_OPTIONS
    : GENDER_OPTIONS.filter((g) => g.value === "male" || g.value === "female");

  /* ── shared style constants ── */
  const bg = "#07070F";
  const surface = "#0F0F1A";
  const textPrimary = "#F0F0FF";
  const textSecondary = "#8585A8";
  const textMuted = "#44445A";
  const pink = "#FF2D78";
  const purple = "#7B2FBE";
  const blue = "#1A6EFF";
  const gradientCta = `linear-gradient(135deg, ${pink}, ${purple})`;
  const gradientTriple = `linear-gradient(135deg, ${pink}, ${purple}, ${blue})`;
  const borderSubtle = "rgba(255,255,255,0.05)";
  const borderLight = "rgba(255,255,255,0.06)";
  const inputBg = "rgba(255,255,255,0.03)";
  const inputBorder = "rgba(255,255,255,0.08)";
  const selectionBg = `rgba(255,45,120,0.12)`;
  const selectionBgBlue = `rgba(26,110,255,0.12)`;
  const selectionBgPurple = `rgba(123,47,190,0.15)`;
  const glowShadow = `0 8px 32px rgba(255,45,120,0.35)`;
  const glowShadowStrong = `0 8px 40px rgba(255,45,120,0.45)`;

  const backButton = (
    <button
      onClick={() => setStep(step === "auth" ? "landing" : step === "interests" ? "selfie" : "landing")}
      className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      style={{ color: textSecondary }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Volver
    </button>
  );

  // ─────────────────────────────────────────────
  // RENDERS
  // ─────────────────────────────────────────────

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="text-center">
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: pink, borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: textSecondary }}>Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: bg }}>
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: "rgba(255,45,120,0.06)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={pink} strokeWidth="1.5"/>
              <path d="M12 8v5" stroke={pink} strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="0.75" fill={pink}/>
            </svg>
          </div>
          <h2 className="text-xl font-black tracking-tight mb-2" style={{ color: textPrimary }}>
            Evento no disponible
          </h2>
          <p className="text-sm" style={{ color: textSecondary }}>
            {error || "Este evento no existe o ya expiro."}
          </p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.event_date).toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // ── STEP: Access Code ──
  if (step === "access_code") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: bg }}>
        <div className="w-full max-w-sm text-center">
          {/* Inline gradient N'GAGE logo */}
          <div className="mb-6">
            <span
              className="text-3xl font-black tracking-tight"
              style={{
                background: gradientCta,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              N&apos;GAGE
            </span>
          </div>

          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(255,45,120,0.06)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke={pink} strokeWidth="1.5"/>
              <path d="M8 11V7a4 4 0 118 0v4" stroke={pink} strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1.5" fill={pink}/>
            </svg>
          </div>

          <h2 className="text-2xl font-black tracking-tight mb-2" style={{ color: textPrimary }}>
            Codigo de acceso
          </h2>
          <p className="text-sm mb-6" style={{ color: textSecondary }}>
            Ingresa el codigo que recibiste en tu invitacion
          </p>

          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Ej. BODA2026"
              value={accessCode}
              onChange={(e) => { setAccessCode(e.target.value.toUpperCase()); setCodeError(""); }}
              autoFocus
              className="w-full rounded-xl px-4 py-3.5 text-center text-lg font-bold tracking-widest outline-none transition-all focus:ring-1"
              style={{
                background: inputBg,
                border: `1px solid ${codeError ? pink : inputBorder}`,
                color: textPrimary,
                ...(codeError ? {} : { focusRingColor: pink }),
              }}
            />

            {codeError && (
              <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,45,120,0.06)" }}>
                <p className="text-sm font-medium" style={{ color: pink }}>{codeError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={codeValidating || !accessCode.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-40 active:scale-[0.98] transition-transform"
              style={{ background: gradientCta, color: "#fff", boxShadow: glowShadow }}
            >
              {codeValidating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#fff", borderTopColor: "transparent" }} />
                  Validando...
                </span>
              ) : "Verificar codigo"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── STEP: Landing del evento ──
  if (step === "landing") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: bg }}>
        {/* Cover */}
        <div
          className="relative h-60 flex-shrink-0"
          style={{
            background: event.cover_image_url
              ? `url(${event.cover_image_url}) center/cover`
              : `linear-gradient(225deg, ${pink} 0%, ${purple} 50%, ${blue} 100%)`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, transparent 30%, ${bg} 100%)` }}
          />
          <div className="absolute bottom-4 left-4 right-4">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                color: textPrimary,
                border: `1px solid ${borderSubtle}`,
              }}
            >
              {EVENT_TYPE_LABELS[event.type] || "Evento"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 px-4 pt-3 pb-8">
          <h1
            className="text-3xl font-black tracking-tight mb-1"
            style={{ color: textPrimary }}
          >
            {event.name}
          </h1>
          <p className="text-sm mb-5" style={{ color: textSecondary }}>
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
              <div
                key={s.label}
                className="rounded-2xl p-3.5"
                style={{ background: surface, border: `1px solid ${borderSubtle}` }}
              >
                <div className="text-xs font-medium mb-1" style={{ color: textSecondary }}>{s.label}</div>
                <div className="font-bold text-sm" style={{ color: textPrimary }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl p-4 mb-6"
            style={{ background: "rgba(255,45,120,0.06)", border: `1px solid rgba(255,45,120,0.15)` }}
          >
            <p className="text-sm font-bold" style={{ color: pink }}>
              Estas soltero/a y buscas conectar?
            </p>
            <p className="text-sm mt-1.5" style={{ color: textSecondary }}>
              Registrate, haz swipe y conecta con personas del mismo evento. Tu perfil expira en {event.expiry_days} dias.
            </p>
          </div>

          <button
            onClick={() => setStep("auth")}
            className="w-full py-4 rounded-2xl font-bold text-lg active:scale-[0.98] transition-transform"
            style={{
              background: gradientCta,
              color: "#fff",
              boxShadow: glowShadow,
            }}
          >
            Quiero participar!
          </button>
        </div>
      </div>
    );
  }

  // ── STEP: Auth ──
  if (step === "auth") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: bg }}>
        {backButton}

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: textPrimary }}>
            Crea tu cuenta
          </h2>
          <p className="text-sm" style={{ color: textSecondary }}>
            para participar en <strong style={{ color: textPrimary }}>{event.name}</strong>
          </p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: surface, border: `1px solid ${borderSubtle}` }}>
          {(["register", "login"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setAuthMode(m)}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: authMode === m ? gradientCta : "transparent",
                color: authMode === m ? "#fff" : textSecondary,
              }}
            >
              {m === "register" ? "Crear cuenta" : "Ya tengo cuenta"}
            </button>
          ))}
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-3.5">
          {authMode === "register" && (
            <input
              type="text"
              placeholder="Tu nombre completo"
              value={authName}
              onChange={(e) => setAuthName(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            />
          )}
          <input
            type="email"
            placeholder="tu@correo.com"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            required
            className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
          />
          <input
            type="password"
            placeholder="Contrasena"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
          />

          {authError && (
            <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,45,120,0.06)" }}>
              <p className="text-sm text-center font-medium" style={{ color: pink }}>{authError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
            style={{ background: gradientCta, color: "#fff", boxShadow: glowShadow }}
          >
            {authLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#fff", borderTopColor: "transparent" }} />
                Un momento...
              </span>
            ) : authMode === "register" ? "Crear cuenta" : "Ingresar"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: borderLight }} />
          <span className="text-xs font-medium" style={{ color: textMuted }}>o</span>
          <div className="flex-1 h-px" style={{ background: borderLight }} />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
          style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
        >
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

  // ── Progress bar component for selfie/interests ──
  const ProgressBar = ({ activeIndex }: { activeIndex: number }) => (
    <div className="flex gap-2 mb-8">
      {["Selfie", "Intereses", "Listo"].map((label, i) => (
        <div key={label} className="flex-1">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: i <= activeIndex ? "100%" : "0%",
                background: `linear-gradient(90deg, ${pink}, ${purple})`,
              }}
            />
          </div>
          <p className="text-xs font-medium mt-1.5 text-center" style={{ color: i <= activeIndex ? pink : textMuted }}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );

  // ── STEP: Selfie + basic data ──
  if (step === "selfie") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: bg }}>
        <ProgressBar activeIndex={0} />

        <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: textPrimary }}>
          Tu selfie del dia
        </h2>
        <p className="text-sm mb-6" style={{ color: textSecondary }}>
          Esta foto te representara en <strong style={{ color: textPrimary }}>{event.name}</strong>. Solo desde camara, no galeria.
        </p>

        <div className="flex justify-center mb-6">
          <SelfieCapture
            onCapture={(url) => setSelfieDataUrl(url)}
            onRetake={() => setSelfieDataUrl(null)}
            captured={selfieDataUrl}
          />
        </div>

        {selfieDataUrl && (
          <div className="flex flex-col gap-5">
            {/* Nombre / Apodo */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: textSecondary }}>
                ¿Cómo te llamamos? <span style={{ color: pink }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Tu nombre o apodo"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="given-name"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ background: inputBg, border: `1px solid ${displayName.trim() ? pink : inputBorder}`, color: textPrimary }}
              />
              {displayName.trim() && (
                <p className="text-xs mt-1.5" style={{ color: textMuted }}>
                  Así te verán los demás en el evento
                </p>
              )}
            </div>

            {/* Mesa */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: textSecondary }}>
                Numero de mesa <span style={{ color: textMuted }}>(opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Mesa 5"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
              />
            </div>

            {/* Relation type */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: textSecondary }}>
                Como conoces a los anfitriones?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RELATION_TYPE_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRelationType(r.value)}
                    className="py-2.5 px-3 rounded-xl text-sm font-medium text-left transition-all active:scale-[0.98]"
                    style={{
                      background: relationType === r.value ? selectionBg : "rgba(255,255,255,0.03)",
                      border: `1px solid ${relationType === r.value ? pink : borderSubtle}`,
                      color: relationType === r.value ? pink : textSecondary,
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: textSecondary }}>Soy</label>
              <div className="grid grid-cols-2 gap-2">
                {genderOptions.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGender(g.value)}
                    className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                    style={{
                      background: gender === g.value ? selectionBg : "rgba(255,255,255,0.03)",
                      border: `1px solid ${gender === g.value ? pink : borderSubtle}`,
                      color: gender === g.value ? pink : textSecondary,
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Looking for */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: textSecondary }}>Me interesan</label>
              <div className="grid grid-cols-2 gap-2">
                {LOOKING_FOR_OPTIONS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLookingFor(l.value)}
                    className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                    style={{
                      background: lookingFor === l.value ? selectionBgBlue : "rgba(255,255,255,0.03)",
                      border: `1px solid ${lookingFor === l.value ? blue : borderSubtle}`,
                      color: lookingFor === l.value ? blue : textSecondary,
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep("interests")}
              disabled={!gender || !lookingFor}
              className="w-full py-3.5 rounded-xl font-bold text-sm mt-1 disabled:opacity-40 active:scale-[0.98] transition-transform"
              style={{ background: gradientCta, color: "#fff", boxShadow: glowShadow }}
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── STEP: Interests (3 steps) ──
  if (step === "interests") {
    const currentCatalog = INTERESTS_CATALOG[interestStep];
    const isLastStep = interestStep === INTERESTS_CATALOG.length - 1;

    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: bg }}>
        <ProgressBar activeIndex={1} />

        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(255,45,120,0.08)", color: pink }}
          >
            Paso {interestStep + 1} de {INTERESTS_CATALOG.length}
          </span>
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: textPrimary }}>
          {currentCatalog.title}
        </h2>
        <p className="text-sm mb-6" style={{ color: textSecondary }}>Elige todos los que quieras</p>

        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {currentCatalog.options.map((opt) => {
            const selected = selectedInterests.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleInterest(opt.value)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all active:scale-[0.96]"
                style={{
                  background: selected ? selectionBg : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selected ? pink : borderSubtle}`,
                  transform: selected ? "scale(1.02)" : "scale(1)",
                }}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-xs font-medium text-center" style={{ color: selected ? pink : textSecondary }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Drink on last step */}
        {isLastStep && (
          <div className="mb-6">
            <p className="text-xs font-bold mb-3" style={{ color: textPrimary }}>Tu bebida favorita?</p>
            <div className="flex flex-wrap gap-2">
              {DRINK_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDrink(d.value)}
                  className="py-2 px-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                  style={{
                    background: drink === d.value ? selectionBgPurple : "rgba(255,255,255,0.03)",
                    border: `1px solid ${drink === d.value ? purple : borderSubtle}`,
                    color: drink === d.value ? purple : textSecondary,
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {authError && (
          <div className="mb-3 px-4 py-3 rounded-xl text-sm text-center" style={{ background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.2)", color: pink }}>
            {authError}
          </div>
        )}

        <div className="flex gap-3 mt-auto">
          {interestStep > 0 && (
            <button
              onClick={() => setInterestStep((s) => s - 1)}
              className="flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${borderLight}`, color: textSecondary }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Atras
            </button>
          )}
          <button
            onClick={() => isLastStep ? handleSubmit() : setInterestStep((s) => s + 1)}
            disabled={submitting}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
            style={{ background: gradientCta, color: "#fff", boxShadow: glowShadow }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#fff", borderTopColor: "transparent" }} />
                Registrando...
              </span>
            ) : isLastStep ? "Listo! Entrar al evento" : "Siguiente"}
          </button>
        </div>
      </div>
    );
  }

  // ── STEP: Done ──
  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: bg }}>
        {/* Gradient checkmark icon */}
        <div
          className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, rgba(255,45,120,0.12), rgba(123,47,190,0.12))` }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="checkGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor={pink}/>
                <stop offset="1" stopColor={purple}/>
              </linearGradient>
            </defs>
            <path
              d="M10 18L16 24L26 12"
              stroke="url(#checkGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: textPrimary }}>
          Ya estas adentro!
        </h1>
        <p className="text-sm mb-2" style={{ color: textSecondary }}>
          Bienvenido a <strong style={{ color: textPrimary }}>{event.name}</strong>
        </p>
        <p className="text-sm mb-8" style={{ color: textMuted }}>
          Cuando estes listo, presiona el boton para empezar a buscar conexiones
        </p>

        <button
          onClick={() => { window.location.href = `/event/${event.id}/search`; }}
          className="px-8 py-4 rounded-2xl font-bold text-lg active:scale-[0.98] transition-transform"
          style={{
            background: gradientTriple,
            boxShadow: glowShadowStrong,
            color: "#fff",
          }}
        >
          INICIAR BUSQUEDA
        </button>
      </div>
    );
  }

  return null;
}
