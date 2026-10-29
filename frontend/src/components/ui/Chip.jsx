import { X } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export default function Chip({ label, color, onRemove, className, children }) {
  const content = label ?? children;
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-chip bg-surface-2 px-2.5 text-[13px] font-semibold text-ink',
        className,
      )}
    >
      {color && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: color.startsWith('var(') ? color : `var(${color})` }}
          aria-hidden="true"
        />
      )}
      <span>{content}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${content}`}
          className="-mr-1 grid h-5 w-5 place-items-center rounded-full hover:bg-line-strong hover:text-paper"
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}

