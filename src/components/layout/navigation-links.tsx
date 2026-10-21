"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/data/navigation";

type NavigationLinksProps = {
  className?: string;
};

// Rationale: Route-aware labels let visitors understand their location without adding a second navigation system.
export function NavigationLinks({ className }: NavigationLinksProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className={className}>
      <ul className="flex items-center gap-1">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className="relative flex min-h-11 items-center px-3 text-sm font-medium text-secondary transition-colors duration-150 after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-200 hover:text-primary aria-[current=page]:text-primary aria-[current=page]:after:scale-x-100"
                href={item.href}
                prefetch={item.href === "/projects"}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
