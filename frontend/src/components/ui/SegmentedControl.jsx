import { useId } from 'react';
import { motion } from 'framer-motion';
import { spring } from '../../lib/motion.js';
import { cn } from '../../lib/cn.js';

export default function SegmentedControl({ label, options, value, onChange, className }) {
  const group = useId();
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex rounded-pill border border-line-strong bg-surface p-1', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <label key={o.value} className="relative cursor-pointer">
            <input type="radio" name={group} value={o.value} checked={active} onChange={() => onChange(o.value)} className="peer sr-only" />
            {active && (
              <motion.span layoutId={`${group}-thumb`} transition={spring.snappy} className="absolute inset-0 rounded-pill bg-ink" />
            )}
            <span
              title={o.hint}
              className={cn(
                'relative z-10 flex h-10 items-center rounded-pill px-4 text-sm font-semibold transition-colors',
                'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]',
                active ? 'text-paper' : 'text-muted hover:text-ink',
              )}
            >
              {o.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

