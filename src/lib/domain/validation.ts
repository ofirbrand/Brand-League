import { z } from "zod";
import { todayInJerusalem } from "./week";

/**
 * Single source of truth for log-form validation. Bounds match the SQL
 * CHECKs in 0001_init.sql so failures surface at the form, not the DB.
 */

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, "Date must be YYYY-MM-DD")
  .refine((d) => d <= todayInJerusalem(), "Date can't be in the future");

export const stepLogSchema = z.object({
  log_date: dateSchema,
  steps: z
    .number({ message: "Steps required" })
    .int("Whole number please")
    .min(1, "Steps must be > 0")
    .max(100_000, "That's a lot — max 100,000"),
});

export const runLogSchema = z.object({
  log_date: dateSchema,
  distance_km: z
    .number({ message: "Distance required" })
    .min(0.1, "At least 0.1 km")
    .max(100, "Max 100 km — slow down 😅"),
  duration_min: z
    .number({ message: "Duration required" })
    .int("Whole minutes please")
    .min(1, "At least 1 minute")
    .max(600, "Max 10 hours"),
});

export const weightLogSchema = z.object({
  log_date: dateSchema,
  weight_kg: z
    .number({ message: "Weight required" })
    .min(30, "Below 30 kg seems off")
    .max(300, "Above 300 kg seems off"),
});

export type StepLogInput = z.infer<typeof stepLogSchema>;
export type RunLogInput = z.infer<typeof runLogSchema>;
export type WeightLogInput = z.infer<typeof weightLogSchema>;

/** Profile input used at signup. Re-checked on the server via insert CHECKs. */
export const signupProfileSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "At least 8 characters"),
  full_name: z.string().min(1, "Full name required").max(80),
  nickname: z
    .string()
    .min(2, "Nickname required (≥ 2 chars)")
    .max(40)
    .regex(/^[\p{L}\p{N}_\- ]+$/u, "Letters, numbers, space, _, - only"),
  height_cm: z
    .number({ message: "Height required" })
    .min(50, "Min 50 cm")
    .max(250, "Max 250 cm"),
  baseline_weight_kg: z
    .number({ message: "Weight required" })
    .min(30, "Min 30 kg")
    .max(300, "Max 300 kg"),
  avatar_emoji: z.string().min(1).max(8),
});

export type SignupProfileInput = z.infer<typeof signupProfileSchema>;

export const profileEditSchema = signupProfileSchema
  .pick({ full_name: true, nickname: true, height_cm: true, avatar_emoji: true });

export type ProfileEditInput = z.infer<typeof profileEditSchema>;
