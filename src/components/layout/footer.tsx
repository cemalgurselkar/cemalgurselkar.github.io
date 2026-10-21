import Link from "next/link";

import { navigationItems } from "@/data/navigation";
import { profile } from "@/data/profile";

// Rationale: The footer closes with the same identity, routes, and contact paths so visitors never have to scroll back to act.
export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="site-container grid gap-8 py-10 md:grid-cols-[1.2fr_auto_auto] md:items-start">
        <div>
          <p className="text-sm font-semibold text-primary">{profile.name}</p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-faint">
            {profile.focus} · {profile.location}
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-secondary">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  className="transition-colors duration-150 hover:text-accent-strong"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a
            className="text-secondary transition-colors duration-150 hover:text-accent-strong"
            href={profile.github}
            rel="noreferrer"
            target="_blank"
          >
            GitHub <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a
            className="text-secondary transition-colors duration-150 hover:text-accent-strong"
            href={`mailto:${profile.email}`}
          >
            Email
          </a>
        </div>
      </div>
      <div className="site-container flex flex-col gap-2 border-t border-hairline py-5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>Designed around evidence, systems, and honest constraints.</p>
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
      </div>
    </footer>
  );
}
