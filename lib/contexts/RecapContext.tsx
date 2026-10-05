"use client";

import { createContext, useContext } from "react";
import type { RecapData, RecapMatch, RecapPerson } from "@/lib/recap/types";

export type RecapContextValue = {
  data: RecapData;
  personById: Map<string, RecapPerson>;
  matchById: Map<string, RecapMatch>;
  openPerson: (id: string) => void;
  openMatch: (id: string) => void;
};

export const RecapContext = createContext<RecapContextValue | null>(null);

export function useRecap(): RecapContextValue {
  const ctx = useContext(RecapContext);
  if (!ctx) throw new Error("useRecap must be used inside RecapContext");
  return ctx;
}
