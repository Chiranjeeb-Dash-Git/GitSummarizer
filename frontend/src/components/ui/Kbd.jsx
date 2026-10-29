import { cn } from '../../lib/cn.js';

export default function Kbd({ children, className }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center rounded-chip border border-line-strong bg-surface px-1.5 py-0.5 font-sans text-xs font-semibold text-muted shadow-sm',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

