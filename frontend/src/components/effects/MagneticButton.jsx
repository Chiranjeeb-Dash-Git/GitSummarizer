import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import Button from '../ui/Button.jsx';

export default function MagneticButton({ children, strength = 0.28, ...props }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 380, damping: 30 });
  const sy = useSpring(y, { stiffness: 380, damping: 30 });

  const onMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.span ref={ref} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={reset} className="inline-block">
      <Button {...props}>{children}</Button>
    </motion.span>
  );
}

