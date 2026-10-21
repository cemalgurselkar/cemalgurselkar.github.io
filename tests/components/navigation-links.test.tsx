import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NavigationLinks } from "@/components/layout/navigation-links";

const usePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

describe("NavigationLinks", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/projects/astrarag");
  });

  it("marks the current section without hiding other destinations", () => {
    render(<NavigationLinks />);

    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Résumé" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: "Contact" })).toBeVisible();
  });
});
