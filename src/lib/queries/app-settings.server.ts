import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CompetitionEndSetting = {
  label: string;
  endAtIso: string;
};

/** Fallback used if the row hasn't been seeded yet. Aug 10, 2026 20:00 IDT. */
const FALLBACK_END_AT_ISO = "2026-08-10T17:00:00.000Z";
const FALLBACK_LABEL = "End of Competition";

/**
 * Reads the `competition_end_at` row from public.app_settings.
 * Returns a serializable shape suitable for passing to a Client Component.
 */
export async function fetchCompetitionEnd(): Promise<CompetitionEndSetting> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("label, value_timestamptz")
    .eq("key", "competition_end_at")
    .maybeSingle();

  if (error) {
    console.error("[app-settings] competition_end_at", error);
    return { label: FALLBACK_LABEL, endAtIso: FALLBACK_END_AT_ISO };
  }

  if (!data) {
    return { label: FALLBACK_LABEL, endAtIso: FALLBACK_END_AT_ISO };
  }

  return {
    label: data.label ?? FALLBACK_LABEL,
    endAtIso: new Date(data.value_timestamptz).toISOString(),
  };
}
