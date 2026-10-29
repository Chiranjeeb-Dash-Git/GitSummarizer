import { motion, useReducedMotion } from 'framer-motion';
import { ease } from '../../lib/motion.js';

export default function SplitLines({ lines, delay = 0.1 }) {
  const reduce = useReducedMotion();
  return lines.map((line, i) => (
    <span key={line} className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={reduce ? false : { y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, ease: ease.outExpo, delay: delay + i * 0.12 }}
      >
        {line}
      </motion.span>
    </span>
  ));
}

