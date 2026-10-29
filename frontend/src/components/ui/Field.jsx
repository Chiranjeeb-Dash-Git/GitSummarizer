import { forwardRef, useId } from 'react';
import { cn } from '../../lib/cn.js';

const Field = forwardRef(function Field({ label, hint, error, className, ...props }, ref) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">{label}</label>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-12 w-full rounded-field border bg-surface px-4 text-base text-ink placeholder:text-muted',
          'focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
          error ? 'border-oxide' : 'border-line-strong',
        )}
        {...props}
      />
      {error ? (
        <p id={`${id}-err`} className="mt-2 text-sm font-medium text-oxide">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
});

export default Field;

