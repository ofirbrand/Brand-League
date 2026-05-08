import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

export const APP_TIMEZONE = "Asia/Jerusalem" as const;

/**
 * Returns the Sunday that opens the Sun–Sat week containing `d`, expressed
 * in Asia/Jerusalem local time. Output is a YYYY-MM-DD string matching the
 * schema's `log_date` DATE shape.
 */
export function weekStartFor(d: Date | string): string {
  const ref =
    typeof d === "string"
      ? new Date(`${d}T12:00:00Z`) /* avoid TZ flips at the day boundary */
      : d;
  const localized = toZonedTime(ref, APP_TIMEZONE);
  const dow = localized.getDay(); // 0 = Sunday
  localized.setDate(localized.getDate() - dow);
  return format(localized, "yyyy-MM-dd");
}

export function currentWeekStart(): string {
  return weekStartFor(new Date());
}

/** Today in Asia/Jerusalem as YYYY-MM-DD. */
export function todayInJerusalem(): string {
  return formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy-MM-dd");
}

/** Format a YYYY-MM-DD week-start as a friendly "Week of May 4" label. */
export function formatWeekLabel(weekStart: string): string {
  const d = new Date(`${weekStart}T12:00:00Z`);
  return `Week of ${format(d, "MMM d")}`;
}

/** ISO week number (1-53) for a given date — used in share snippets. */
export function isoWeekNumber(d: Date | string = new Date()): number {
  const ref = typeof d === "string" ? new Date(`${d}T12:00:00Z`) : new Date(d);
  const thursday = new Date(
    Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()),
  );
  thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
}
