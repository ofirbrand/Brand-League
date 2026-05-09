"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for PWA support.
 * The custom install banner has been removed; the browser's native
 * install affordance (address bar / menu) remains available.
 */
export function PwaBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // ignore — SW is best-effort
      });
    }
  }, []);

  return null;
}
