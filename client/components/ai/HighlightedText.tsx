import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface HighlightedTextProps {
  text: string;
  keywords: string[];
  className?: string;
}

/**
 * Highlights keywords within text
 */
export const HighlightedText: FC<HighlightedTextProps> = ({
  text,
  keywords,
  className,
}) => {
  if (!keywords || keywords.length === 0) {
    return <p className={className}>{text}</p>;
  }

  // Create regex pattern for all keywords (case-insensitive, whole word)
  const pattern = keywords
    .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special chars
    .join('|');

  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

  // Split text and highlight matches
  const parts = text.split(regex);

  return (
    <p className={className}>
      {parts.map((part, index) => {
        // Check if this part matches any keyword (case-insensitive)
        const isKeyword = keywords.some(
          (keyword) => keyword.toLowerCase() === part.toLowerCase()
        );

        if (isKeyword) {
          return (
            <mark
              key={index}
              className={cn(
                'bg-blue-200 text-blue-900 px-1 rounded',
                'dark:bg-blue-900 dark:text-blue-100',
                'font-medium'
              )}
            >
              {part}
            </mark>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </p>
  );
};
