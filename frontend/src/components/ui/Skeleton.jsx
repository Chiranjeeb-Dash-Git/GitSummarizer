import { cn } from '../../lib/cn.js';

export default function Skeleton({ className, width, height, style }) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

