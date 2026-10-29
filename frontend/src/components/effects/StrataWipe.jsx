import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useUI } from '../../store/ui.js';
import { ease } from '../../lib/motion.js';

const BANDS = 6;

export function useWipeNavigate() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const startWipe = useUI((s) => s.startWipe);
  return useCallback(
    (to, options) => (reduce ? navigate(to, options) : startWipe(() => navigate(to, options))),
    [navigate, reduce, startWipe],
  );
}

export function WipeLink({ to, onClick, children, ...props }) {
  const go = useWipeNavigate();
  return (
    <Link
      to={to}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        go(to);
      }}
    >
      {children}
    </Link>
  );
}

export default function StrataWipe() {
  const phase = useUI((s) => s.wipe.phase);
  const finishCover = useUI((s) => s.finishCover);
  const finishReveal = useUI((s) => s.finishReveal);
  if (phase === 'idle') return null;

  const covering = phase === 'cover';
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] flex">
      {Array.from({ length: BANDS }, (_, i) => (
        <motion.div
          key={`${phase}-${i}`}
          className="h-full flex-1"
          style={{ background: `var(--strata-${(i % 6) + 1})`, originY: covering ? 1 : 0 }}
          initial={{ scaleY: covering ? 0 : 1 }}
          animate={{ scaleY: covering ? 1 : 0 }}
          transition={{ duration: 0.5, ease: ease.strata, delay: i * 0.045 }}
          onAnimationComplete={() => {
            if (i === BANDS - 1) (covering ? finishCover : finishReveal)();
          }}
        />
      ))}
    </div>
  );
}

