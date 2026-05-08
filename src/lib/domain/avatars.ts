/**
 * Avatar emoji palette. 30 family-friendly + sports emojis.
 * Default for new users is 🏃.
 */
export const AVATAR_EMOJIS = [
  "🏃", "🏃‍♀️", "👟", "🚴", "🏋️", "🧘",
  "⚽", "🏀", "🎾", "🏐", "🏈", "⚾",
  "🥇", "🏆", "🦁", "🐯", "🐻", "🦊",
  "🐺", "🦅", "🐲", "🦄", "🐝", "🦋",
  "⚡", "🔥", "🌟", "💪", "🚀", "🎯",
] as const;

export type AvatarEmoji = (typeof AVATAR_EMOJIS)[number];

export const DEFAULT_AVATAR: AvatarEmoji = "🏃";
