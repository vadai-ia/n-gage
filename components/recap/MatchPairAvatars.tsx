"use client";

import { Heart, Star } from "lucide-react";
import type { RecapPerson } from "@/lib/recap/types";
import PersonAvatar from "./PersonAvatar";

type Props = { a: RecapPerson | undefined; b: RecapPerson | undefined; size?: number; superLike?: boolean };

export default function MatchPairAvatars({ a, b, size = 64, superLike = false }: Props) {
  const badge = Math.round(size * 0.42);
  return (
    <div className="relative flex items-center justify-center" style={{ height: size }}>
      <PersonAvatar person={a} size={size} ring className="-mr-3" />
      <PersonAvatar person={b} size={size} ring className="-ml-3" />
      <span
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
        style={{
          width: badge,
          height: badge,
          background: superLike ? "linear-gradient(135deg, #FFB800, #FF6B00)" : "var(--gradient-brand)",
          boxShadow: superLike ? "0 0 18px rgba(255,184,0,0.55)" : "0 0 18px rgba(255,45,120,0.55)",
          border: "2px solid #07070F",
        }}
        aria-hidden
      >
        {superLike
          ? <Star size={badge * 0.5} fill="#fff" color="#fff" />
          : <Heart size={badge * 0.5} fill="#fff" color="#fff" />}
      </span>
    </div>
  );
}
