"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useLogSheet, type LogType } from "./LogSheetContext";
import { LogTypeCards } from "./LogTypeCards";
import { LogForm } from "./LogForm";

export function LogSheet() {
  const { isOpen, type, open, close } = useLogSheet();

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(next) => (next ? open() : close())}
    >
      <DrawerContent className="max-h-[92svh]">
        {/*
         * Re-mount the inner panel each time the sheet opens (or the requested
         * type changes) so we don't need a useEffect to sync local state.
         */}
        <Inner key={`${isOpen ? "open" : "closed"}:${type ?? "none"}`} initialType={type} onClose={close} />
      </DrawerContent>
    </Drawer>
  );
}

function Inner({
  initialType,
  onClose,
}: {
  initialType: LogType | null;
  onClose: () => void;
}) {
  const [active, setActive] = useState<LogType | null>(initialType);

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <DrawerHeader className="px-0 pt-2">
        <DrawerTitle className="flex items-center gap-2 text-xl font-extrabold">
          <span className="text-gold">+</span> Log activity
        </DrawerTitle>
        <DrawerDescription>
          {active
            ? "Fill in the details — we'll update the leaderboard."
            : "What did you do today?"}
        </DrawerDescription>
      </DrawerHeader>

      {active ? (
        <LogForm
          type={active}
          onChangeType={() => setActive(null)}
          onSubmitted={onClose}
        />
      ) : (
        <LogTypeCards onSelect={setActive} />
      )}
    </div>
  );
}
