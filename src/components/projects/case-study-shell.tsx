import Link from "next/link";

import { CaseStudyExhibit } from "@/components/projects/case-study-exhibit";
import {
  projectCategoryLabels,
  publishedCaseStudies,
  type CaseStudySlug,
  type Project,
} from "@/data/projects";

type CaseStudyShellProps = {
  children: React.ReactNode;
  project: Project;
};

// Rationale: The compact case-study shell keeps technologies, evidence, performance, limits, and source access in a consistent scan path.
export function CaseStudyShell({ children, project }: CaseStudyShellProps) {
  const currentIndex = publishedCaseStudies.findIndex(
    (item) => item.slug === project.slug,
  );
  const nextProject =
    publishedCaseStudies[(currentIndex + 1) % publishedCaseStudies.length];

  return (
    <article className="case-study site-container">
      <header className="case-hero">
        <nav aria-label="Breadcrumb">
          <Link href="/projects">Projects</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{project.title}</span>
        </nav>
        <p className="eyebrow">
          {project.categories
            .map((category) => projectCategoryLabels[category])
            .join(" · ")}
        </p>
        <h1>{project.title}</h1>
        <p className="case-summary">{project.summary}</p>
        <ul aria-label="Technologies" className="tech-list">
          {project.tech.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
        <div className="case-hero-links">
          <a href={project.githubUrl} rel="noreferrer" target="_blank">
            Open repository <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <span>Audited commit {project.auditedCommit}</span>
        </div>
      </header>

      <CaseStudyExhibit slug={project.slug as CaseStudySlug} />

      <section aria-labelledby="performance-title" className="case-performance">
        <div>
          <p className="eyebrow">Verified performance</p>
          <h2 id="performance-title">Only the numbers the source supports.</h2>
        </div>
        <dl>
          {project.verifiedMetrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
              <p>{metric.context}</p>
            </div>
          ))}
        </dl>
      </section>

      <div className="case-body">{children}</div>

      <section aria-labelledby="evidence-title" className="case-evidence">
        <div>
          <p className="eyebrow">Original evidence</p>
          <h2 id="evidence-title">Inspect the source.</h2>
        </div>
        <ul>
          {project.evidenceLinks.map((link) => (
            <li key={link.url}>
              <a href={link.url} rel="noreferrer" target="_blank">
                {link.label} <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label="Case study navigation" className="case-next">
        <span>Next case study</span>
        <Link href={`/projects/${nextProject.slug}`}>
          {nextProject.title} <span aria-hidden="true">→</span>
        </Link>
      </nav>
    </article>
  );
}
