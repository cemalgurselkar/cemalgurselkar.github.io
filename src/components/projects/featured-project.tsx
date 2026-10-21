import Link from "next/link";

import type { Project } from "@/data/projects";

import { ProjectPreview } from "./project-preview";

type FeaturedProjectProps = { index: number; project: Project };

// Rationale: A varied editorial project row pairs a verified summary with the architecture that makes the work distinctive.
export function FeaturedProject({ index, project }: FeaturedProjectProps) {
  return (
    <article className="featured-project">
      <div className="featured-project-copy">
        <p className="project-kicker">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{projectCategory(project)}</span>
        </p>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="project-links">
          <Link href={`/projects/${project.slug}`}>Read case study →</Link>
          <a href={project.githubUrl} rel="noreferrer" target="_blank">
            Inspect repository <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <span title={`Audited commit ${project.auditedCommit}`}>
            Evidence checked
          </span>
        </div>
      </div>
      <ProjectPreview {...project} />
    </article>
  );
}

function projectCategory(project: Project) {
  return project.categories[0] === "rag"
    ? "Retrieval / LLM"
    : project.categories[0] === "data"
      ? "Data systems"
      : project.categories[0] === "robotics"
        ? "Robotics"
        : "ML foundations";
}
