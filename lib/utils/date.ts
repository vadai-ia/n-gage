/**
 * event_date is persisted as a date-only column. Prisma rehydrates it as
 * `YYYY-MM-DDT00:00:00.000Z` (UTC midnight). Calling toLocaleDateString in a
 * negative-offset timezone (e.g. CDMX = UTC-6) shifts the displayed date one
 * day backward. Always format event dates in UTC to keep the calendar day stable.
 */
export function formatEventDate(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions,
  locale: string = "es-MX"
): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString(locale, { ...options, timeZone: "UTC" });
}
