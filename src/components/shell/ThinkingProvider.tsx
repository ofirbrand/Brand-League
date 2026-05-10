"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";

import { ThinkingOverlay } from "./ThinkingOverlay";

type ThinkingContextValue = {
  show: () => void;
  hide: () => void;
};

const ThinkingContext = createContext<ThinkingContextValue | null>(null);

const SHOW_GRACE_MS = 200;
const SAFETY_TIMEOUT_MS = 8000;

// External store — keeps overlay visibility outside React state so
// effects, document listeners, and timers can mutate it without
// triggering setState-in-effect anti-patterns.
function createThinkingStore() {
  let visible = false;
  const listeners = new Set<() => void>();
  let graceTimer: ReturnType<typeof setTimeout> | null = null;
  let safetyTimer: ReturnType<typeof setTimeout> | null = null;

  const emit = () => listeners.forEach((l) => l());

  const clearTimers = () => {
    if (graceTimer) {
      clearTimeout(graceTimer);
      graceTimer = null;
    }
    if (safetyTimer) {
      clearTimeout(safetyTimer);
      safetyTimer = null;
    }
  };

  const setVisible = (next: boolean) => {
    if (visible === next) return;
    visible = next;
    emit();
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return visible;
    },
    getServerSnapshot() {
      return false;
    },
    show() {
      clearTimers();
      graceTimer = setTimeout(() => {
        setVisible(true);
        safetyTimer = setTimeout(() => setVisible(false), SAFETY_TIMEOUT_MS);
      }, SHOW_GRACE_MS);
    },
    hide() {
      clearTimers();
      setVisible(false);
    },
  };
}

const store = createThinkingStore();

export function ThinkingProvider({ children }: { children: React.ReactNode }) {
  const visible = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const pathname = usePathname();

  const show = useCallback(() => store.show(), []);
  const hide = useCallback(() => store.hide(), []);

  // Auto-hide whenever the route changes. Uses external store so this
  // does not trigger a setState-in-effect cascade — React just re-runs
  // its subscription on the next emit.
  useEffect(() => {
    store.hide();
  }, [pathname]);

  // Capture-phase listener: detects clicks on links and submit buttons.
  // Passive — never calls preventDefault/stopPropagation, so it cannot
  // interfere with the underlying click behavior or add latency.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target || typeof target.closest !== "function") return;

      const el = target.closest<HTMLElement>(
        'a[href], button[type="submit"], [data-thinking="true"]',
      );
      if (!el) return;

      // Explicit opt-out (UI primitives like popover/calendar triggers can set this).
      if (el.getAttribute("data-thinking") === "false") return;
      if (el.closest('[data-thinking="false"]')) return;

      // Anchors: skip new-tab / download / hash / external behaviors.
      if (el.tagName === "A") {
        const a = el as HTMLAnchorElement;
        if (a.target && a.target !== "" && a.target !== "_self") return;
        if (a.hasAttribute("download")) return;
        const href = a.getAttribute("href") ?? "";
        if (
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        )
          return;
      }

      store.show();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Hide when the tab is hidden — defensive cleanup.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") store.hide();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <ThinkingContext.Provider value={value}>
      {children}
      <ThinkingOverlay visible={visible} />
    </ThinkingContext.Provider>
  );
}

export function useThinking(): ThinkingContextValue {
  const ctx = useContext(ThinkingContext);
  if (!ctx) {
    // Safe no-op fallback so consumers never crash if used outside the provider.
    return { show: () => {}, hide: () => {} };
  }
  return ctx;
}
