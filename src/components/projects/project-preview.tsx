import type { Project } from "@/data/projects";

type ProjectPreviewProps = Pick<Project, "cover" | "architectureCue" | "title">;

const previewSteps: Record<Project["cover"], readonly string[]> = {
  retrieval: ["query", "route", "retrieve", "context"],
  stream: ["events", "kafka", "process", "serve"],
  robot: ["command", "scan", "navigate", "grasp"],
  vector: ["mutate", "snapshot", "publish", "reopen"],
  tools: ["question", "select", "observe", "answer"],
  vision: ["frame", "detect", "track", "count"],
  training: ["data", "adapter", "train", "evaluate"],
};

// Rationale: Each compact architecture strip reveals a project's technical shape before a visitor opens its source.
export function ProjectPreview({
  cover,
  architectureCue,
  title,
}: ProjectPreviewProps) {
  return (
    <figure className={`project-preview project-preview--${cover}`}>
      <div aria-hidden="true" className="project-preview-flow">
        {previewSteps[cover].map((step, index) => (
          <div className="project-preview-step" key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
      <figcaption className="sr-only">
        {title} architecture: {architectureCue}
      </figcaption>
    </figure>
  );
}
