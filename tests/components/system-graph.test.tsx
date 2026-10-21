import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SystemGraph } from "@/components/motion/system-graph";

describe("SystemGraph", () => {
  it("supports directional keyboard exploration", async () => {
    const user = userEvent.setup();
    render(<SystemGraph />);

    const models = screen.getByRole("button", { name: /Models/ });
    models.focus();
    expect(models).toHaveAttribute("aria-pressed", "true");

    await user.keyboard("{ArrowRight}");

    const retrieval = screen.getByRole("button", { name: /Retrieval/ });
    expect(retrieval).toHaveFocus();
    expect(retrieval).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText(/Evaluated context constrains/),
    ).toBeInTheDocument();
  });
});
