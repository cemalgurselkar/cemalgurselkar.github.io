export type NavigationItem = {
  href: string;
  label: string;
};

export const navigationItems: readonly NavigationItem[] = [
  { href: "/projects", label: "Work" },
  { href: "/resume", label: "Résumé" },
  { href: "/contact", label: "Contact" },
];
