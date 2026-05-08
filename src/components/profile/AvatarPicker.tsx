"use client";

import { AVATAR_EMOJIS } from "@/lib/domain/avatars";
import { cn } from "@/lib/utils";

type AvatarPickerProps = {
  value: string;
  onChange: (emoji: string) => void;
  className?: string;
};

export function AvatarPicker({ value, onChange, className }: AvatarPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Avatar"
      className={cn(
        "grid grid-cols-6 gap-2 rounded-xl border bg-card/50 p-2",
        className,
      )}
    >
      {AVATAR_EMOJIS.map((emoji) => {
        const selected = value === emoji;
        return (
          <button
            key={emoji}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(emoji)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg text-2xl transition-all",
              "hover:scale-110 hover:bg-accent",
              selected
                ? "scale-110 bg-gold/15 ring-2 ring-gold"
                : "ring-1 ring-transparent",
            )}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}
