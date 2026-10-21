import type { Metadata } from "next";
import Link from "next/link";

import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Cemal Gürsel Kar by email or GitHub for AI, data, and retrieval engineering conversations.",
};

// Rationale: Direct email and GitHub routes keep contact low-friction without adding a form, tracking, or a backend.
export default function ContactPage() {
  return (
    <div className="contact-page site-container">
      <p className="eyebrow">Contact / engineering conversations</p>
      <h1>Let’s talk about systems.</h1>
      <p>
        I am open to AI/ML, data, and retrieval engineering roles, as well as
        conversations about projects that need evaluation, visible boundaries,
        or a careful data pipeline.
      </p>
      <div className="hero-actions">
        <a className="primary-action" href={`mailto:${profile.email}`}>
          Email me <span aria-hidden="true">→</span>
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
        <Link className="secondary-action" href="/resume">
          Résumé
        </Link>
      </div>
      <p className="contact-location">{profile.location}</p>
    </div>
  );
}
