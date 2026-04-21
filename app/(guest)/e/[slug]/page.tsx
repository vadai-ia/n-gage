"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SelfieCapture from "@/components/camera/SelfieCapture";
import PoweredBy from "@/components/event/PoweredBy";
import {
  EventPublic, EVENT_TYPE_LABELS, RELATION_TYPE_OPTIONS,
  GENDER_OPTIONS, LOOKING_FOR_OPTIONS, INTERESTS_CATALOG, DRINK_OPTIONS,
} from "@/types/event";

type Step =
  | "loading" | "access_code" | "intro" | "auth"
  | "wizard_team"      // 1. Team (bride/groom) — wedding only
  | "wizard_mesa"      // 2. Table + visibility
  | "wizard_selfie"    // 3. Selfie (MANDATORY)
  | "wizard_gallery"   // 4. Gallery (up to 5 extras)
  | "wizard_interests" // 5. Interests (3-step sub-wizard)
  | "wizard_bio"       // 6. Bio (optional)
  | "wizard_gender"    // 7. Gender + looking_for (MANDATORY)
  | "done";

export default function EventLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [event, setEvent] = useState<EventPublic | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("loading");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  // Access code
  const [accessCode, setAccessCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeValidating, setCodeValidating] = useState(false);

  // Form state
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [tableVisible, setTableVisible] = useState(true);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]); // up to 5
  const [galleryPhotoCapture, setGalleryPhotoCapture] = useState<string | null>(null); // temp for next photo
  const [relationType, setRelationType] = useState("");
  const [gender, setGender] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [drink, setDrink] = useState("");
  const [bio, setBio] = useState("");
  const [interestStep, setInterestStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Photo carousel (background de bienvenida)
  const [photoIdx, setPhotoIdx] = useState(0);

  // Auth form
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Helper: todos los guests ven la bienvenida con carrusel (intro).
  // Si ya esta logeado y ya la vio, saltamos al wizard.
  const getNextStepAfterAccessGate = useCallback((isLoggedIn: boolean): Step => {
    if (typeof window === "undefined") {
      return isLoggedIn ? "wizard_team" : "intro";
    }
    const introSeen = window.localStorage.getItem(`ngage-intro-seen-${slug}`);
    if (isLoggedIn && introSeen) return "wizard_team";
    return "intro";
  }, [slug]);

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
        setStep("intro");
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
        // Check if already registered — must actually have a registration, not just a 200 OK
        try {
          const regRes = await fetch(`/api/v1/events/${evt.id}/my-registration`);
          if (regRes.ok) {
            const regData = await regRes.json();
            // Only redirect if registration actually exists AND is complete (has a selfie)
            if (regData?.registration?.selfie_url) {
              window.location.href = `/event/${evt.id}/search`;
              return;
            }
          }
        } catch { /* proceed to wizard */ }
        // No registration yet — force wizard
        setStep(getNextStepAfterAccessGate(true));
      } else {
        setStep(getNextStepAfterAccessGate(false));
      }
    }

    loadEvent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Auto-advance carousel en la pantalla de bienvenida
  useEffect(() => {
    if (step !== "intro") return;
    const photos = event?.event_photos ?? [];
    if (photos.length < 2) return;
    const id = window.setInterval(() => {
      setPhotoIdx((i) => (i + 1) % photos.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [step, event?.event_photos]);

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
        try {
          const regRes = await fetch(`/api/v1/events/${data.event.id}/my-registration`);
          if (regRes.ok) {
            const regData = await regRes.json();
            if (regData?.registration?.selfie_url) {
              window.location.href = `/event/${data.event.id}/search`;
              setCodeValidating(false);
              return;
            }
          }
        } catch { /* proceed */ }
        setStep(getNextStepAfterAccessGate(true));
      } else {
        setStep(getNextStepAfterAccessGate(false));
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
      if (err) {
        setAuthError("Error al crear cuenta. Intenta con otro correo.");
        setAuthLoading(false);
        return;
      }

      // Si Supabase tiene email confirmation activado y no hay sesión,
      // intentar login directo como fallback
      if (!data.session) {
        const { error: loginErr } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (loginErr) {
          setAuthError(
            "Te enviamos un correo de confirmación. Pídele al organizador desactivar la confirmación por email para acceso instantáneo."
          );
          setAuthLoading(false);
          return;
        }
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
      // Only skip the wizard if the user already completed it for THIS event (selfie_url present)
      try {
        const regRes = await fetch(`/api/v1/events/${event?.id}/my-registration`);
        if (regRes.ok) {
          const regData = await regRes.json();
          if (regData?.registration?.selfie_url) {
            window.location.href = `/event/${event?.id}/search`;
            return;
          }
        }
      } catch { /* proceed to wizard */ }
    }
    setStep("wizard_team");
  }

  async function handleGoogle() {
    if (authMode === "register" && !acceptedTerms) {
      setAuthError("Debes aceptar los Terminos y Condiciones para continuar.");
      return;
    }
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

  // Resize a File to max dimension and return as base64 data URL (JPEG 0.85)
  async function resizeImageFile(file: File, maxDim = 1080): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("Canvas no disponible")); return; }
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = () => reject(new Error("No se pudo leer la imagen"));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
      reader.readAsDataURL(file);
    });
  }

  // Upload selfie or gallery photo to Cloudinary
  async function uploadSelfie(dataUrl: string, kind: "selfie" | "gallery" = "selfie"): Promise<string> {
    const res = await fetch("/api/v1/upload/selfie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl, kind }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "" }));
      throw new Error(data.error || `Error al subir la foto (${res.status})`);
    }
    const data = await res.json();
    if (!data.url) throw new Error("El servidor no devolvio URL de imagen");
    return data.url;
  }

  async function handleSubmit() {
    if (!gender || !lookingFor || !event) return;
    setSubmitting(true);
    setAuthError("");

    try {
      if (!selfieDataUrl) {
        setAuthError("Falta tu selfie del día. Vuelve atrás y tómala.");
        setSubmitting(false);
        return;
      }

      let selfie_url: string;
      try {
        selfie_url = await uploadSelfie(selfieDataUrl);
      } catch (e) {
        setAuthError(
          e instanceof Error
            ? e.message
            : "No pudimos subir tu foto. Verifica tu conexión y reintenta."
        );
        setSubmitting(false);
        return;
      }

      // Upload extra gallery photos (if any) — best-effort
      const uploadedGallery: string[] = [];
      for (const g of galleryPhotos) {
        try {
          // Already uploaded URLs (https://) can be reused as-is
          if (g.startsWith("http")) { uploadedGallery.push(g); continue; }
          const url = await uploadSelfie(g, "gallery");
          uploadedGallery.push(url);
        } catch {
          // ignore individual upload failures
        }
      }

      const res = await fetch(`/api/v1/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfie_url,
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          table_number: tableNumber || null,
          table_visible: tableVisible,
          gallery_photos: uploadedGallery,
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
      onClick={() => setStep("intro")}
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

  // ── STEP: Bienvenida (carrusel + glass) ──
  // Merge de intro + landing: UNA sola pantalla de acceso con fondo carrusel.
  if (step === "intro" && event) {
    const niceDate = new Date(event.event_date).toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const photos = event.event_photos?.length
      ? event.event_photos
      : event.cover_image_url
      ? [event.cover_image_url]
      : [];

    const handleEnter = () => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`ngage-intro-seen-${slug}`, "1");
      }
      setStep(user ? "wizard_team" : "auth");
    };

    const steps = [
      {
        num: "1",
        title: "Toma tu selfie del dia",
        desc: "Asi te reconocen los demas invitados. Solo camara, no galeria.",
      },
      {
        num: "2",
        title: `${event.search_duration_minutes} min para conectar`,
        desc: "Haz swipe sobre los solteros del evento. Like, no-like o super like.",
      },
      {
        num: "3",
        title: "Chatea con tus matches",
        desc: "Si hay like mutuo, pueden platicar dentro de la app.",
      },
    ];

    return (
      <div className="relative min-h-dvh overflow-hidden" style={{ background: bg }}>
        {/* ── Carrusel de fondo (full-bleed) ── */}
        {photos.length > 0 ? (
          photos.map((url, i) => (
            <div
              key={url}
              aria-hidden
              className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
              style={{
                opacity: i === photoIdx % photos.length ? 1 : 0,
                backgroundImage: `url(${url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: "scale(1.04)",
              }}
            />
          ))
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: gradientTriple }}
          />
        )}

        {/* Overlay oscuro para legibilidad */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(7,7,15,0.55) 0%, rgba(7,7,15,0.45) 35%, rgba(7,7,15,0.85) 75%, rgba(7,7,15,0.98) 100%)",
          }}
        />

        {/* Tint de marca sutil arriba */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-56"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(255,45,120,0.18), transparent 70%)",
          }}
        />

        {/* ── Contenido ── */}
        <div className="relative z-10 min-h-dvh flex flex-col px-4 pt-8 pb-6">
          {/* Header */}
          <div className="text-center pt-2">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
              style={{
                background: "rgba(255,45,120,0.22)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(16px) saturate(160%)",
                WebkitBackdropFilter: "blur(16px) saturate(160%)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: pink, boxShadow: `0 0 8px ${pink}` }}
              />
              {EVENT_TYPE_LABELS[event.type] || "Evento"}
            </div>
            <h1
              className="text-4xl font-black tracking-tight mb-1.5"
              style={{
                color: "#fff",
                textShadow: "0 4px 24px rgba(0,0,0,0.55)",
                letterSpacing: "-0.02em",
              }}
            >
              {event.name}
            </h1>
            <p
              className="text-sm capitalize"
              style={{ color: "rgba(255,255,255,0.82)", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}
            >
              {niceDate}
              {event.venue_name && ` · ${event.venue_name}`}
            </p>
          </div>

          {/* Spacer — deja respirar la foto */}
          <div className="flex-1 min-h-[120px]" />

          {/* Indicadores del carrusel */}
          {photos.length > 1 && (
            <div className="flex justify-center items-center gap-1.5 mb-4">
              {photos.map((_, i) => {
                const active = i === photoIdx % photos.length;
                return (
                  <span
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: active ? 22 : 6,
                      background: active ? "#fff" : "rgba(255,255,255,0.4)",
                      boxShadow: active ? "0 0 8px rgba(255,255,255,0.6)" : "none",
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Glass card — Cómo funciona */}
          <div
            className="rounded-3xl p-4 mb-3"
            style={{
              background: "rgba(15,15,26,0.5)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            }}
          >
            <h2 className="text-sm font-black tracking-widest uppercase mb-3 text-center" style={{ color: "rgba(255,255,255,0.92)" }}>
              Como funciona
            </h2>
            <div className="flex flex-col gap-2">
              {steps.map((s) => (
                <div
                  key={s.num}
                  className="flex items-center gap-3 p-2.5 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,45,120,0.3), rgba(123,47,190,0.3))",
                      border: "1px solid rgba(255,45,120,0.35)",
                      color: "#fff",
                    }}
                  >
                    {s.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold mb-0.5" style={{ color: "#fff" }}>
                      {s.title}
                    </p>
                    <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA principal */}
          <button
            onClick={handleEnter}
            className="w-full py-4 rounded-2xl text-base font-bold transition-transform active:scale-[0.98]"
            style={{
              background: gradientTriple,
              color: "#fff",
              boxShadow: "0 12px 40px rgba(255,45,120,0.5), 0 0 0 1px rgba(255,255,255,0.12) inset",
            }}
          >
            Quiero participar
          </button>

          {event.whatsapp_group_url && (
            <a
              href={event.whatsapp_group_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-2.5 py-3 rounded-2xl text-sm font-semibold text-center transition-transform active:scale-[0.98]"
              style={{
                background: "rgba(37,211,102,0.12)",
                border: "1px solid rgba(37,211,102,0.35)",
                color: "#25D366",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              Unirme al grupo de WhatsApp
            </a>
          )}

          <PoweredBy variant="muted" />
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

          {/* T&C checkbox — only for register */}
          {authMode === "register" && (
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#FF2D78] shrink-0"
              />
              <span className="text-xs leading-relaxed" style={{ color: textSecondary }}>
                Soy mayor de 18 anos y acepto los{" "}
                <a href="/terminos-condiciones" target="_blank" rel="noopener noreferrer"
                  className="underline font-semibold" style={{ color: pink }}>
                  Terminos y Condiciones y Aviso de Privacidad
                </a>{" "}
                de N&apos;GAGE
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={authLoading || (authMode === "register" && !acceptedTerms)}
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

  // ── Wizard step helpers ──
  const TOTAL_WIZARD_STEPS = event?.type === "wedding" ? 7 : 6;
  const stepNumber: Record<string, number> = event?.type === "wedding"
    ? { wizard_team: 1, wizard_mesa: 2, wizard_selfie: 3, wizard_gallery: 4, wizard_interests: 5, wizard_bio: 6, wizard_gender: 7 }
    : { wizard_mesa: 1, wizard_selfie: 2, wizard_gallery: 3, wizard_interests: 4, wizard_bio: 5, wizard_gender: 6 };

  function WizardHeader({ currentStep, title, subtitle }: { currentStep: string; title: string; subtitle?: string }) {
    const n = stepNumber[currentStep] ?? 1;
    const progress = (n / TOTAL_WIZARD_STEPS) * 100;
    return (
      <>
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: pink }}>Paso {n} de {TOTAL_WIZARD_STEPS}</span>
            <span className="text-[10px] font-medium" style={{ color: textMuted }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #FF2D78, #7B2FBE)" }} />
          </div>
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: textPrimary }}>{title}</h2>
        {subtitle && <p className="text-sm mb-5" style={{ color: textSecondary }}>{subtitle}</p>}
      </>
    );
  }

  // ── STEP 1: Team (only for weddings) ──
  if (step === "wizard_team") {
    // Auto-skip if not a wedding
    if (event && event.type !== "wedding") {
      setStep("wizard_mesa");
      return null;
    }
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: bg }}>
        <WizardHeader currentStep="wizard_team" title="Vienes de parte de la novia o del novio?" subtitle="Ayudanos a identificar con que equipo estas" />
        <div className="flex flex-col gap-2.5 mb-6">
          {RELATION_TYPE_OPTIONS.map((r) => (
            <button key={r.value} onClick={() => setRelationType(r.value)}
              className="py-4 px-4 rounded-2xl text-sm font-bold text-left transition-all active:scale-[0.98]"
              style={{
                background: relationType === r.value ? selectionBg : "rgba(255,255,255,0.03)",
                border: `1px solid ${relationType === r.value ? pink : borderSubtle}`,
                color: relationType === r.value ? pink : textPrimary,
              }}>
              {r.label}
            </button>
          ))}
        </div>
        <button onClick={() => setStep("wizard_mesa")} disabled={!relationType}
          className="w-full py-3.5 rounded-xl font-bold text-sm mt-auto disabled:opacity-40 transition-transform active:scale-[0.98]"
          style={{ background: gradientCta, color: "#fff", boxShadow: glowShadow }}>
          Continuar
        </button>
      </div>
    );
  }

  // ── STEP 2: Mesa + visibility ──
  if (step === "wizard_mesa") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: bg }}>
        <WizardHeader currentStep="wizard_mesa" title="Tu mesa en el evento" subtitle="Compartela o manten el misterio" />
        <div className="flex flex-col gap-5 mb-6">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: textSecondary }}>
              Numero de mesa <span style={{ color: textMuted }}>(opcional)</span>
            </label>
            <input type="text" placeholder="Ej. Mesa 5" value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
          </div>

          {tableNumber.trim() && (
            <div className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${borderSubtle}` }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: textPrimary }}>Mesa visible?</p>
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                  {tableVisible ? "Otros veran tu mesa en tu tarjeta" : "Tu mesa solo se ve tras hacer match"}
                </p>
              </div>
              <button type="button" onClick={() => setTableVisible((v) => !v)}
                className="w-12 h-6 rounded-full relative shrink-0"
                style={{ background: tableVisible ? "#FF2D78" : "rgba(255,255,255,0.08)" }}>
                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all"
                  style={{ left: tableVisible ? "calc(100% - 22px)" : "2px" }} />
              </button>
            </div>
          )}

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: textSecondary }}>
              Como te llamamos? <span style={{ color: pink }}>*</span>
            </label>
            <input type="text" placeholder="Tu nombre o apodo" value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: inputBg, border: `1px solid ${displayName.trim() ? pink : inputBorder}`, color: textPrimary }} />
          </div>
        </div>
        <div className="flex gap-3 mt-auto">
          {event?.type === "wedding" && (
            <button onClick={() => setStep("wizard_team")}
              className="flex-1 py-3.5 rounded-xl font-semibold text-sm"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${borderLight}`, color: textSecondary }}>
              Atras
            </button>
          )}
          <button onClick={() => setStep("wizard_selfie")} disabled={!displayName.trim()}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm disabled:opacity-40"
            style={{ background: gradientCta, color: "#fff", boxShadow: glowShadow }}>
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 3: Selfie (MANDATORY) ──
  if (step === "wizard_selfie") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: bg }}>
        <WizardHeader currentStep="wizard_selfie" title="Tu selfie del evento" subtitle="Es obligatoria — asi te reconoceran los demas" />

        <div className="flex justify-center mb-6">
          <SelfieCapture onCapture={(url) => setSelfieDataUrl(url)}
            onRetake={() => setSelfieDataUrl(null)} captured={selfieDataUrl} />
        </div>

        <div className="flex gap-3 mt-auto">
          <button onClick={() => setStep("wizard_mesa")}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${borderLight}`, color: textSecondary }}>
            Atras
          </button>
          <button onClick={() => setStep("wizard_gallery")} disabled={!selfieDataUrl}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm disabled:opacity-40"
            style={{ background: gradientCta, color: "#fff", boxShadow: glowShadow }}>
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 4: Gallery (up to 5 extras) ──
  if (step === "wizard_gallery") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: bg }}>
        <WizardHeader currentStep="wizard_gallery" title="Tu galeria (opcional)" subtitle={`Agrega hasta 5 fotos mas. Al tocar tu tarjeta las veran todas.`} />

        {/* Photos grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Main selfie */}
          <div className="aspect-square rounded-xl overflow-hidden relative"
            style={{ border: `1px solid ${pink}` }}>
            {selfieDataUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={selfieDataUrl} alt="selfie" className="w-full h-full object-cover" />
            )}
            <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: pink, color: "#fff" }}>PRINCIPAL</span>
          </div>
          {/* Gallery photos */}
          {galleryPhotos.map((g, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden relative"
              style={{ border: `1px solid ${borderSubtle}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g} alt={`foto ${i + 2}`} className="w-full h-full object-cover" />
              <button onClick={() => setGalleryPhotos((p) => p.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}>x</button>
            </div>
          ))}
          {/* Empty slots */}
          {galleryPhotos.length < 5 && Array.from({ length: 5 - galleryPhotos.length }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.02)", border: `1px dashed ${borderSubtle}` }}>
              <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke={textMuted} strokeWidth={1.5}>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          ))}
        </div>

        {/* Camera + Gallery upload for adding extra photos */}
        {galleryPhotos.length < 5 && (
          <div className="mb-4">
            <div className="flex flex-col gap-3">
              {/* File picker — phone gallery */}
              <label className="w-full rounded-xl cursor-pointer transition-transform active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, rgba(123,47,190,0.12), rgba(255,45,120,0.12))",
                  border: "1px solid rgba(123,47,190,0.3)",
                }}>
                <div className="py-4 px-4 flex items-center justify-center gap-2.5">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#A855F7" strokeWidth={1.5}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span className="text-sm font-bold" style={{ color: "#A855F7" }}>
                    Subir de mi galeria
                  </span>
                </div>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    const remaining = 5 - galleryPhotos.length;
                    const toProcess = files.slice(0, remaining);
                    for (const file of toProcess) {
                      const dataUrl = await resizeImageFile(file, 1080);
                      setGalleryPhotos((p) => [...p, dataUrl]);
                    }
                    e.target.value = ""; // allow re-selecting the same file later
                  }} />
              </label>

              {/* Or separator */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: borderSubtle }} />
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: textMuted }}>o toma una en vivo</span>
                <div className="flex-1 h-px" style={{ background: borderSubtle }} />
              </div>

              <SelfieCapture
                captured={galleryPhotoCapture}
                onCapture={(url) => {
                  setGalleryPhotos((p) => [...p, url]);
                  setGalleryPhotoCapture(null);
                }}
                onRetake={() => setGalleryPhotoCapture(null)}
              />
            </div>
          </div>
        )}

        <p className="text-xs text-center mb-4" style={{ color: textMuted }}>
          {galleryPhotos.length}/5 fotos agregadas
        </p>

        <div className="flex gap-3 mt-auto">
          <button onClick={() => setStep("wizard_selfie")}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${borderLight}`, color: textSecondary }}>
            Atras
          </button>
          <button onClick={() => setStep("wizard_interests")}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm"
            style={{ background: gradientCta, color: "#fff", boxShadow: glowShadow }}>
            {galleryPhotos.length === 0 ? "Saltar" : "Continuar"}
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 5: Interests (3 sub-steps) ──
  if (step === "wizard_interests") {
    const currentCatalog = INTERESTS_CATALOG[interestStep];
    const isLastSubStep = interestStep === INTERESTS_CATALOG.length - 1;
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: bg }}>
        <WizardHeader currentStep="wizard_interests" title={currentCatalog.title} subtitle={`${interestStep + 1} de ${INTERESTS_CATALOG.length} categorias`} />
        <p className="text-xs mb-4" style={{ color: textMuted }}>Los intereses en comun se resaltan en las tarjetas</p>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {currentCatalog.options.map((opt) => {
            const selected = selectedInterests.includes(opt.value);
            return (
              <button key={opt.value} onClick={() => toggleInterest(opt.value)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl"
                style={{
                  background: selected ? selectionBg : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selected ? pink : borderSubtle}`,
                }}>
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-xs font-medium text-center" style={{ color: selected ? pink : textSecondary }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {isLastSubStep && (
          <div className="mb-5">
            <p className="text-xs font-bold mb-2" style={{ color: textPrimary }}>Tu bebida favorita?</p>
            <div className="flex flex-wrap gap-2">
              {DRINK_OPTIONS.map((d) => (
                <button key={d.value} onClick={() => setDrink(d.value === drink ? "" : d.value)}
                  className="py-2 px-4 rounded-xl text-sm font-medium"
                  style={{
                    background: drink === d.value ? selectionBgPurple : "rgba(255,255,255,0.03)",
                    border: `1px solid ${drink === d.value ? purple : borderSubtle}`,
                    color: drink === d.value ? purple : textSecondary,
                  }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-auto">
          <button onClick={() => {
              if (interestStep > 0) setInterestStep((s) => s - 1);
              else setStep("wizard_gallery");
            }}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${borderLight}`, color: textSecondary }}>
            Atras
          </button>
          <button onClick={() => {
              if (isLastSubStep) setStep("wizard_bio");
              else setInterestStep((s) => s + 1);
            }}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm"
            style={{ background: gradientCta, color: "#fff", boxShadow: glowShadow }}>
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 6: Bio (optional) ──
  if (step === "wizard_bio") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: bg }}>
        <WizardHeader currentStep="wizard_bio" title="Una pequena bio" subtitle="No solo importa el look, tambien el feel" />

        <textarea placeholder="Ej. Amante del cafe, los perros y las buenas platicas..."
          value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} rows={4}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-2"
          style={{ background: inputBg, border: `1px solid ${bio.trim() ? purple : inputBorder}`, color: textPrimary }} />
        <p className="text-xs text-right mb-1" style={{ color: textMuted }}>{bio.length}/160</p>
        <p className="text-xs mb-6" style={{ color: textMuted }}>
          Esto aparecera en tu tarjeta para que te conozcan mas alla del look
        </p>

        <div className="flex gap-3 mt-auto">
          <button onClick={() => setStep("wizard_interests")}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${borderLight}`, color: textSecondary }}>
            Atras
          </button>
          <button onClick={() => setStep("wizard_gender")}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm"
            style={{ background: gradientCta, color: "#fff", boxShadow: glowShadow }}>
            {bio.trim() ? "Continuar" : "Saltar"}
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 7: Gender + looking_for (MANDATORY) ──
  if (step === "wizard_gender") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: bg }}>
        <WizardHeader currentStep="wizard_gender" title="A quien quieres encontrar?" subtitle="Este es el filtro mas importante de tu experiencia" />

        <div className="flex flex-col gap-5 mb-6">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: textSecondary }}>
              Yo soy <span style={{ color: pink }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {genderOptions.map((g) => (
                <button key={g.value} onClick={() => setGender(g.value)}
                  className="py-3 px-3 rounded-xl text-sm font-medium"
                  style={{
                    background: gender === g.value ? selectionBg : "rgba(255,255,255,0.03)",
                    border: `1px solid ${gender === g.value ? pink : borderSubtle}`,
                    color: gender === g.value ? pink : textSecondary,
                  }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: textSecondary }}>
              Me interesan <span style={{ color: pink }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LOOKING_FOR_OPTIONS.map((l) => (
                <button key={l.value} onClick={() => setLookingFor(l.value)}
                  className="py-3 px-3 rounded-xl text-sm font-medium"
                  style={{
                    background: lookingFor === l.value ? selectionBgBlue : "rgba(255,255,255,0.03)",
                    border: `1px solid ${lookingFor === l.value ? blue : borderSubtle}`,
                    color: lookingFor === l.value ? blue : textSecondary,
                  }}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-3" style={{ background: "rgba(255,184,0,0.06)", border: "1px solid rgba(255,184,0,0.15)" }}>
            <p className="text-xs" style={{ color: "#FFB800" }}>
              Solo te saldran personas de esa categoria. Si elegiste &ldquo;Mujeres&rdquo;, unicamente veras mujeres y ellas te veran a ti.
            </p>
          </div>
        </div>

        {authError && (
          <div className="mb-3 px-4 py-3 rounded-xl text-sm text-center"
            style={{ background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.2)", color: pink }}>
            {authError}
          </div>
        )}

        <div className="flex gap-3 mt-auto">
          <button onClick={() => setStep("wizard_bio")}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${borderLight}`, color: textSecondary }}>
            Atras
          </button>
          <button onClick={handleSubmit}
            disabled={submitting || !gender || !lookingFor || !selfieDataUrl}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm disabled:opacity-40"
            style={{ background: gradientCta, color: "#fff", boxShadow: glowShadow }}>
            {submitting ? "Registrando..." : "Entrar al evento"}
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
        <PoweredBy variant="muted" />
      </div>
    );
  }

  return null;
}
