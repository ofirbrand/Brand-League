/**
 * Map Supabase / Postgres auth errors to user-friendly messages.
 * The whitelist trigger raises 'EMAIL_NOT_WHITELISTED'; the profile autocreate
 * trigger raises 'PROFILE_FIELDS_REQUIRED' if metadata is missing.
 */

export const STEPS_PAST_DAY_LOCKED_MESSAGE =
  "Caught red-handed! 🕵️ This day's already logged.\nIf you're innocent, take it up with Ofir — head of the cheating department and supreme leader of this app.";

export function authErrorMessage(message: string | undefined): string {
  if (!message) return "Something went wrong — try again.";
  const m = message.toUpperCase();
  if (m.includes("STEPS_PAST_DAY_LOCKED")) {
    return STEPS_PAST_DAY_LOCKED_MESSAGE;
  }
  if (m.includes("EMAIL_NOT_WHITELISTED")) {
    return "This email isn't on the family list yet — ask Ofir to add you.";
  }
  if (m.includes("EMAIL_REQUIRED")) {
    return "Email is required.";
  }
  if (m.includes("PROFILE_FIELDS_REQUIRED")) {
    return "Profile is incomplete — please re-fill the signup form.";
  }
  if (m.includes("BASELINE_WEIGHT_ADMIN_ONLY")) {
    return "Only the admin can change your baseline weight. Ask Ofir.";
  }
  if (m.includes("ADMIN_FLAG_ADMIN_ONLY")) {
    return "Only an existing admin can grant admin access.";
  }
  if (m.includes("DUPLICATE KEY") && m.includes("PROFILES_NICKNAME_LOWER_IDX")) {
    return "That nickname is already taken — pick another.";
  }
  if (m.includes("INVALID LOGIN CREDENTIALS")) {
    return "Email or password is incorrect.";
  }
  if (m.includes("USER ALREADY REGISTERED")) {
    return "An account with this email already exists. Try logging in.";
  }
  if (m.includes("EMAIL NOT CONFIRMED")) {
    return "Please confirm your email first — check your inbox.";
  }
  return message;
}
