"use client";

import type { RecapTeamStats } from "@/lib/recap/types";
import { plural } from "@/lib/recap/format";

export default function TeamsBattle({ teams }: { teams: RecapTeamStats }) {
  const total = Math.max(1, teams.bride + teams.groom);
  const bridePct = Math.round((teams.bride / total) * 100);

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-semibold">
        <span style={{ color: "#FF6B9D" }}>Team Novia · {teams.bride}</span>
        <span style={{ color: "#5B9BFF" }}>{teams.groom} · Team Novio</span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full" role="img" aria-label={`Team Novia ${teams.bride} personas, Team Novio ${teams.groom} personas`}>
        <span style={{ width: `${bridePct}%`, background: "linear-gradient(90deg, #FF2D78, #FF6B9D)" }} />
        <span style={{ width: `${100 - bridePct}%`, background: "linear-gradient(90deg, #5B9BFF, #1A6EFF)" }} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Entre Team Novia", value: teams.brideMatches, color: "#FF6B9D" },
          { label: "Novia × Novio", value: teams.crossMatches, color: "#B57BFF" },
          { label: "Entre Team Novio", value: teams.groomMatches, color: "#5B9BFF" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl px-2 py-3" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="font-mono text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] leading-tight" style={{ color: "var(--fg-3)" }}>{s.label}<br />matches</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--fg-2)" }}>
        Team Novia mandó {plural(teams.brideLikesToGroom, "like", "likes")} a Team Novio, y Team Novio
        respondió con {plural(teams.groomLikesToBride, "like", "likes")}.
        {teams.crossMatches > 0
          ? ` Las familias ya se están mezclando: ${plural(teams.crossMatches, "match cruzado", "matches cruzados")}.`
          : ""}
      </p>
    </div>
  );
}
