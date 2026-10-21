import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyShell } from "@/components/projects/case-study-shell";
import {
  caseStudySlugs,
  getProject,
  type CaseStudySlug,
} from "@/data/projects";

const contentLoaders: Record<
  CaseStudySlug,
  () => Promise<{ default: React.ComponentType }>
> = {
  astrarag: () => import("@/content/projects/astrarag.mdx"),
  marketstream: () => import("@/content/projects/marketstream.mdx"),
  clearpath: () => import("@/content/projects/clearpath.mdx"),
  vectorch: () => import("@/content/projects/vectorch.mdx"),
  "financial-agent": () => import("@/content/projects/financial-agent.mdx"),
};

type CaseStudyPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project || project.status !== "published") return {};

  return {
    title: project.title,
    description: project.summary,
  };
}

// Rationale: A statically generated route keeps every concise case study fast, shareable, and compatible with GitHub Pages.
export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  const loader = contentLoaders[slug as CaseStudySlug];

  if (!project || project.status !== "published" || !loader) notFound();

  const { default: Content } = await loader();

  return (
    <CaseStudyShell project={project}>
      <Content />
    </CaseStudyShell>
  );
}
