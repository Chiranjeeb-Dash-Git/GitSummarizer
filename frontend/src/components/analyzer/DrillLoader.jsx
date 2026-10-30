import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Clock, Sparkles } from 'lucide-react';
import { spring } from '../../lib/motion.js';

export default function DrillLoader({ stages, repository, cached }) {
  const reduce = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);

  // Live timer counting elapsed seconds
  useEffect(() => {
    const start = performance.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((performance.now() - start) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const totalStages = stages.length;
  const activeIdx = stages.findIndex((s) => s.state === 'active');
  const doneCount = stages.filter((s) => s.state === 'done').length;

  // Compute smooth percentage (0-100)
  // Stage baseline progress + micro-increment as time ticks during AI stage
  let basePct = 0;
  if (cached) {
    basePct = 100;
  } else if (activeIdx >= 0) {
    const stageSlice = 100 / totalStages;
    basePct = activeIdx * stageSlice + (stageSlice * 0.45);
    // When in AI writing stage (index 3 or 'ai'), smoothly inch forward with elapsed time up to 94%
    if (stages[activeIdx]?.key === 'ai') {
      const extra = Math.min(22, elapsed * 3);
      basePct = Math.min(94, basePct + extra);
    }
  } else if (doneCount === totalStages) {
    basePct = 100;
  } else {
    basePct = 10;
  }

  const progressPercent = Math.min(100, Math.round(basePct));

  // Estimated time remaining (typically 4-10 seconds total for AI summary)
  const estRemaining = Math.max(1, Math.max(0, 7 - elapsed));

  const activeLabel = stages.find((s) => s.state === 'active')?.label ?? 'Synthesizing repository...';

  return (
    <div className="mx-auto max-w-4xl" role="status" aria-live="polite">
      {/* Progress & Live Timer Header Card */}
      <div className="mb-8 rounded-slab border border-line-strong bg-surface p-6 shadow-slab">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-malachite opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-malachite" />
              </span>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                {cached ? 'Cache Hit • Instant Recall' : 'AI Analysis in Progress'}
              </p>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
              {cached ? 'Reopening Cached Summary...' : activeLabel}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1.5 rounded-field border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs">
              <Clock size={14} className="text-muted" />
              <span className="text-ink">{elapsed}s elapsed</span>
            </div>
            {!cached && (
              <span className="font-mono text-xs text-muted">
                ~{estRemaining}s remaining
              </span>
            )}
            <div className="font-display text-2xl font-extrabold text-malachite">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* 0 to 100 Progress Bar */}
        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full border border-line bg-surface-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-ochre via-verdigris to-malachite"
            initial={{ width: '5%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[22rem_1fr] md:items-start">
        {/* Stages Drill Ladder */}
        <ol className="overflow-hidden rounded-slab border border-line-strong bg-surface shadow-slab">
          {stages.map((s, i) => {
            const pct = s.state === 'active' ? 34 : s.state === 'done' ? 16 : 0;
            return (
              <li
                key={s.key}
                className="relative flex h-[64px] items-center gap-3 border-b border-line px-5 last:border-b-0 transition-colors"
                style={{ background: `color-mix(in oklab, var(--strata-${i + 1}) ${pct}%, transparent)` }}
              >
                <span className="absolute inset-y-0 left-0 w-2" style={{ background: `var(--strata-${i + 1})` }} />
                <span className="grid h-6 w-6 place-items-center">
                  {s.state === 'done' ? (
                    <Check size={18} strokeWidth={3} className="text-malachite" />
                  ) : s.state === 'active' ? (
                    reduce ? (
                      <span className="h-3 w-3 rounded-full bg-ink" />
                    ) : (
                      <motion.span
                        layoutId="drill-bit"
                        transition={spring.snappy}
                        className="h-0 w-0 border-x-[7px] border-t-[12px] border-x-transparent border-t-ink"
                      />
                    )
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-line-strong" />
                  )}
                </span>
                <div className="min-w-0">
                  <span className={`block truncate ${s.state === 'pending' ? 'text-muted' : 'font-semibold text-ink'}`}>
                    {s.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Repository Preview Card */}
        <div className="rounded-slab border border-line bg-surface p-6 shadow-slab">
          {repository ? (
            <>
              <div className="flex items-center gap-3">
                {repository.avatarUrl ? (
                  <img
                    src={repository.avatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-full border border-line bg-surface"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full border border-line bg-surface-2" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-bold leading-tight text-ink">
                    {repository.fullName}
                  </p>
                  <p className="font-mono text-xs text-muted">
                    {repository.language || 'Codebase'} • {repository.stars ? `${repository.stars.toLocaleString()} stars` : 'Public'}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {repository.description || 'Extracting codebase structure, files, and commits for synthesis.'}
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <div className="skeleton h-5 w-44" />
                  <div className="skeleton h-3.5 w-28" />
                </div>
              </div>
              <div className="skeleton mt-3 h-4 w-full" />
              <div className="skeleton h-4 w-4/5" />
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 rounded-field border border-line bg-surface-2 px-3.5 py-2.5 text-xs text-muted">
            <Sparkles size={15} className="shrink-0 text-ochre" />
            <span>AI is currently synthesizing commits, architecture, and documentation.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
