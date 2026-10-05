"use client";

import type { RecapPerson } from "@/lib/recap/types";
import { recapImage } from "@/lib/recap/images";

const RING_BY_GENDER: Record<string, string> = {
  female: "#FF2D78",
  male: "#1A6EFF",
  non_binary: "#7B2FBE",
  prefer_not_say: "#8585A8",
};

type Props = {
  person: RecapPerson | undefined;
  size?: number;
  ring?: boolean;
  className?: string;
};

export default function PersonAvatar({ person, size = 40, ring = false, className = "" }: Props) {
  const initial = person?.name.charAt(0).toUpperCase() ?? "?";
  const ringColor = person ? RING_BY_GENDER[person.gender] ?? "#8585A8" : "#8585A8";
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-bold ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: "linear-gradient(135deg, rgba(255,45,120,0.35), rgba(26,110,255,0.35))",
        color: "#F0F0FF",
        boxShadow: ring ? `0 0 0 2px #07070F, 0 0 0 ${size > 56 ? 4 : 3}px ${ringColor}` : undefined,
      }}
    >
      {person?.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recapImage.avatar(person.photo)}
          alt={person.name}
          loading="lazy"
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-label={person?.name}>{initial}</span>
      )}
    </span>
  );
}
