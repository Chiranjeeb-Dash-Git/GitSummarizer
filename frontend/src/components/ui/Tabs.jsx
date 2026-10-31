import { useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { spring } from '../../lib/motion.js';
import { cn } from '../../lib/cn.js';

export default function Tabs({ tabs, value, onChange, label, className }) {
  const id = useId();
  const refs = useRef([]);

  const onKeyDown = (e, i) => {
    const last = tabs.length - 1;
    const map = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = map[e.key];
    onChange(tabs[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={cn('flex gap-6 border-b border-line', className)}>
      {tabs.map((t, i) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            id={`${id}-${t.value}`}
            aria-selected={active}
            aria-controls={`${id}-panel`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn('relative h-12 font-display text-lg font-semibold', active ? 'text-ink' : 'text-muted hover:text-ink')}
          >
            {t.label}
            {active && <motion.span layoutId={`${id}-underline`} transition={spring.snappy} className="absolute inset-x-0 -bottom-px h-[3px] bg-malachite" />}
          </button>
        );
      })}
    </div>
  );
}

