import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizes = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-7 w-7 border-[3px]',
};

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block rounded-full',
        'border-muted-foreground/25 border-t-primary',
        'animate-spin',
        '[animation-timing-function:cubic-bezier(0.4,0,0.2,1)]',
        '[animation-duration:700ms]',
        sizes[size],
        className,
      )}
    />
  );
}
