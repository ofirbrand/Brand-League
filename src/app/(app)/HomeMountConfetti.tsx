"use client";

import { useEffect } from "react";
import { celebrate } from "@/lib/confetti";

/** Subtle confetti when the user first lands on home each session. */
export function HomeMountConfetti() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const KEY = "bsl_home_confetti_session";
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");
    const t = setTimeout(() => celebrate("subtle"), 250);
    return () => clearTimeout(t);
  }, []);
  return null;
}
