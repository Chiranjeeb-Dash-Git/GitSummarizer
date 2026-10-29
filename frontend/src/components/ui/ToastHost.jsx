import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useToasts } from '../../lib/toast.js';
import { spring } from '../../lib/motion.js';

const toneBands = {
  success: 'var(--malachite)',
  error: 'var(--oxide)',
  info: 'var(--verdigris)',
};

export default function ToastHost() {
  const items = useToasts((s) => s.items);
  const dismiss = useToasts((s) => s.dismiss);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 left-5 z-[150] flex flex-col gap-2.5 sm:bottom-7 sm:left-7"
    >
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={spring.snappy}
            className="pointer-events-auto relative flex min-w-[260px] max-w-sm items-center justify-between overflow-hidden rounded-field border border-line-strong bg-surface py-3 pl-6 pr-3 shadow-slab-sm"
          >
            <span
              className="absolute inset-y-0 left-0 w-[6px]"
              style={{ background: toneBands[t.tone] ?? 'var(--verdigris)' }}
            />
            <span className="text-[15px] font-semibold text-ink">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="ml-3 grid h-8 w-8 place-items-center rounded-field text-muted hover:bg-surface-2 hover:text-ink"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

