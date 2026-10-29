import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold select-none whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-150 ease-out-expo disabled:opacity-45 disabled:pointer-events-none';

const variants = {
  primary:
    'h-12 px-6 rounded-pill bg-malachite text-on-malachite shadow-slab-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px]',
  ghost:
    'h-11 px-5 rounded-pill border border-line-strong text-ink hover:bg-surface-2',
  quiet:
    'h-10 px-3 rounded-field text-ink hover:bg-surface-2',
  danger:
    'h-11 px-5 rounded-pill bg-oxide text-paper hover:translate-x-[2px] hover:translate-y-[2px]',
};

const Button = forwardRef(function Button({ variant = 'primary', className, as: Tag = 'button', type, ...props }, ref) {
  return (
    <Tag
      ref={ref}
      type={Tag === 'button' ? type ?? 'button' : undefined}
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
});

export default Button;

