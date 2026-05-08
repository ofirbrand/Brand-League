"use client";

import confetti from "canvas-confetti";

/**
 * Subtle confetti burst centered above the user's pointer / FAB area. Used
 * on home-page mount and on podium-move events.
 */
export function celebrate(intensity: "subtle" | "podium" = "subtle") {
  if (typeof window === "undefined") return;

  const palette = ["#FFD700", "#22C55E", "#EF4444", "#C0C0C0", "#CD7F32"];

  if (intensity === "subtle") {
    void confetti({
      particleCount: 60,
      spread: 70,
      startVelocity: 35,
      origin: { x: 0.5, y: 0.45 },
      colors: palette,
      scalar: 0.9,
      ticks: 200,
    });
    return;
  }

  // Podium-move: bigger, two bursts.
  void confetti({
    particleCount: 120,
    spread: 90,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.4 },
    colors: palette,
    scalar: 1.1,
    ticks: 280,
  });
  setTimeout(() => {
    void confetti({
      particleCount: 80,
      spread: 110,
      startVelocity: 35,
      origin: { x: 0.5, y: 0.55 },
      colors: palette,
      ticks: 220,
    });
  }, 220);
}
