"use client";

import {
  Activity, Camera, ChevronRight, Hash, Heart, HeartHandshake, MessageCircle,
  Star, Tags, Users, Utensils, type LucideIcon,
} from "lucide-react";
import { useRecap } from "@/lib/contexts/RecapContext";
import { formatEventDate } from "@/lib/utils/date";
import { formatSpan, formatTime, plural } from "@/lib/recap/format";
import { recapImage } from "@/lib/recap/images";
import type { RecapTab } from "./RecapBottomNav";
import RecapCard from "./RecapCard";
import CountUp from "./CountUp";
import ActivityTimeline from "./ActivityTimeline";
import TeamsBattle from "./TeamsBattle";
import AwardCard from "./AwardCard";

const GENDER_LABELS: Record<string, { label: string; color: string }> = {
  female: { label: "Mujeres", color: "#FF2D78" },
  male: { label: "Hombres", color: "#1A6EFF" },
  non_binary: { label: "No binario", color: "#7B2FBE" },
  prefer_not_say: { label: "Sin especificar", color: "#8585A8" },
};

export default function RecapSummaryTab({ onNavigate }: { onNavigate: (tab: RecapTab) => void }) {
  const { data } = useRecap();
  const { event, summary } = data;
  const venue = [event.venue, event.city].filter(Boolean).join(" · ");

  const stats: { label: string; value: number; icon: LucideIcon; color: string; tab?: RecapTab }[] = [
    { label: "Invitados conectados", value: summary.participants, icon: Users, color: "#B8B8D0", tab: "red" },
    { label: "Likes", value: summary.likes, icon: Heart, color: "#FF2D78", tab: "red" },
    { label: "Super likes", value: summary.superLikes, icon: Star, color: "#FFB800", tab: "premios" },
    { label: "Matches", value: summary.matches, icon: HeartHandshake, color: "#FF6B9D", tab: "matches" },
    { label: "Mensajes", value: summary.messages, icon: MessageCircle, color: "#5B9BFF", tab: "matches" },
    { label: "Fotos", value: summary.photos, icon: Camera, color: "#B57BFF", tab: "fotos" },
  ];

  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl" style={{ minHeight: 300 }}>
        {event.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recapImage.hero(event.cover)} alt={`Portada de ${event.name}`} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: "var(--gradient-brand)" }} aria-hidden />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #07070F 0%, rgba(7,7,15,0.6) 45%, rgba(7,7,15,0.05) 85%)" }} aria-hidden />
        <div className="relative flex min-h-[300px] flex-col justify-end p-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em]" style={{ color: "#FF6B9D" }}>Así se vivió</p>
          <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">{event.name}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--fg-2)" }}>
            {formatEventDate(event.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {venue ? ` · ${venue}` : ""}
          </p>
        </div>
      </section>

      {event.gallery.length > 1 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Fotos del evento">
          {event.gallery.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={recapImage.thumb(url)} alt={`Foto del evento ${i + 1}`} loading="lazy" className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
          ))}
        </div>
      )}

      {summary.participants === 0 ? (
        <RecapCard>
          <div className="py-8 text-center">
            <Users size={36} className="mx-auto mb-3" style={{ color: "var(--fg-3)" }} aria-hidden />
            <p className="font-display text-lg font-bold">Todavía no hay actividad</p>
            <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>
              En cuanto los invitados escaneen el QR y empiecen a conectar, aquí vas a ver todo lo que pasa.
            </p>
          </div>
        </RecapCard>
      ) : (
        <>
          {/* La historia en una frase */}
          <RecapCard>
            <p className="font-display text-xl font-semibold leading-snug md:text-2xl">
              {summary.firstActivityAt && summary.lastActivityAt
                ? `En ${formatSpan(summary.firstActivityAt, summary.lastActivityAt)}, `
                : ""}
              <span style={{ color: "#FF6B9D" }}>{plural(summary.participants, "invitado", "invitados")}</span> se repartieron{" "}
              <span style={{ color: "#FF2D78" }}>{plural(summary.likes, "like", "likes")}</span> y nacieron{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "var(--gradient-brand)" }}>
                {plural(summary.matches, "match", "matches")}
              </span>.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip>{summary.matchedPercent}% hizo al menos un match</Chip>
              <Chip>{summary.reciprocityPercent}% de los likes fue correspondido</Chip>
              {summary.avgRating !== null && <Chip>Calificación de la experiencia: {summary.avgRating} / 5 ({summary.ratingsCount})</Chip>}
            </div>
          </RecapCard>

          {/* Números */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {stats.map(({ label, value, icon: Icon, color, tab }) => (
              <button
                key={label}
                type="button"
                onClick={() => tab && onNavigate(tab)}
                className="group rounded-3xl p-4 text-left transition-transform active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
                style={{ background: "rgba(15,15,26,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Icon size={20} style={{ color }} aria-hidden />
                <p className="mt-3 font-mono text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  <CountUp value={value} />
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium" style={{ color: "var(--fg-3)" }}>
                  {label}
                  <ChevronRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </p>
              </button>
            ))}
          </div>

          {/* Timeline */}
          {data.timeline.buckets.length > 1 && (
            <RecapCard
              title="El pulso de la noche"
              subtitle={data.timeline.peak
                ? `El momento más intenso fue a las ${formatTime(data.timeline.peak.t)}`
                : "Actividad durante el evento"}
              icon={Activity}
            >
              <ActivityTimeline {...data.timeline} />
            </RecapCard>
          )}

          {/* Premios destacados */}
          {data.awards.length > 0 && (
            <RecapCard
              title="Los premios de la noche"
              icon={Star}
              accent="#FFB800"
              action={
                <button
                  type="button"
                  onClick={() => onNavigate("premios")}
                  className="flex min-h-[44px] items-center gap-1 rounded-full px-3 text-sm font-semibold cursor-pointer hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
                  style={{ color: "#FF6B9D" }}
                >
                  Ver todos <ChevronRight size={16} aria-hidden />
                </button>
              }
            >
              <div className="grid gap-3 md:grid-cols-3">
                {data.awards.slice(0, 3).map((a) => <AwardCard key={a.id} award={a} compact />)}
              </div>
            </RecapCard>
          )}

          {/* Team Novia vs Team Novio */}
          {data.teams && (data.teams.bride > 0 || data.teams.groom > 0) && (
            <RecapCard title="Team Novia vs Team Novio" subtitle="¿Quién ligó más?" icon={HeartHandshake}>
              <TeamsBattle teams={data.teams} />
            </RecapCard>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Mesas */}
            {data.tables.length > 0 && (
              <RecapCard title="Las mesas más ligadoras" icon={Utensils} accent="#5B9BFF">
                <ol className="flex flex-col gap-2">
                  {data.tables.map((t, i) => (
                    <li key={t.table} className="flex items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <span className="w-5 font-mono text-sm font-bold" style={{ color: i === 0 ? "#FFB800" : "var(--fg-3)" }}>{i + 1}</span>
                      <Hash size={14} style={{ color: "var(--fg-3)" }} aria-hidden />
                      <span className="flex-1 text-sm font-semibold">Mesa {t.table}</span>
                      <span className="text-sm" style={{ color: "var(--fg-2)" }}>{plural(t.matches, "match", "matches")}</span>
                    </li>
                  ))}
                </ol>
              </RecapCard>
            )}

            {/* Intereses */}
            {data.interests.length > 0 && (
              <RecapCard title="Lo que más tenían en común" icon={Tags} accent="#B57BFF">
                <ul className="flex flex-wrap gap-2">
                  {data.interests.map((it, i) => (
                    <li
                      key={it.label}
                      className="rounded-full px-3 py-1.5 text-sm font-medium"
                      style={{
                        background: i < 3 ? "rgba(123,47,190,0.22)" : "rgba(255,255,255,0.05)",
                        color: i < 3 ? "#E3CCFF" : "var(--fg-2)",
                      }}
                    >
                      {it.label} <span className="font-mono text-xs opacity-70">{it.count}</span>
                    </li>
                  ))}
                </ul>
              </RecapCard>
            )}
          </div>

          {/* Distribución */}
          <RecapCard title="Quiénes jugaron" icon={Users} accent="#B8B8D0">
            <div className="flex h-3 overflow-hidden rounded-full" role="img" aria-label={Object.entries(data.genders).map(([g, n]) => `${GENDER_LABELS[g]?.label ?? g}: ${n}`).join(", ")}>
              {Object.entries(data.genders).map(([g, n]) => (
                <span key={g} style={{ width: `${(n / summary.participants) * 100}%`, background: GENDER_LABELS[g]?.color ?? "#8585A8" }} />
              ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {Object.entries(data.genders).map(([g, n]) => (
                <li key={g} className="flex items-center gap-2 text-sm" style={{ color: "var(--fg-2)" }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: GENDER_LABELS[g]?.color ?? "#8585A8" }} aria-hidden />
                  {GENDER_LABELS[g]?.label ?? g} <span className="font-mono">{n}</span>
                </li>
              ))}
            </ul>
          </RecapCard>
        </>
      )}

      <p className="pt-2 text-center text-xs" style={{ color: "var(--fg-3)" }}>
        Resumen generado por N&apos;GAGE · Contiene nombres y fotos de invitados, compártelo con cuidado.
      </p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "var(--fg-2)" }}>
      {children}
    </span>
  );
}
