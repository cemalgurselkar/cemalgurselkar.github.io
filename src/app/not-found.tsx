import Link from "next/link";

// Rationale: The error page gives a lost visitor one clear recovery path in the same visual language as the portfolio.
export default function NotFound() {
  return (
    <section className="site-container flex min-h-[65svh] max-w-3xl flex-col justify-center py-20">
      <p className="eyebrow">404 / Route not found</p>
      <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">
        This path ends here.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-secondary">
        The page may have moved, or the route has not been published yet.
      </p>
      <Link className="text-link" href="/">
        Return home <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
