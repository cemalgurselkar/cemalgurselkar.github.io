"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

import { projectCategoryLabels, type Project } from "@/data/projects";

type ProjectSpotlightProps = {
  index: number;
  project: Project;
};

// Rationale: A cursor-aware card keeps the evidence summary readable while making the selected work feel like an active surface rather than a static list.
export function ProjectSpotlight({ index, project }: ProjectSpotlightProps) {
  const hasPublishedValue = (value: string) =>
    value !== "Not published" && value !== "Withheld";

  const metric =
    project.verifiedMetrics.find(
      (item) => item.label.includes("BM25") && hasPublishedValue(item.value),
    ) ?? project.verifiedMetrics.find((item) => hasPublishedValue(item.value));

  const trackPointer = (event: MouseEvent<HTMLAnchorElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--pointer-x",
      `${event.clientX - bounds.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--pointer-y",
      `${event.clientY - bounds.top}px`,
    );
  };

  return (
    <Link
      className="project-spotlight"
      href={`/projects/${project.slug}`}
      onMouseMove={trackPointer}
    >
      <span aria-hidden="true" className="project-spotlight-glow" />
      <span className="project-spotlight-top">
        <span className="project-spotlight-index">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span>{projectCategoryLabels[project.categories[0]]}</span>
        <span aria-hidden="true" className="project-spotlight-arrow">
          ↗
        </span>
      </span>
      <span className="project-spotlight-body">
        <strong>{project.title}</strong>
        <span className="project-spotlight-tagline">{project.shortTitle}</span>
        <span className="project-spotlight-summary">{project.summary}</span>
      </span>
      <span className="project-spotlight-footer">
        <span className="project-spotlight-tech">
          {project.tech.slice(0, 4).map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </span>
        {metric ? (
          <span className="project-spotlight-metric">
            <b>{metric.value}</b>
            <small>{metric.label}</small>
          </span>
        ) : (
          <span className="project-spotlight-metric">
            <b>Simulation</b>
            <small>{project.architectureCue}</small>
          </span>
        )}
      </span>
    </Link>
  );
}
