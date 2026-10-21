import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MobileNav } from "@/components/layout/mobile-nav";

describe("MobileNav", () => {
  it("opens, exposes the destinations, and closes with Escape", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    const trigger = screen.getByRole("button", { name: "Menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("mobile-navigation")).not.toBeVisible();

    await user.click(trigger);

    expect(screen.getByRole("button", { name: "Close" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "href",
      "/projects",
    );

    await user.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
  });

  it("closes after a destination is selected", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(screen.getByRole("link", { name: "Résumé" }));

    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
