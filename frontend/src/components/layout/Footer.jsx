import { WipeLink } from '../effects/StrataWipe.jsx';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-line-strong">
      {/* Four colour bands */}
      <div className="flex h-1.5 w-full">
        <div className="w-[40%] bg-[var(--strata-1)]" />
        <div className="w-[28%] bg-[var(--strata-2)]" />
        <div className="w-[20%] bg-[var(--strata-3)]" />
        <div className="w-[12%] bg-[var(--strata-4)]" />
      </div>

      <div className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 xl:px-16">
        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          <div>
            <span className="font-display text-xl font-bold">GitSummarizer</span>
            <p className="mt-3 max-w-[50ch] text-sm text-muted">
              Public repositories only. Summaries are written by an AI model and can be wrong, so check anything important in the source.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 text-sm md:items-end">
            <WipeLink to="/dashboard" className="text-muted hover:text-ink">
              Dashboard
            </WipeLink>
            <WipeLink to="/login" className="text-muted hover:text-ink">
              Sign in
            </WipeLink>
            <a
              href="https://docs.github.com/en/rest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-ink"
            >
              GitHub API documentation
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-xs text-muted">
          © {year} GitSummarizer
        </div>
      </div>
    </footer>
  );
}

