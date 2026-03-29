'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AIExplanation } from '@/components/ai/AIExplanation';
import { ConfidenceBadge } from '@/components/ai/ConfidenceBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronDown, ChevronUp, Brain, AlertCircle, Info } from 'lucide-react';
import { getTicketAIDetails } from '@/lib/api/ai';
import { cn } from '@/lib/utils';

interface AIDetailsSectionProps {
  ticketId: string;
  ticketDescription?: string;
  initialExpanded?: boolean;
  className?: string;
  getCategoryName?: (id: string) => string;
}

/**
 * Collapsible AI Classification Details Section for Ticket Detail Page
 * Authorization: Admin, ITManager, TeamLead, ServiceDeskAgent
 */
export function AIDetailsSection({
  ticketId,
  ticketDescription,
  initialExpanded = false,
  className,
  getCategoryName,
}: AIDetailsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const {
    data: aiDetailsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ticket-ai-details', ticketId],
    queryFn: () => getTicketAIDetails(ticketId),
    enabled: isExpanded, // Only fetch when expanded
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const aiDetails = aiDetailsResponse?.data;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
          aria-expanded={isExpanded}
          aria-controls="ai-details-content"
        >
          <div className="flex items-center gap-3 flex-1">
            <Brain className="h-5 w-5 text-purple-600" />
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                AI Classification Details
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isExpanded
                  ? 'View full AI analysis and reasoning'
                  : 'Click to view AI analysis and classification confidence'}
              </p>
            </div>
            {aiDetails && !isExpanded && (
              <ConfidenceBadge
                confidence={aiDetails.finalConfidence || 0}
                method={aiDetails.method}
                needsReview={aiDetails.needsReview}
                size="sm"
                className="mr-2"
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label={isExpanded ? 'Collapse AI details' : 'Expand AI details'}
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent id="ai-details-content" className="pt-0">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load AI classification details. Please try again.
                <Button
                  variant="link"
                  className="px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    refetch();
                  }}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && !aiDetails && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No AI classification data available for this ticket. The ticket may have been
                classified manually or before the AI system was enabled.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && aiDetails && (
            <AIExplanation
              aiDetails={aiDetails}
              ticketDescription={ticketDescription}
              showDetailed
              getCategoryName={getCategoryName}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}
