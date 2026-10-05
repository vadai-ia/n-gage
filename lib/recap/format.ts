// Formateo determinístico (misma salida en server y client → sin hydration mismatch).
// Los eventos operan en México, así que las horas se muestran en hora del centro.
const TZ = "America/Mexico_City";
const LOCALE = "es-MX";

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(LOCALE, { hour: "numeric", minute: "2-digit", timeZone: TZ });
}

export function formatDayTime(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE, {
    weekday: "short", hour: "numeric", minute: "2-digit", timeZone: TZ,
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString(LOCALE);
}

export function plural(n: number, one: string, many: string): string {
  return `${formatNumber(n)} ${n === 1 ? one : many}`;
}

/** Spans of activity: "3 h 20 min" */
export function formatSpan(fromIso: string, toIso: string): string {
  const min = Math.max(0, Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

export function formatBucketLabel(iso: string, bucketMinutes: number): string {
  return bucketMinutes >= 1440
    ? new Date(iso).toLocaleDateString(LOCALE, { day: "numeric", month: "short", timeZone: TZ })
    : bucketMinutes >= 720 ? formatDayTime(iso) : formatTime(iso);
}
