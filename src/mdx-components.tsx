import type { MDXComponents } from "mdx/types";

// Rationale: A restrained MDX component map keeps future evidence-heavy case studies readable and visually consistent.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => <h2 className="case-study-heading">{children}</h2>,
    p: ({ children }) => <p className="case-study-copy">{children}</p>,
    a: ({ children, href }) => (
      <a className="text-link" href={href}>
        {children}
      </a>
    ),
    ...components,
  };
}
