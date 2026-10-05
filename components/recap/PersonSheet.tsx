"use client";

import { useMemo } from "react";
import { Heart, HeartHandshake, Send, Star } from "lucide-react";
import { useRecap } from "@/lib/contexts/RecapContext";
import { formatTime } from "@/lib/recap/format";
import { recapImage } from "@/lib/recap/images";
import BottomSheet from "./BottomSheet";
import PersonAvatar from "./PersonAvatar";

export default function PersonSheet({ personId, onClose }: { personId: string | null; onClose: () => void }) {
  const { data, personById, openPerson, openMatch } = useRecap();
  const person = personId ? personById.get(personId) : undefined;

  const detail = useMemo(() => {
    if (!person) return null;
    const matches = data.matches.filter((m) => m.a === person.id || m.b === person.id);
    const matchedWith = new Set(matches.map((m) => (m.a === person.id ? m.b : m.a)));
    // Likes sin match (los matches ya se listan aparte)
    const sent = data.likes.filter((l) => l.from === person.id && !matchedWith.has(l.to));
    const received = data.likes.filter((l) => l.to === person.id && !matchedWith.has(l.from));
    const photos = data.photos.filter((p) => p.by === person.id);
    return { matches, sent, received, photos };
  }, [person, data]);

  return (
    <BottomSheet open={!!person} onClose={onClose} title={person?.name ?? ""}>
      {person && detail && (
        <div className="pb-2">
          <div className="flex items-center gap-4 py-3">
            <PersonAvatar person={person} size={84} ring />
            <div className="min-w-0">
              <p className="font-display text-2xl font-bold">{person.name}</p>
              <p className="text-sm" style={{ color: "var(--fg-3)" }}>
                {[person.team, person.table ? `Mesa ${person.table}` : null].filter(Boolean).join(" · ") || "Invitado"}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Matches", value: person.matches, color: "#FF6B9D" },
              { label: "Recibidos", value: person.likesReceived, color: "#FF2D78" },
              { label: "Dados", value: person.likesSent, color: "#B8B8D0" },
              { label: "Super", value: person.superLikesReceived, color: "#FFB800" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col-reverse rounded-2xl py-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                <dt className="text-[11px]" style={{ color: "var(--fg-3)" }}>{s.label}</dt>
                <dd className="font-mono text-xl font-bold" style={{ color: s.color }}>{s.value}</dd>
              </div>
            ))}
          </dl>

          {person.interests.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {person.interests.map((i) => (
                <li key={i} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "var(--fg-2)" }}>{i}</li>
              ))}
            </ul>
          )}

          <Section icon={HeartHandshake} title="Hizo match con" color="#FF6B9D" empty="Sin matches esta vez">
            {detail.matches.map((m) => {
              const other = personById.get(m.a === person.id ? m.b : m.a);
              return (
                <Row key={m.id} onClick={() => openMatch(m.id)} avatar={<PersonAvatar person={other} size={40} />} name={other?.name ?? ""} meta={formatTime(m.at)} superLike={m.superLike} />
              );
            })}
          </Section>

          <Section icon={Heart} title="Le dieron like" color="#FF2D78" empty="Nadie más por aquí">
            {detail.received.map((l) => {
              const other = personById.get(l.from);
              return <Row key={l.from} onClick={() => openPerson(l.from)} avatar={<PersonAvatar person={other} size={40} />} name={other?.name ?? ""} meta={formatTime(l.at)} superLike={l.type === "super_like"} />;
            })}
          </Section>

          <Section icon={Send} title="Le dio like a" color="#B8B8D0" empty="Nadie más por aquí">
            {detail.sent.map((l) => {
              const other = personById.get(l.to);
              return <Row key={l.to} onClick={() => openPerson(l.to)} avatar={<PersonAvatar person={other} size={40} />} name={other?.name ?? ""} meta={formatTime(l.at)} superLike={l.type === "super_like"} />;
            })}
          </Section>

          {detail.photos.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Sus fotos ({detail.photos.length})</p>
              <div className="grid grid-cols-4 gap-1.5">
                {detail.photos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={recapImage.thumb(p.url)} alt={`Foto de ${person.name}`} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}

function Section({ icon: Icon, title, color, empty, children }: { icon: typeof Heart; title: string; color: string; empty: string; children: React.ReactNode[] }) {
  return (
    <div className="mt-6">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        <Icon size={16} style={{ color }} aria-hidden /> {title}
        <span className="font-mono text-xs" style={{ color: "var(--fg-3)" }}>{children.length}</span>
      </p>
      {children.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--fg-3)" }}>{empty}</p>
      ) : (
        <ul className="flex flex-col gap-1">{children}</ul>
      )}
    </div>
  );
}

function Row({ onClick, avatar, name, meta, superLike }: { onClick: () => void; avatar: React.ReactNode; name: string; meta: string; superLike: boolean }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-2 py-1.5 text-left cursor-pointer transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
      >
        {avatar}
        <span className="flex-1 truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{name}</span>
        {superLike && <Star size={14} fill="#FFB800" color="#FFB800" aria-label="Super like" />}
        <span className="font-mono text-xs" style={{ color: "var(--fg-3)" }}>{meta}</span>
      </button>
    </li>
  );
}
