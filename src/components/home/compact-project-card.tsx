import Link from "next/link";

import { projectCategoryLabels, type Project } from "@/data/projects";

type CompactProjectCardProps = {
  index: number;
  project: Project;
};

// Rationale: The compact card keeps the single-screen homepage scannable while preserving a metric, category, and direct case-study route.
export function CompactProjectCard({
  index,
  project,
}: CompactProjectCardProps) {
  const hasPublishedValue = (value: string) =>
    value !== "Not published" && value !== "Withheld";

  const metric =
    project.verifiedMetrics.find(
      (item) => item.label.includes("BM25") && hasPublishedValue(item.value),
    ) ?? project.verifiedMetrics.find((item) => hasPublishedValue(item.value));

  return (
    <Link className="compact-project" href={`/projects/${project.slug}`}>
      <span className="compact-project-top">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{projectCategoryLabels[project.categories[0]]}</span>
        <span aria-hidden="true">↗</span>
      </span>
      <strong>{project.title}</strong>
      <small>{project.shortTitle}</small>
      <span className="compact-project-foot">
        <span>{project.tech.slice(0, 2).join(" · ")}</span>
        <b>{metric ? metric.value : "Simulation"}</b>
      </span>
    </Link>
  );
}
