"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { navigationItems } from "@/data/navigation";

// Rationale: The compact menu keeps every primary destination keyboard-reachable without crowding narrow screens.
export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        aria-controls="mobile-navigation"
        aria-expanded={isOpen}
        className="flex min-h-11 min-w-11 items-center justify-center border border-hairline bg-transparent text-sm font-semibold text-primary transition-colors duration-150 hover:border-hairline-strong"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {isOpen ? "Close" : "Menu"}
      </button>

      <nav
        aria-label="Mobile navigation"
        className="absolute inset-x-0 top-full border-b border-hairline bg-canvas px-[var(--gutter)] pb-5"
        hidden={!isOpen}
        id="mobile-navigation"
      >
        <ul className="divide-y divide-hairline border-t border-hairline">
          {navigationItems.map((item, index) => (
            <li key={item.href}>
              <Link
                autoFocus={index === 0}
                className="flex min-h-14 items-center justify-between text-base font-medium text-primary"
                href={item.href}
                onClick={() => setIsOpen(false)}
                prefetch={item.href === "/projects"}
              >
                {item.label}
                <span aria-hidden="true" className="font-mono text-faint">
                  0{index + 1}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
