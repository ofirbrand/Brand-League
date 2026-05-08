"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "bsl_install_dismissed_at";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Registers the service worker and shows a custom Install banner when the
 * browser fires `beforeinstallprompt`. Hidden if already installed
 * (display-mode: standalone) or recently dismissed.
 */
export function PwaBootstrap() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // ignore — SW is best-effort
      });
    }

    const standalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    if (standalone) return;

    const dismissed = Number(localStorage.getItem(DISMISSED_KEY) || 0);
    if (dismissed && Date.now() - dismissed < DISMISS_TTL_MS) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !prompt) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-40",
        "md:bottom-6 md:left-auto md:right-6 md:max-w-sm",
        "rounded-2xl border bg-card/95 backdrop-blur p-4 shadow-2xl",
      )}
    >
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          localStorage.setItem(DISMISSED_KEY, String(Date.now()));
          setVisible(false);
        }}
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-accent"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="text-3xl">🏆</div>
        <div className="flex-1">
          <div className="text-sm font-bold">Install Brand Sport League</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Get a native-feeling app on your home screen.
          </p>
          <button
            type="button"
            onClick={async () => {
              await prompt.prompt();
              await prompt.userChoice;
              setVisible(false);
              localStorage.setItem(DISMISSED_KEY, String(Date.now()));
            }}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-navy-deep hover:bg-gold/90"
          >
            <Download className="h-3.5 w-3.5" />
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
