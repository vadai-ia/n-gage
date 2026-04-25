"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SelfieCapture from "@/components/camera/SelfieCapture";
import { RELATION_TYPE_OPTIONS, GENDER_OPTIONS, LOOKING_FOR_OPTIONS, INTERESTS_CATALOG, DRINK_OPTIONS } from "@/types/event";
import { getRelationLabel } from "@/lib/utils/relationLabels";
import { formatEventDate } from "@/lib/utils/date";

type MyReg = {
  selfie_url: string;
  display_name: string | null;
  bio: string | null;
  table_number: string | null;
  relation_type: string | null;
  interests: string[] | null;
  gender: string;
  looking_for: string;
  super_likes_used: number;
  photos_taken: number;
};

async function uploadSelfie(dataUrl: string, kind: "selfie" | "gallery" = "selfie"): Promise<string> {
  const res = await fetch("/api/v1/upload/selfie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl, kind }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error al subir la foto (${res.status})`);
  }
  const data = await res.json();
  if (!data.url) throw new Error("El servidor no devolvio URL de imagen");
  return data.url;
}

export default function ProfilePage() {
  const { id: eventId } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [reg, setReg] = useState<MyReg | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [activeSection, setActiveSection] = useState<"overview" | "photo" | "bio" | "interests" | "preferences">("overview");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [relationType, setRelationType] = useState("");
  const [gender, setGender] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [drink, setDrink] = useState("");

  // Photo state
  const [newSelfie, setNewSelfie] = useState<string | null>(null);

  // Past events
  const [pastEvents, setPastEvents] = useState<Array<{ id: string; event_id: string; event: { id: string; name: string; event_date: string; venue_name: string | null; status: string } }>>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    fetch(`/api/v1/events/${eventId}/my-registration`)
      .then((r) => r.json())
      .then((d) => {
        if (d.registration) {
          const r = d.registration;
          setReg(r);
          setDisplayName(r.display_name || "");
          setBio(r.bio || "");
          setTableNumber(r.table_number || "");
          setRelationType(r.relation_type || "");
          setGender(r.gender || "");
          setLookingFor(r.looking_for || "");
          const ints = Array.isArray(r.interests) ? r.interests : [];
          setSelectedInterests(ints.filter((i: string) => !DRINK_OPTIONS.find((d) => d.value === i)));
          const drinkVal = ints.find((i: string) => DRINK_OPTIONS.find((d) => d.value === i));
          setDrink(drinkVal || "");
        }
        setLoading(false);
      });

    // Past events
    fetch(`/api/v1/me/events`)
      .then((r) => r.json())
      .then((d) => {
        setPastEvents((d.registrations ?? []).filter((r: { event_id: string }) => r.event_id !== eventId));
      })
      .catch(() => { /* non-blocking */ });
  }, [eventId]);

  async function handleSave() {
    setSaving(true);
    setSaveMsg("");

    let newSelfieUrl: string | undefined;
    if (newSelfie) {
      try {
        newSelfieUrl = await uploadSelfie(newSelfie);
      } catch {
        setSaveMsg("Error al subir la foto");
        setSaving(false);
        return;
      }
    }

    const payload: Record<string, unknown> = {
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      table_number: tableNumber || null,
      relation_type: relationType || null,
      gender,
      looking_for: lookingFor,
      interests: [...selectedInterests, drink].filter(Boolean),
    };
    if (newSelfieUrl) payload.selfie_url = newSelfieUrl;

    const res = await fetch(`/api/v1/events/${eventId}/my-registration`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      setReg(data.registration);
      setNewSelfie(null);
      setSaveMsg("Guardado!");
      setTimeout(() => setSaveMsg(""), 2000);
      setActiveSection("overview");
    } else {
      setSaveMsg("Error al guardar");
    }
    setSaving(false);
  }

  async function handleLogout() {
    if (!confirm("Cerrar sesion?")) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function toggleInterest(val: string) {
    setSelectedInterests((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070F" }}>
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const currentSelfie = newSelfie || reg?.selfie_url || "";
  const displayedName = displayName || reg?.display_name || user?.user_metadata?.full_name || "Tu";
  const firstName = displayedName.split(" ")[0];

  // ── Section: Photo editor ──
  if (activeSection === "photo") {
    return (
      <div className="min-h-screen p-4 pt-6" style={{ background: "#07070F" }}>
        <button onClick={() => setActiveSection("overview")}
          className="text-sm mb-4 flex items-center gap-1" style={{ color: "#8585A8" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Volver al perfil
        </button>
        <h1 className="text-xl font-black mb-1" style={{ color: "#F0F0FF" }}>Cambiar selfie</h1>
        <p className="text-xs mb-6" style={{ color: "#8585A8" }}>
          Esta es la foto que los demas veran en tu tarjeta. Toma una nueva selfie.
        </p>

        <div className="flex justify-center mb-6">
          <SelfieCapture onCapture={(url) => setNewSelfie(url)} onRetake={() => setNewSelfie(null)} captured={newSelfie} />
        </div>

        {newSelfie && (
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-transform active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>
            {saving ? "Guardando..." : "Guardar nueva foto"}
          </button>
        )}
      </div>
    );
  }

  // ── Section: Bio & name ──
  if (activeSection === "bio") {
    return (
      <div className="min-h-screen p-4 pt-6" style={{ background: "#07070F" }}>
        <button onClick={() => setActiveSection("overview")}
          className="text-sm mb-4 flex items-center gap-1" style={{ color: "#8585A8" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Volver
        </button>
        <h1 className="text-xl font-black mb-1" style={{ color: "#F0F0FF" }}>Tus datos</h1>
        <p className="text-xs mb-6" style={{ color: "#8585A8" }}>Como te veran los demas</p>

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#8585A8" }}>
              Nombre o apodo
            </label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Como te llamamos"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#F0F0FF" }} />
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#8585A8" }}>
              Bio — describete en pocas palabras
            </label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} rows={3}
              placeholder="Ej. Amante del cafe, los perros y las buenas platicas..."
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#F0F0FF" }} />
            <p className="text-xs mt-1 text-right" style={{ color: "#44445A" }}>{bio.length}/160</p>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#8585A8" }}>
              Mesa (opcional)
            </label>
            <input type="text" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Ej. Mesa 5"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#F0F0FF" }} />
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "#8585A8" }}>Como conoces a los anfitriones?</label>
            <div className="grid grid-cols-2 gap-2">
              {RELATION_TYPE_OPTIONS.map((r) => (
                <button key={r.value} onClick={() => setRelationType(r.value)}
                  className="py-2.5 px-3 rounded-xl text-sm font-medium text-left"
                  style={{
                    background: relationType === r.value ? "rgba(255,45,120,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${relationType === r.value ? "rgba(255,45,120,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color: relationType === r.value ? "#FF2D78" : "#8585A8",
                  }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
          {saveMsg && <p className="text-xs text-center" style={{ color: saveMsg.includes("Error") ? "#EF4444" : "#10B981" }}>{saveMsg}</p>}
        </div>
      </div>
    );
  }

  // ── Section: Interests ──
  if (activeSection === "interests") {
    return (
      <div className="min-h-screen p-4 pt-6" style={{ background: "#07070F" }}>
        <button onClick={() => setActiveSection("overview")}
          className="text-sm mb-4 flex items-center gap-1" style={{ color: "#8585A8" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Volver
        </button>
        <h1 className="text-xl font-black mb-1" style={{ color: "#F0F0FF" }}>Tus intereses</h1>
        <p className="text-xs mb-6" style={{ color: "#8585A8" }}>Los intereses en comun se resaltan en las tarjetas</p>

        {INTERESTS_CATALOG.map((cat) => (
          <div key={cat.step} className="mb-5">
            <p className="text-xs font-bold mb-2" style={{ color: "#FF2D78" }}>{cat.title}</p>
            <div className="grid grid-cols-3 gap-2">
              {cat.options.map((opt) => {
                const sel = selectedInterests.includes(opt.value);
                return (
                  <button key={opt.value} onClick={() => toggleInterest(opt.value)}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl"
                    style={{
                      background: sel ? "rgba(255,45,120,0.1)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${sel ? "rgba(255,45,120,0.4)" : "rgba(255,255,255,0.06)"}`,
                    }}>
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="text-[10px] font-medium text-center" style={{ color: sel ? "#FF2D78" : "#8585A8" }}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mb-5">
          <p className="text-xs font-bold mb-2" style={{ color: "#FF2D78" }}>Tu bebida</p>
          <div className="flex flex-wrap gap-2">
            {DRINK_OPTIONS.map((d) => (
              <button key={d.value} onClick={() => setDrink(d.value === drink ? "" : d.value)}
                className="py-2 px-4 rounded-xl text-sm font-medium"
                style={{
                  background: drink === d.value ? "rgba(123,47,190,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${drink === d.value ? "rgba(123,47,190,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: drink === d.value ? "#A855F7" : "#8585A8",
                }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    );
  }

  // ── Section: Preferences ──
  if (activeSection === "preferences") {
    return (
      <div className="min-h-screen p-4 pt-6" style={{ background: "#07070F" }}>
        <button onClick={() => setActiveSection("overview")}
          className="text-sm mb-4 flex items-center gap-1" style={{ color: "#8585A8" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Volver
        </button>
        <h1 className="text-xl font-black mb-1" style={{ color: "#F0F0FF" }}>Preferencias</h1>
        <p className="text-xs mb-6" style={{ color: "#8585A8" }}>Controla quien te ve y a quien quieres ver</p>

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "#8585A8" }}>Soy</label>
            <div className="grid grid-cols-2 gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button key={g.value} onClick={() => setGender(g.value)}
                  className="py-2.5 px-3 rounded-xl text-sm font-medium"
                  style={{
                    background: gender === g.value ? "rgba(255,45,120,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${gender === g.value ? "rgba(255,45,120,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color: gender === g.value ? "#FF2D78" : "#8585A8",
                  }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "#8585A8" }}>Me interesan</label>
            <div className="grid grid-cols-2 gap-2">
              {LOOKING_FOR_OPTIONS.map((l) => (
                <button key={l.value} onClick={() => setLookingFor(l.value)}
                  className="py-2.5 px-3 rounded-xl text-sm font-medium"
                  style={{
                    background: lookingFor === l.value ? "rgba(26,110,255,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${lookingFor === l.value ? "rgba(26,110,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color: lookingFor === l.value ? "#1A6EFF" : "#8585A8",
                  }}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    );
  }

  // ── Overview: Card preview + section list ──
  return (
    <div className="min-h-screen p-4 pt-6" style={{ background: "#07070F" }}>
      <h1 className="text-2xl font-black mb-1" style={{ color: "#F0F0FF" }}>Mi Perfil</h1>
      <p className="text-xs mb-5" style={{ color: "#8585A8" }}>Asi te veran los demas en el evento</p>

      {/* Card preview — identical to SwipeCard look */}
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-5"
        style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
        {currentSelfie ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentSelfie} alt="Tu selfie" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(255,45,120,0.05)" }}>
            <svg width={80} height={80} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, transparent 80%)" }} />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-3xl font-black mb-1" style={{ color: "#F0F0FF", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            {firstName}
          </h2>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide mb-2" style={{ color: "rgba(240,240,255,0.7)" }}>
            {getRelationLabel(relationType) && <span>{getRelationLabel(relationType)}</span>}
            {relationType && tableNumber && <span className="opacity-40">•</span>}
            {tableNumber && <span>Mesa {tableNumber}</span>}
          </div>
          {bio && (
            <p className="text-xs leading-relaxed italic mb-2" style={{ color: "rgba(240,240,255,0.7)" }}>
              &ldquo;{bio}&rdquo;
            </p>
          )}
          {selectedInterests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedInterests.slice(0, 3).map((i) => {
                const allOpts = INTERESTS_CATALOG.flatMap((c) => c.options);
                const opt = allOpts.find((o) => o.value === i);
                return (
                  <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-medium"
                    style={{ background: "rgba(255,255,255,0.08)", color: "#F0F0FF", backdropFilter: "blur(8px)" }}>
                    {opt?.emoji} {opt?.label ?? i}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit sections */}
      <div className="flex flex-col gap-2 mb-4">
        <button onClick={() => setActiveSection("photo")}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-left px-4 flex items-center gap-3"
          style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.15)", color: "#F0F0FF" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,45,120,0.15)" }}>
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Cambiar selfie</p>
            <p className="text-[10px]" style={{ color: "#8585A8" }}>Tu foto principal</p>
          </div>
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#44445A" strokeWidth={2}>
            <path d="M9 18l6-6-6-6" strokeLinecap="round" />
          </svg>
        </button>

        <button onClick={() => setActiveSection("bio")}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-left px-4 flex items-center gap-3"
          style={{ background: "rgba(123,47,190,0.06)", border: "1px solid rgba(123,47,190,0.15)", color: "#F0F0FF" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(123,47,190,0.15)" }}>
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#A855F7" strokeWidth={1.5}>
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Nombre, bio y mesa</p>
            <p className="text-[10px]" style={{ color: "#8585A8" }}>Como te conocen</p>
          </div>
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#44445A" strokeWidth={2}>
            <path d="M9 18l6-6-6-6" strokeLinecap="round" />
          </svg>
        </button>

        <button onClick={() => setActiveSection("interests")}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-left px-4 flex items-center gap-3"
          style={{ background: "rgba(26,110,255,0.06)", border: "1px solid rgba(26,110,255,0.15)", color: "#F0F0FF" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(26,110,255,0.15)" }}>
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#1A6EFF" strokeWidth={1.5}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Intereses y bebida</p>
            <p className="text-[10px]" style={{ color: "#8585A8" }}>{selectedInterests.length} seleccionados</p>
          </div>
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#44445A" strokeWidth={2}>
            <path d="M9 18l6-6-6-6" strokeLinecap="round" />
          </svg>
        </button>

        <button onClick={() => setActiveSection("preferences")}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-left px-4 flex items-center gap-3"
          style={{ background: "rgba(255,184,0,0.06)", border: "1px solid rgba(255,184,0,0.15)", color: "#F0F0FF" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,184,0,0.15)" }}>
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#FFB800" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Preferencias</p>
            <p className="text-[10px]" style={{ color: "#8585A8" }}>Genero y a quien buscas</p>
          </div>
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#44445A" strokeWidth={2}>
            <path d="M9 18l6-6-6-6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      {reg && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-3 text-center" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="text-xl font-black" style={{ color: "#FFB800" }}>{reg.super_likes_used}</div>
            <div className="text-xs mt-1" style={{ color: "#8585A8" }}>Super like</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="text-xl font-black" style={{ color: "#7B2FBE" }}>{reg.photos_taken}/10</div>
            <div className="text-xs mt-1" style={{ color: "#8585A8" }}>Fotos</div>
          </div>
        </div>
      )}

      {/* Past events */}
      {pastEvents.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#44445A" }}>
              Mis eventos anteriores
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
          <div className="flex flex-col gap-2">
            {pastEvents.map((r) => {
              const isOpen = r.event.status === "active";
              return (
                <button key={r.id}
                  onClick={() => { if (isOpen) window.location.href = `/event/${r.event.id}/search`; }}
                  disabled={!isOpen}
                  className="w-full text-left p-3 rounded-xl flex items-center gap-3 transition-transform active:scale-[0.98] disabled:cursor-not-allowed"
                  style={{
                    background: "#0F0F1A",
                    border: `1px solid ${isOpen ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)"}`,
                    opacity: isOpen ? 1 : 0.6,
                  }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,45,120,0.08)", color: "#FF2D78" }}>
                    <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "#F0F0FF" }}>{r.event.name}</p>
                    <p className="text-[10px]" style={{ color: "#8585A8" }}>
                      {formatEventDate(r.event.event_date, { day: "numeric", month: "short", year: "numeric" })}
                      {r.event.venue_name && ` · ${r.event.venue_name}`}
                    </p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0"
                    style={{
                      background: isOpen ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
                      color: isOpen ? "#10B981" : "#44445A",
                    }}>
                    {isOpen ? "Abierto" : r.event.status === "closed" ? "Cerrado" : r.event.status === "expired" ? "Expirado" : r.event.status}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] mt-2 text-center" style={{ color: "#44445A" }}>
            Solo puedes ver la info de eventos que siguen abiertos
          </p>
        </div>
      )}

      <button onClick={handleLogout}
        className="w-full py-3 rounded-xl text-sm font-semibold"
        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>
        Cerrar sesion
      </button>
    </div>
  );
}
