import { stack } from "@/data/profile";

// Rationale: A quiet, pausable stack ticker gives recruiters a fast tool signal without turning the homepage into a badge wall.
export function TechMarquee() {
  return (
    <section aria-label="Tools and technologies" className="tech-marquee">
      <div className="tech-marquee-track">
        {[0, 1].map((copy) => (
          <ul
            aria-hidden={copy === 1 ? true : undefined}
            className="tech-marquee-list"
            key={copy}
          >
            {stack.map((technology) => (
              <li key={technology}>
                {technology}
                <span aria-hidden="true">/</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
