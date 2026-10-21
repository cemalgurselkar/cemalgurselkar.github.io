import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CaseStudyExhibit } from "@/components/projects/case-study-exhibit";

describe("CaseStudyExhibit", () => {
  it("supports keyboard exploration and exposes verified retrieval context", async () => {
    const user = userEvent.setup();
    render(<CaseStudyExhibit slug="astrarag" />);

    const dense = screen.getByRole("button", { name: /Dense/ });
    dense.focus();
    await user.keyboard("{ArrowRight}");

    const bm25 = screen.getByRole("button", { name: /BM25/ });
    expect(bm25).toHaveFocus();
    expect(bm25).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Hit@10 0.775")).toBeVisible();
  });
});
