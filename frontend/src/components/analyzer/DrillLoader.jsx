import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { spring } from '../../lib/motion.js';

export default function DrillLoader({ stages, repository, cached }) {
  const reduce = useReducedMotion();
  const activeLabel = stages.find((s) => s.state === 'active')?.label ?? 'Starting';

  return (
    <div className="grid gap-8 md:grid-cols-[22rem_1fr] md:items-start" role="status" aria-live="polite">
      <p className="sr-only">{cached ? 'Found a recent summary' : activeLabel}</p>

      <ol className="overflow-hidden rounded-slab border border-line-strong bg-surface shadow-slab">
        {stages.map((s, i) => {
          const pct = s.state === 'active' ? 34 : s.state === 'done' ? 16 : 0;
          return (
            <li
              key={s.key}
              className="relative flex h-[68px] items-center gap-3 border-b border-line px-6 last:border-b-0"
              style={{ background: `color-mix(in oklab, var(--strata-${i + 1}) ${pct}%, transparent)` }}
            >
              <span className="absolute inset-y-0 left-0 w-2" style={{ background: `var(--strata-${i + 1})` }} />
              <span className="grid h-6 w-6 place-items-center">
                {s.state === 'done' ? (
                  <Check size={18} strokeWidth={3} />
                ) : s.state === 'active' ? (
                  reduce ? (
                    <span className="h-3 w-3 rounded-full bg-ink" />
                  ) : (
                    <motion.span layoutId="drill-bit" transition={spring.snappy} className="h-0 w-0 border-x-[7px] border-t-[12px] border-x-transparent border-t-ink" />
                  )
                ) : (
                  <span className="h-2 w-2 rounded-full bg-line-strong" />
                )}
              </span>
              <span className={s.state === 'pending' ? 'text-muted' : 'font-semibold'}>{s.label}</span>
            </li>
          );
        })}
      </ol>

      <div className="min-h-[8rem]">
        {repository ? (
          <>
            <p className="font-display text-3xl font-bold leading-tight">{repository.fullName}</p>
            <p className="mt-2 max-w-[46ch] text-muted">{repository.description || 'No description provided.'}</p>
          </>
        ) : (
          <>
            <div className="skeleton h-9 w-64" />
            <div className="skeleton mt-4 h-5 w-80 max-w-full" />
          </>
        )}
      </div>
    </div>
  );
}

