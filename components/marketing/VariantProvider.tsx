"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { Variant, VariantContent } from "@/lib/landing/variant";
import { CONTENT } from "@/lib/landing/variant";

type VariantContextValue = {
  variant: Variant;
  content: VariantContent;
};

const VariantContext = createContext<VariantContextValue | null>(null);

export function VariantProvider({
  variant,
  children,
}: {
  variant: Variant;
  children: ReactNode;
}) {
  // El bundle aplica data-variant a <html> y <body>; este repo además
  // necesita aplicarlo al .app-root (que es el contenedor real de scroll).
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.querySelector(".app-root") as HTMLElement | null;
    html.setAttribute("data-variant", variant);
    body.setAttribute("data-variant", variant);
    root?.setAttribute("data-variant", variant);
  }, [variant]);

  return (
    <VariantContext.Provider value={{ variant, content: CONTENT[variant] }}>
      {children}
    </VariantContext.Provider>
  );
}

export function useVariant(): VariantContextValue {
  const ctx = useContext(VariantContext);
  if (!ctx) {
    return { variant: "general", content: CONTENT.general };
  }
  return ctx;
}
