export const NAV_ITEMS = [
  { href: "/", label: "Accueil" },
  { href: "/planning", label: "Planning" },
  { href: "/plantes", label: "Plantes" },
  { href: "/pieces", label: "Pièces" },
  { href: "/especes", label: "Espèces" },
  { href: "/diagnostic", label: "Diagnostic" },
] as const;

export type NavHref = (typeof NAV_ITEMS)[number]["href"];

// "/" only matches itself; other entries also match their sub-pages (/plantes/abc).
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
