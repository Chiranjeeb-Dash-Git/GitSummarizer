import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { ease } from '../../lib/motion.js';

export default function CountUp({ value }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return undefined;
    if (reduce) { ref.current.textContent = String(value); return undefined; }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: ease.outExpo,
      onUpdate: (v) => { if (ref.current) ref.current.textContent = String(Math.round(v)); },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return <span ref={ref} className="tabular-nums">{value}</span>;
}

