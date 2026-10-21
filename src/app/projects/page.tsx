import type { Metadata } from "next";

import { ProjectFilters } from "@/components/projects/project-filters";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Verified AI, retrieval, robotics, and data engineering projects by Cemal Gürsel Kar.",
};

// Rationale: The project index lets visitors filter verified repositories by discipline without presenting unfinished case studies as complete.
export default function ProjectsPage() {
  return (
    <div className="projects-page site-container">
      <header className="projects-intro">
        <p className="eyebrow">
          Project index / {projects.length} repositories
        </p>
        <h1>Work with the boundaries left in.</h1>
        <p>
          Filter by discipline, inspect the architecture cue, then follow the
          exact repository evidence. Five concise case studies connect the
          system design to verified performance and practical limits.
        </p>
      </header>
      <ProjectFilters />
    </div>
  );
}
