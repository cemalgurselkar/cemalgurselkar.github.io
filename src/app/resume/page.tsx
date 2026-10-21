import type { Metadata } from "next";
import Link from "next/link";

import { education, experience, profile } from "@/data/profile";
import { resumeProjects, resumeSkillGroups } from "@/data/resume";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "A project-based résumé for Cemal Gürsel Kar, a computer engineering graduate working on AI, retrieval, robotics, and data systems.",
};

// Rationale: The HTML résumé makes verified technical work easy to scan while keeping the supplied CV facts and evidence links in one place.
export default function ResumePage() {
  return (
    <div className="resume-page site-container">
      <header className="resume-intro">
        <p className="eyebrow">Résumé / updated from CV</p>
        <h1>{profile.name}</h1>
        <p className="resume-summary">
          {profile.tagline} {profile.intro}
        </p>
        <p className="resume-note">
          Computer Engineering graduate from Çukurova University, based in{" "}
          {profile.location}. Updated October 2026 from the supplied CV. The
          phone number is intentionally omitted from the public site.
        </p>
        <div className="hero-actions">
          <Link className="primary-action" href="/projects">
            Explore project evidence
          </Link>
          <a className="secondary-action" href={`mailto:${profile.email}`}>
            Email me
          </a>
          <a
            className="secondary-action"
            href={profile.github}
            rel="noreferrer"
            target="_blank"
          >
            GitHub <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </header>

      <section aria-labelledby="resume-experience" className="resume-section">
        <header>
          <p className="eyebrow">Experience</p>
          <h2 id="resume-experience">Where the systems met reality.</h2>
          <p>
            Internship and project work with an emphasis on computer vision,
            streaming data, and evaluation.
          </p>
        </header>
        <div className="resume-detail">
          <ol className="timeline-list">
            {experience.map((item) => (
              <li
                className="timeline-item"
                key={`${item.company}-${item.role}`}
              >
                <span aria-hidden="true" className="timeline-dot" />
                <div>
                  <p className="timeline-meta">
                    {item.period} · {item.company}
                  </p>
                  <h3>{item.role}</h3>
                  <p>{item.summary}</p>
                  <ul
                    aria-label={`${item.company} technologies`}
                    className="timeline-tags"
                  >
                    {item.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="resume-education" className="resume-section">
        <header>
          <p className="eyebrow">Education</p>
          <h2 id="resume-education">Computer engineering, systems first.</h2>
          <p>
            A degree grounded in data, models, and the infrastructure that keeps
            both useful.
          </p>
        </header>
        <div className="resume-detail">
          <ol className="timeline-list">
            {education.map((item) => (
              <li className="timeline-item" key={item.school}>
                <span aria-hidden="true" className="timeline-dot" />
                <div>
                  <p className="timeline-meta">{item.period}</p>
                  <h3>{item.degree}</h3>
                  <p>
                    {item.school}
                    <br />
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="resume-skills" className="resume-section">
        <header>
          <p className="eyebrow">Technology / from project repositories</p>
          <h2 id="resume-skills">Tools used across the work.</h2>
          <p>
            These are technologies present in the published projects; the list
            does not imply a proficiency rating.
          </p>
        </header>
        <div className="resume-skills">
          {resumeSkillGroups.map((group, index) => (
            <section key={group.title}>
              <span className="resume-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{group.title}</h3>
                <ul aria-label={`${group.title} technologies`}>
                  {group.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
                <Link href={group.href}>Evidence: {group.project} →</Link>
              </div>
            </section>
          ))}
        </div>
      </section>

      <section aria-labelledby="resume-projects" className="resume-section">
        <header>
          <p className="eyebrow">Selected work</p>
          <h2 id="resume-projects">Systems, with the evidence attached.</h2>
        </header>
        <ol className="resume-projects">
          {resumeProjects.map((project, index) => (
            <li key={project.title}>
              <span className="resume-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>
                  <Link href={project.href}>{project.title}</Link>
                </h3>
                <p>{project.description}</p>
              </div>
              <Link
                aria-label={`Read ${project.title} case study`}
                href={project.href}
              >
                View case study <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <aside className="resume-pending" aria-label="Résumé document status">
        <span className="eyebrow">PDF résumé</span>
        <p>
          The full PDF is available on request. This page carries the same
          verified facts without publishing a phone number.
        </p>
      </aside>
    </div>
  );
}
