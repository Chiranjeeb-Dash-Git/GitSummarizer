import { motion } from 'framer-motion';
import { useScrollSpy } from '../../hooks/useScrollSpy.js';
import { spring } from '../../lib/motion.js';

export default function StrataRail({ sections }) {
  const active = useScrollSpy(sections.map((s) => s.id));
  if (sections.length < 2) return null;

  const go = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav aria-label="Sections in this summary" className="sticky top-[72px] z-20 -mx-5 bg-paper px-5 py-3 md:-mx-10 md:px-10 lg:top-28 lg:mx-0 lg:w-12 lg:bg-transparent lg:p-0">
      <ol className="flex h-3 gap-1 lg:h-[min(60vh,28rem)] lg:flex-col">
        {sections.map((s, i) => {
          const isActive = s.id === active;
          return (
            <li key={s.id} className="group relative min-w-0 lg:min-h-0" style={{ flex: `${Math.max(s.weight, 160)} 1 0` }}>
              <button
                type="button"
                onClick={() => go(s.id)}
                aria-label={`Go to ${s.title}`}
                aria-current={isActive ? 'true' : undefined}
                className="relative block h-full w-full rounded-chip"
                style={{ background: `var(--strata-${(i % 6) + 1})`, opacity: isActive ? 1 : 0.4 }}
              >
                {isActive && (
                  <motion.span layoutId="rail-active" transition={spring.snappy} className="absolute -inset-1 rounded-chip border-2 border-ink" />
                )}
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-chip bg-ink px-2.5 py-1 text-xs font-semibold text-paper opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 lg:block">
                {s.title}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

