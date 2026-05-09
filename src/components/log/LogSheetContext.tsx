"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type LogType = "run" | "walk" | "weight" | "gym";

type LogSheetState = {
  isOpen: boolean;
  type: LogType | null;
  open: (type?: LogType) => void;
  close: () => void;
};

const LogSheetContext = createContext<LogSheetState | null>(null);

export function LogSheetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<LogType | null>(null);

  const open = useCallback((t?: LogType) => {
    setType(t ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setType(null);
  }, []);

  const value = useMemo(
    () => ({ isOpen, type, open, close }),
    [isOpen, type, open, close],
  );

  return (
    <LogSheetContext.Provider value={value}>{children}</LogSheetContext.Provider>
  );
}

export function useLogSheet() {
  const ctx = useContext(LogSheetContext);
  if (!ctx) {
    throw new Error("useLogSheet must be used inside <LogSheetProvider>");
  }
  return ctx;
}
