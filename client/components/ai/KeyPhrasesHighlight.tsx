import type { FC } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface KeyPhrasesHighlightProps {
  keywords: string[];
  scores?: Record<string, number>;
  maxDisplay?: number;
  className?: string;
}

/**
 * Displays key phrases with importance weights and tooltips
 * Color intensity varies by TF-IDF score
 */
export const KeyPhrasesHighlight: FC<KeyPhrasesHighlightProps> = ({
  keywords,
  scores = {},
  maxDisplay = 10,
  className,
}) => {
  // Sort keywords by score (highest first)
  const sortedKeywords = [...keywords].sort((a, b) => {
    const scoreA = scores[a] || 0;
    const scoreB = scores[b] || 0;

    return scoreB - scoreA;
  });

  // Take only top N keywords
  const displayKeywords = sortedKeywords.slice(0, maxDisplay);

  if (displayKeywords.length === 0) {
    return null;
  }

  const getIntensityClass = (keyword: string) => {
    const score = scores[keyword] || 0;

    // Normalize score to 0-1 range (assuming max score is around 1.0)
    const normalized = Math.min(score, 1.0);

    if (normalized >= 0.7) {
      return 'bg-blue-600 text-white hover:bg-blue-700';
    }
    if (normalized >= 0.4) {
      return 'bg-blue-500 text-white hover:bg-blue-600';
    }
    if (normalized >= 0.2) {
      return 'bg-blue-400 text-white hover:bg-blue-500';
    }

    return 'bg-blue-300 text-blue-900 hover:bg-blue-400';
  };

  return (
    <TooltipProvider>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {displayKeywords.map((keyword, index) => {
          const score = scores[keyword];
          const hasScore = score !== undefined;

          const badge = (
            <Badge
              variant="secondary"
              className={cn(
                'font-medium transition-colors',
                hasScore && getIntensityClass(keyword),
              )}
            >
              {keyword}
              {hasScore && (
                <span className="ml-1.5 text-xs opacity-75">{(score * 100).toFixed(0)}</span>
              )}
            </Badge>
          );

          if (hasScore) {
            return (
              <Tooltip key={`${keyword}-${index}`}>
                <TooltipTrigger asChild>{badge}</TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{keyword}</p>
                    <p className="text-xs text-muted-foreground">
                      Importance: {(score * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs">This keyword suggests the AI classification</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }

          return badge;
        })}
      </div>
    </TooltipProvider>
  );
};
