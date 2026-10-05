"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { RecapData } from "@/lib/recap/types";
import { RecapContext } from "@/lib/contexts/RecapContext";
import { unlockRecap } from "@/app/(public)/recuerdos/[slug]/actions";
import RecapBottomNav, { type RecapTab, RECAP_TABS } from "./RecapBottomNav";
import RecapTopBar from "./RecapTopBar";
import RecapSummaryTab from "./RecapSummaryTab";
import RecapMatchesTab from "./RecapMatchesTab";
import RecapNetworkTab from "./RecapNetworkTab";
import RecapAwardsTab from "./RecapAwardsTab";
import RecapPhotosTab from "./RecapPhotosTab";
import PersonSheet from "./PersonSheet";
import MatchSheet from "./MatchSheet";

const LIVE_REFRESH_MS = 60_000;

type Props = { data: RecapData; persistCode: string | null };
type Selection = { kind: "person" | "match"; id: string } | null;

export default function RecapExperience({ data, persistCode }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState<RecapTab>("resumen");
  const [selection, setSelection] = useState<Selection>(null);
  const isLive = data.event.status === "active";

  // Si entró con ?code=, guarda la cookie y limpia el código de la URL
  useEffect(() => {
    if (!persistCode) return;
    unlockRecap(data.event.slug, persistCode).finally(() => {
      window.history.replaceState(null, "", `/recuerdos/${data.event.slug}${window.location.hash}`);
    });
  }, [persistCode, data.event.slug]);

  // Pestaña desde el hash (#fotos) para poder compartir secciones
  useEffect(() => {
    const fromHash = window.location.hash.replace("#", "") as RecapTab;
    if (RECAP_TABS.some((t) => t.id === fromHash)) setTab(fromHash);
  }, []);

  // Evento en curso: el resumen se actualiza solo
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => router.refresh(), LIVE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [isLive, router]);

  const changeTab = useCallback((next: RecapTab) => {
    setTab(next);
    window.history.replaceState(null, "", `#${next}`);
    document.querySelector(".app-root")?.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [reduceMotion]);

  const openPerson = useCallback((id: string) => setSelection({ kind: "person", id }), []);
  const openMatch = useCallback((id: string) => setSelection({ kind: "match", id }), []);
  const closeSheet = useCallback(() => setSelection(null), []);

  const ctx = useMemo(() => ({
    data,
    personById: new Map(data.people.map((p) => [p.id, p])),
    matchById: new Map(data.matches.map((m) => [m.id, m])),
    openPerson,
    openMatch,
  }), [data, openPerson, openMatch]);

  return (
    <RecapContext.Provider value={ctx}>
      <div className="min-h-dvh" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
        <RecapTopBar isLive={isLive} />

        <main className="mx-auto w-full max-w-3xl px-4 pb-32">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {tab === "resumen" && <RecapSummaryTab onNavigate={changeTab} />}
              {tab === "matches" && <RecapMatchesTab />}
              {tab === "red" && <RecapNetworkTab />}
              {tab === "premios" && <RecapAwardsTab />}
              {tab === "fotos" && <RecapPhotosTab />}
            </motion.div>
          </AnimatePresence>
        </main>

        <RecapBottomNav active={tab} onChange={changeTab} counts={{ matches: data.matches.length, fotos: data.photos.length }} />

        <PersonSheet personId={selection?.kind === "person" ? selection.id : null} onClose={closeSheet} />
        <MatchSheet matchId={selection?.kind === "match" ? selection.id : null} onClose={closeSheet} />
      </div>
    </RecapContext.Provider>
  );
}
