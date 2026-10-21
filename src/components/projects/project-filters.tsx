"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import {
  projectCategoryLabels,
  projects,
  type ProjectCategory,
} from "@/data/projects";

import { ProjectPreview } from "./project-preview";

type Filter = "all" | ProjectCategory;
const filters: readonly Filter[] = [
  "all",
  "rag",
  "robotics",
  "data",
  "foundations",
];

// Rationale: Accessible filters let role-specific visitors narrow verified work while preserving a clear count and keyboard-native controls.
export function ProjectFilters() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const reduceMotion = useReducedMotion();
  const visibleProjects = projects.filter(
    (project) =>
      activeFilter === "all" || project.categories.includes(activeFilter),
  );

  return (
    <div>
      <div
        aria-label="Filter projects"
        className="project-filters"
        role="group"
      >
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter}
            className="project-filter"
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter === "all" ? "All work" : projectCategoryLabels[filter]}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="project-result-count">
        Showing {visibleProjects.length} of {projects.length} verified
        repositories
      </p>
      <motion.div className="project-index" layout={!reduceMotion}>
        <AnimatePresence initial={false} mode="popLayout">
          {visibleProjects.map((project, index) => (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="project-index-item"
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              key={project.slug}
              layout={!reduceMotion}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            >
              <div className="project-index-copy">
                <p className="project-kicker">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    {project.categories
                      .map((category) => projectCategoryLabels[category])
                      .join(" · ")}
                  </span>
                </p>
                <h2>{project.title}</h2>
                <p className="project-index-subtitle">{project.shortTitle}</p>
                <p className="project-index-summary">{project.summary}</p>
                <ul
                  aria-label={`${project.title} technologies`}
                  className="tech-list"
                >
                  {project.tech.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
                <div className="project-links">
                  {project.status === "published" ? (
                    <Link href={`/projects/${project.slug}`}>
                      Read case study →
                    </Link>
                  ) : (
                    <span>Index entry only</span>
                  )}
                  <a href={project.githubUrl} rel="noreferrer" target="_blank">
                    Repository <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <a
                    href={project.evidenceLinks[0].url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {project.evidenceLinks[0].label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
              </div>
              <ProjectPreview {...project} />
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
