"use client";

/**
 * VariantProvider — Aplica `data-variant` al <body>, expone el variant via Context.
 *
 * Cada landing page (general, /bodas, /eventos) wrappea su árbol con
 * <VariantProvider variant="..."> y los componentes hijos consumen useVariant()
 * para obtener el copy + content + tokens correspondientes.
 */

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
  // Aplica data-variant al <body> para que los tokens CSS scopeados respondan.
  useEffect(() => {
    const body = document.body;
    if (!body) return;
    const prev = body.getAttribute("data-variant");
    body.setAttribute("data-variant", variant);
    return () => {
      // No limpiamos al unmount para evitar flash al navegar entre rutas;
      // el siguiente provider sobrescribirá el atributo.
      if (prev) body.setAttribute("data-variant", prev);
    };
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
    // Fallback graceful: si por alguna razón un componente se usa fuera del provider,
    // asumimos "general". Mejor que crashear en producción.
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("[useVariant] usado fuera de VariantProvider, usando general como fallback.");
    }
    return { variant: "general", content: CONTENT.general };
  }
  return ctx;
}
