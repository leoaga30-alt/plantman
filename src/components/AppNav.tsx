"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  DoorOpen,
  Droplets,
  Sprout,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { NAV_ITEMS, isActive, type NavHref } from "./nav-items";

const ICONS: Record<NavHref, LucideIcon> = {
  "/": Droplets,
  "/planning": CalendarDays,
  "/plantes": Sprout,
  "/pieces": DoorOpen,
  "/especes": BookOpen,
  "/diagnostic": Stethoscope,
};

// Bottom tab bar on phones (primary use), top bar from md up.
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b"
    >
      <ul className="mx-auto flex max-w-2xl md:gap-1 md:px-4">
        {NAV_ITEMS.map(({ href, label }) => {
          const Icon = ICONS[href];
          const active = isActive(pathname, href);

          return (
            <li key={href} className="flex-1 md:flex-none">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 touch-manipulation flex-col items-center justify-center gap-0.5 px-0.5 text-xs tracking-tight outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring md:min-h-12 md:flex-row md:gap-2 md:rounded-lg md:px-3 md:text-sm ${
                  active
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
