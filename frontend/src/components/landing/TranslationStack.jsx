import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { TRANSLATION_ROWS } from '../../lib/constants.js';
import { spring } from '../../lib/motion.js';

export default function TranslationStack() {
  const reduce = useReducedMotion();
  const total = TRANSLATION_ROWS.length;
  const [done, setDone] = useState(reduce ? total : 0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduce) { setDone(total); return undefined; }
    setDone(0);
    const timers = TRANSLATION_ROWS.map((_, i) => setTimeout(() => setDone(i + 1), 1100 + i * 700));
    return () => timers.forEach(clearTimeout);
  }, [run, reduce, total]);

  return (
    <button
      type="button"
      onClick={() => setRun((n) => n + 1)}
      aria-label="Replay the example: raw commit messages translated into plain language"
      className="block w-full text-left"
    >
      <ol className="space-y-3">
        {TRANSLATION_ROWS.map((row, i) => {
          const translated = done > i;
          const scanning = done === i && !reduce;
          return (
            <motion.li
              key={row.sha}
              initial={reduce ? false : { opacity: 0, x: i % 2 ? 56 : -56 }}
              animate={{ opacity: 1, x: i % 2 ? 14 : 0 }}
              transition={{ ...spring.soft, delay: 0.15 + i * 0.09 }}
              className="relative overflow-hidden rounded-field border border-line-strong bg-surface shadow-slab-sm"
              style={{ minHeight: 76 }}
            >
              <span className="absolute inset-y-0 left-0 w-2.5" style={{ background: `var(--strata-${(i % 6) + 1})` }} />
              <div className="px-6 py-4 pl-8">
                <AnimatePresence mode="wait" initial={false}>
                  {translated ? (
                    <motion.p
                      key="plain"
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28 }}
                      className="text-[1.02rem] font-medium leading-snug"
                    >
                      {row.plain}
                      <span className="ml-2 font-mono text-[11px] text-muted">{row.sha}</span>
                    </motion.p>
                  ) : (
                    <motion.code
                      key="raw"
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="block break-words font-mono text-[12.5px] leading-relaxed text-muted"
                    >
                      {row.sha} {row.raw}
                    </motion.code>
                  )}
                </AnimatePresence>
              </div>
              {scanning && (
                <motion.span layoutId="scan-bar" transition={spring.snappy} className="absolute inset-x-0 bottom-0 h-[3px] bg-malachite" />
              )}
            </motion.li>
          );
        })}
      </ol>
    </button>
  );
}

