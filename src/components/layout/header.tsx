import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { NavigationLinks } from "@/components/layout/navigation-links";

// Rationale: A quiet persistent header keeps the work, résumé, and contact paths available without competing with project content.
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-canvas/85 backdrop-blur-xl">
      <div className="flex h-18 w-full items-center justify-between px-[var(--gutter)]">
        <Link
          aria-label="Cemal Gürsel Kar — home"
          className="group inline-flex min-h-11 items-center gap-3 font-semibold tracking-[-0.02em]"
          href="/"
        >
          <span
            aria-hidden="true"
            className="size-2 bg-accent transition-transform duration-200 group-hover:rotate-45"
          />
          <span>Cemal Gürsel Kar</span>
        </Link>

        <NavigationLinks className="hidden md:block" />
        <MobileNav />
      </div>
    </header>
  );
}
