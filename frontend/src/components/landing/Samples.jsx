import { WipeLink } from '../effects/StrataWipe.jsx';
import Chip from '../ui/Chip.jsx';
import { SAMPLES } from '../../lib/constants.js';

export default function Samples() {
  return (
    <section id="samples" className="mx-auto max-w-[1280px] px-5 py-24 md:px-10 xl:px-16">
      <h2 className="font-display text-h1 font-extrabold tracking-tight">Try a real repository</h2>
      <p className="mt-3 text-muted">Click any example to see how GitSummarizer explains it.</p>

      <div className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 pt-2 [-webkit-overflow-scrolling:touch]">
        {SAMPLES.map((s, idx) => (
          <WipeLink
            key={s.input}
            to={`/read?${new URLSearchParams({ input: s.input, kind: s.kind, audience: 'learner' })}`}
            className="group min-w-[280px] flex-1 snap-start rounded-field border border-line-strong bg-surface p-6 shadow-slab-sm transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none sm:min-w-[300px]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-xl font-bold group-hover:text-malachite">{s.input}</span>
              <Chip color={`--strata-${idx + 1}`} label={s.kind === 'overview' ? 'Overview' : 'Release notes'} />
            </div>
            <p className="mt-3 text-sm text-muted">{s.note}</p>
          </WipeLink>
        ))}
      </div>
    </section>
  );
}

