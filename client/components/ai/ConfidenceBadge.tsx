import type { FC } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ClassificationMethod } from '@/lib/types/ai';
import { Brain, Cpu, Lightbulb, User, HelpCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: number;
  method: ClassificationMethod;
  needsReview?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// Maps both string and integer enum values (backend may return either)
const METHOD_ICONS: Record<string, typeof Lightbulb> = {
  [ClassificationMethod.RuleBased]: Lightbulb,
  [ClassificationMethod.MachineLearning]: Brain,
  [ClassificationMethod.Hybrid]: Cpu,
  [ClassificationMethod.ManualReview]: User,
  '0': Lightbulb,
  '1': Brain,
  '2': Cpu,
  '3': User,
};

const METHOD_LABELS: Record<string, string> = {
  [ClassificationMethod.RuleBased]: 'Rules',
  [ClassificationMethod.MachineLearning]: 'TF-IDF',
  [ClassificationMethod.Hybrid]: 'Hybrid',
  [ClassificationMethod.ManualReview]: 'Manual',
  '0': 'Rules',
  '1': 'TF-IDF',
  '2': 'Hybrid',
  '3': 'Manual',
};

/**
 * Displays confidence score with color-coded badge and method indicator
 * Color coding: green >0.80, yellow 0.60-0.80, red <0.60
 */
export const ConfidenceBadge: FC<ConfidenceBadgeProps> = ({
  confidence,
  method,
  needsReview = false,
  size = 'md',
  showLabel = true,
  className,
}) => {
  const percentage = Math.round(confidence * 100);
  const methodKey = method != null ? String(method) : '';
  const Icon = METHOD_ICONS[methodKey] || HelpCircle;

  // Determine color variant based on confidence
  const getVariant = () => {
    if (needsReview) {return 'secondary';}
    if (confidence >= 0.8) {return 'default';}
    if (confidence >= 0.6) {return 'secondary';}

    return 'destructive';
  };

  const getColorClasses = () => {
    if (needsReview) {
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
    }
    if (confidence >= 0.8) {
      return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200';
    }
    if (confidence >= 0.6) {
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
    }

    return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <Badge
      variant={getVariant()}
      className={cn(
        'inline-flex items-center font-medium',
        getColorClasses(),
        sizeClasses[size],
        className,
      )}
    >
      <Icon className={iconSizes[size]} aria-hidden="true" />
      <span className="font-semibold">{percentage}%</span>
      {showLabel && (
        <>
          <span className="mx-1">•</span>
          <span>{METHOD_LABELS[methodKey] || methodKey || 'Hybrid'}</span>
        </>
      )}
      {needsReview && (
        <>
          <span className="mx-1">•</span>
          <span className="text-xs">Review</span>
        </>
      )}
    </Badge>
  );
};
