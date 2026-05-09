"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  Footprints,
  PersonStanding,
  Scale,
  Trophy,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "General", icon: Trophy },
  { href: "/steps", label: "Steps", icon: Footprints },
  { href: "/running", label: "Running", icon: PersonStanding },
  { href: "/weight", label: "Weight", icon: Scale },
  { href: "/gym", label: "Gym", icon: Dumbbell },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/85 backdrop-blur md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-6">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
                  active
                    ? "text-gold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]")} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
