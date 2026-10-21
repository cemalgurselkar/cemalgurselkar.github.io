import { describe, expect, it } from "vitest";

import {
  caseStudySlugs,
  featuredProjects,
  projects,
  publishedCaseStudies,
} from "@/data/projects";

describe("project registry", () => {
  it("keeps every public project tied to GitHub evidence", () => {
    expect(projects).toHaveLength(7);
    expect(featuredProjects).toHaveLength(4);
    expect(publishedCaseStudies).toHaveLength(5);
    expect(projects.some((project) => project.slug === "tiny-gpts")).toBe(
      false,
    );

    for (const project of projects) {
      expect(new URL(project.githubUrl).hostname).toBe("github.com");
      expect(project.evidenceLinks.length).toBeGreaterThan(0);
    }

    expect(publishedCaseStudies.map((project) => project.slug)).toEqual(
      expect.arrayContaining([...caseStudySlugs]),
    );
  });
});
