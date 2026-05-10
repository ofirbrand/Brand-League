"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  visible: boolean;
};

export function ThinkingOverlay({ visible }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="thinking-overlay"
          role="status"
          aria-live="polite"
          aria-label="Working on it"
          data-thinking="false"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            initial={{ scale: 0.96, y: 4 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="mx-4 flex w-full max-w-[300px] flex-col items-center gap-3 rounded-2xl border bg-card/95 px-6 py-5 shadow-2xl"
          >
            <div className="flex h-24 w-24 items-center justify-center">
              {!imgFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/runner.gif"
                  alt=""
                  width={96}
                  height={96}
                  decoding="async"
                  loading="eager"
                  onError={() => setImgFailed(true)}
                  className="h-24 w-24 object-contain"
                />
              ) : (
                <RunnerFallback />
              )}
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-gold">
                Working on it…
              </p>
              <p className="text-xs text-muted-foreground">
                as you work to win the competition
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Lightweight CSS fallback when /runner.gif is missing.
// Pure SVG + Tailwind keyframes — zero extra payload.
function RunnerFallback() {
  return (
    <div
      aria-hidden
      className="text-5xl"
      style={{
        animation: "thinkingRunnerBounce 0.7s ease-in-out infinite",
      }}
    >
      🏃
      <style>{`
        @keyframes thinkingRunnerBounce {
          0%, 100% { transform: translateY(0) translateX(-2px); }
          50% { transform: translateY(-6px) translateX(2px); }
        }
      `}</style>
    </div>
  );
}
