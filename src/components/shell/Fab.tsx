"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogSheet } from "@/components/log/LogSheetContext";

export function Fab() {
  const { open } = useLogSheet();
  return (
    <Button
      type="button"
      onClick={() => open()}
      aria-label="Log activity"
      className="fixed z-30 right-5 bottom-[calc(env(safe-area-inset-bottom)+72px)] md:bottom-6 size-14 rounded-full p-0 bg-gold text-navy hover:bg-gold/90 shadow-[0_8px_30px_-6px_rgba(255,215,0,0.55)]"
    >
      <Plus className="!h-7 !w-7" />
    </Button>
  );
}
