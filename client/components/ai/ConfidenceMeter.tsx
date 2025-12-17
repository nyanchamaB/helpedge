import type { FC } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ConfidenceMeterProps {
  confidence: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Visual progress bar showing confidence level
 */
export const ConfidenceMeter: FC<ConfidenceMeterProps> = ({
  confidence,
  label = 'Confidence',
  showPercentage = true,
  size = 'md',
  className,
}) => {
  const percentage = Math.round(confidence * 100);

  const getColorClass = () => {
    if (confidence >= 0.8) return 'bg-green-600';
    if (confidence >= 0.6) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {showPercentage && (
          <span className="font-medium tabular-nums">{percentage}%</span>
        )}
      </div>
      <div className="relative">
        <Progress
          value={percentage}
          className={cn('w-full', heightClasses[size])}
          indicatorClassName={getColorClass()}
        />
      </div>
    </div>
  );
};
