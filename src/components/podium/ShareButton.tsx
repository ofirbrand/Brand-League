"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  title: string;
  text: string;
};

/**
 * Web Share API → falls back to copy-to-clipboard. Used on each category
 * page header to send the current podium to WhatsApp / family chats.
 */
export function ShareButton({ title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
      ) {
        await navigator.share({ title, text });
        return;
      }
    } catch {
      // user cancelled — silently fall through
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't share — copy this manually:\n" + text);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="gap-1 text-muted-foreground hover:text-gold"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      <span>Share</span>
    </Button>
  );
}
