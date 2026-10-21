import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProjectFilters } from "@/components/projects/project-filters";

describe("ProjectFilters", () => {
  it("filters projects by category and announces the result count", async () => {
    const user = userEvent.setup();
    render(<ProjectFilters />);

    expect(
      screen.getByText("Showing 7 of 7 verified repositories"),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "LLM / RAG" }));

    expect(
      screen.getByText("Showing 3 of 7 verified repositories"),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "AstraRAG" })).toBeVisible();
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "MarketStream" }),
      ).not.toBeInTheDocument();
    });
  });
});
