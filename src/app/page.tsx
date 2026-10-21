import Link from "next/link";

import { OrbitalSculpture } from "@/components/home/orbital-sculpture";
import { featuredProjects, projectCategoryLabels } from "@/data/projects";

// Rationale: The homepage is a concise introduction framed by one interactive system view and direct routes into the work.
export default function HomePage() {
  return (
    <section aria-labelledby="home-title" className="home-stage site-container">
      <div className="home-intro">
        <p className="eyebrow">AI/ML · Retrieval · Data systems</p>
        <h1 className="display-title" id="home-title">
          Cemal Gürsel Kar.
        </h1>
        <p className="lede">
          I build inspectable AI and data systems—from retrieval and local
          models to streaming pipelines and simulated robot workflows.
        </p>
        <div className="hero-actions">
          <Link className="primary-action" href="/projects">
            Explore my work
          </Link>
          <a
            className="secondary-action"
            href="https://github.com/cemalgurselkar"
            rel="noreferrer"
            target="_blank"
          >
            GitHub <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>

      <OrbitalSculpture />

      <nav aria-labelledby="selected-projects" className="home-projects">
        <div className="home-projects-heading">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 id="selected-projects">Systems in practice.</h2>
          </div>
          <Link href="/projects">
            All projects <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ol className="home-project-list">
          {featuredProjects.map((project, index) => (
            <li key={project.slug}>
              <Link href={`/projects/${project.slug}`}>
                <span>
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {projectCategoryLabels[project.categories[0]]}
                </span>
                <strong>{project.title}</strong>
                <small>{project.shortTitle}</small>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}
