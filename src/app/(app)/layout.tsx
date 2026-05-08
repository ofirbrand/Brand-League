import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/shell/TopNav";
import { BottomNav } from "@/components/shell/BottomNav";
import { Fab } from "@/components/shell/Fab";
import { LogSheet } from "@/components/log/LogSheet";
import { LogSheetProvider } from "@/components/log/LogSheetContext";
import { PwaBootstrap } from "@/components/shell/PwaBootstrap";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <LogSheetProvider>
      <TopNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+96px)] md:pb-12">
        {children}
      </main>
      <BottomNav />
      <Fab />
      <LogSheet />
      <PwaBootstrap />
    </LogSheetProvider>
  );
}
