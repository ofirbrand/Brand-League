"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function SignOutButton() {
  const router = useRouter();

  async function onClick() {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Sign-out failed — try again.");
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="gap-1.5 text-muted-foreground hover:text-destructive"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
