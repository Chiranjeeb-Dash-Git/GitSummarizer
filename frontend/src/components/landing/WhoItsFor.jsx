import { WipeLink } from '../effects/StrataWipe.jsx';

const AUDIENCE_BANDS = [
  {
    key: 'learner',
    name: 'Learners',
    copy: 'Understand an open-source project without wading through its documentation first.',
    strata: 'var(--strata-1)',
    heightClass: 'min-h-[160px]',
  },
  {
    key: 'product',
    name: 'Product teams',
    copy: 'Turn commit logs into release notes that explain the impact, not the implementation.',
    strata: 'var(--strata-2)',
    heightClass: 'min-h-[200px]',
  },
  {
    key: 'maintainer',
    name: 'Maintainers',
    copy: 'Give new contributors a clear first read of the project and its recent changes.',
    strata: 'var(--strata-3)',
    heightClass: 'min-h-[176px]',
  },
];

export default function WhoItsFor() {
  return (
    <section className="py-20">
      <div className="mx-auto mb-12 max-w-[1280px] px-5 md:px-10 xl:px-16">
        <h2 className="max-w-[36ch] font-display text-h1 font-extrabold tracking-tight">
          Built for the people who read code without writing it, and the people who maintain it
        </h2>
      </div>

      <div className="flex flex-col">
        {AUDIENCE_BANDS.map((b) => (
          <div
            key={b.key}
            className={`relative flex w-full items-center ${b.heightClass} py-8`}
            style={{
              background: `color-mix(in oklab, ${b.strata} 18%, var(--paper))`,
            }}
          >
            <span className="absolute inset-y-0 left-0 w-2.5" style={{ background: b.strata }} />
            <div className="mx-auto flex w-full max-w-[1280px] flex-col justify-between gap-4 px-5 pl-8 sm:flex-row sm:items-center md:px-10 md:pl-12 xl:px-16">
              <div>
                <h3 className="font-display text-2xl font-bold sm:text-3xl">{b.name}</h3>
                <p className="mt-2 max-w-[55ch] text-base text-muted">{b.copy}</p>
              </div>
              <WipeLink
                to={`/?audience=${b.key}`}
                className="font-semibold text-ink underline underline-offset-4 hover:text-malachite"
              >
                Explain for {b.name.toLowerCase()}
              </WipeLink>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

