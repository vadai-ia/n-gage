"use client";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type UtmParams = Partial<Record<typeof UTM_KEYS[number], string>>;

const STORAGE_KEY = "ngage_utm_v1";

export function captureUtmFromUrl(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const captured: UtmParams = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) captured[k] = v.slice(0, 120);
    }
    if (Object.keys(captured).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
    }
    return captured;
  } catch {
    return {};
  }
}

export function readStoredUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}
