import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BreadcrumbContainerProps {
  children: ReactNode;
  className?: string;
  withContainer?: boolean;
}

export function BreadcrumbContainer({ 
  children, 
  className,
  withContainer = true 
}: BreadcrumbContainerProps) {
  return (
    <div className={cn(
      "bg-white border-b",
      withContainer && "container mx-auto px-4",
      className
    )}>
      <div className="py-3">
        {children}
      </div>
    </div>
  );
}

