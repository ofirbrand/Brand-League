"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "General" },
  { href: "/steps", label: "Steps" },
  { href: "/running", label: "Running" },
  { href: "/weight", label: "Weight" },
  { href: "/gym", label: "Gym" },
  { href: "/profile", label: "Profile" },
] as const;

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 hidden border-b bg-background/85 backdrop-blur md:block">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" aria-label="Home">
          <BrandLogo showText />
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-1 text-sm font-medium">
            {TABS.map(({ href, label }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-full px-3 py-1.5 transition-colors",
                      active
                        ? "bg-gold/15 text-gold"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
