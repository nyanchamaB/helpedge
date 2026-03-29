'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import { KeyPhrasesHighlight } from './KeyPhrasesHighlight';
import { HighlightedText } from './HighlightedText';
import { SimilarTicketsWidget } from './SimilarTicketsWidget';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ClassificationMethod } from '@/lib/types/ai';
import type { TicketAIDetails, SimilarTicket } from '@/lib/types/ai';
import { cn } from '@/lib/utils';

interface AIExplanationProps {
  aiDetails: TicketAIDetails;
  ticketDescription?: string;
  similarTickets?: SimilarTicket[];
  onSimilarTicketClick?: (ticketId: string) => void;
  showDetailed?: boolean;
  className?: string;
  getCategoryName?: (id: string) => string;
}

/**
 * Comprehensive AI classification explanation component
 * Displays confidence, method, key phrases, similar tickets, and reasoning
 */
export const AIExplanation: FC<AIExplanationProps> = ({
  aiDetails,
  ticketDescription,
  similarTickets = [],
  onSimilarTicketClick,
  showDetailed = true,
  className,
  getCategoryName,
}) => {
  const {
    method,
    needsReview,
    reasoning,
    finalConfidence,
    finalCategory,
    finalPriority,
    ruleBasedResult,
    mlResult,
    processingTimeMs,
  } = aiDetails;

  // Extract keywords from both rule-based and TF-IDF results
  const allKeywords = [
    ...(ruleBasedResult?.matchedKeywords || []),
    ...(mlResult?.topFeatures || []),
  ];
  const uniqueKeywords = Array.from(new Set(allKeywords));

  // Build scores object (for now, assign equal scores; can be enhanced with actual TF-IDF scores)
  const keywordScores = uniqueKeywords.reduce(
    (acc, keyword, index) => {
      // Assign higher scores to earlier keywords (they're typically more important)
      acc[keyword] = Math.max(0.3, 1 - index * 0.1);

      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Confidence Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">AI Classification Confidence</CardTitle>
              <p className="text-sm text-muted-foreground">
                How confident the AI is about this classification
              </p>
            </div>
            {finalConfidence !== undefined && (
              <ConfidenceBadge
                confidence={finalConfidence}
                method={method}
                needsReview={needsReview}
                size="lg"
                showLabel
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {finalConfidence !== undefined && (
            <ConfidenceMeter
              confidence={finalConfidence}
              label="Overall Confidence"
              showPercentage
              size="lg"
            />
          )}

          {/* Status Alert */}
          {needsReview ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Manual review recommended.</strong> The AI classification has low confidence
                and should be verified by an agent.
              </AlertDescription>
            </Alert>
          ) : finalConfidence && finalConfidence >= 0.8 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>High confidence classification.</strong> The AI is confident about this
                categorization.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Moderate confidence.</strong> Consider reviewing the AI suggestion.
              </AlertDescription>
            </Alert>
          )}

          {/* Classification Results */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium shrink-0">Category</span>
              <span className="text-sm text-right">
                {finalCategory
                  ? getCategoryName
                    ? getCategoryName(finalCategory)
                    : finalCategory
                  : 'Unknown'}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Priority</span>
              <span className="text-sm">{finalPriority || 'Unknown'}</span>
            </div>
            {processingTimeMs != null && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing Time</span>
                  <span className="text-sm text-muted-foreground">{processingTimeMs}ms</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Phrases */}
      {uniqueKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Phrases</CardTitle>
            <p className="text-sm text-muted-foreground">
              Important keywords that influenced the AI decision
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <KeyPhrasesHighlight keywords={uniqueKeywords} scores={keywordScores} />

            {ticketDescription && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Highlighted in Description:</p>
                <div className="rounded-lg bg-muted p-4">
                  <HighlightedText
                    text={ticketDescription}
                    keywords={uniqueKeywords}
                    className="text-sm leading-relaxed"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Natural Language Explanation */}
      {reasoning && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Reasoning</CardTitle>
            <p className="text-sm text-muted-foreground">Why the AI made this classification</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{reasoning}</p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results (Rule-based, TF-IDF, CBR) */}
      {showDetailed && (ruleBasedResult || mlResult) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              Breakdown of rule-based and TF-IDF predictions
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {ruleBasedResult && (
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Rule-Based Analysis</h4>
                  <ConfidenceBadge
                    confidence={ruleBasedResult.confidence}
                    method={ClassificationMethod.RuleBased}
                    size="sm"
                    showLabel={false}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  {ruleBasedResult.category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{ruleBasedResult.category}</span>
                    </div>
                  )}
                  {ruleBasedResult.priority && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <span className="font-medium">{ruleBasedResult.priority}</span>
                    </div>
                  )}
                  {ruleBasedResult.reasoning && (
                    <p className="text-muted-foreground mt-2">{ruleBasedResult.reasoning}</p>
                  )}
                </div>
              </div>
            )}

            {mlResult && (
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">TF-IDF Analysis</h4>
                  <ConfidenceBadge
                    confidence={mlResult.confidence}
                    method={ClassificationMethod.MachineLearning}
                    size="sm"
                    showLabel={false}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  {mlResult.category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{mlResult.category}</span>
                    </div>
                  )}
                  {mlResult.allPredictions && mlResult.allPredictions.length > 1 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-muted-foreground text-xs font-medium">
                        Alternative Categories:
                      </p>
                      {mlResult.allPredictions.slice(1, 4).map((pred) => (
                        <div
                          key={pred.category}
                          className="flex items-center justify-between text-xs"
                        >
                          <span>{pred.category}</span>
                          <span className="text-muted-foreground">
                            {(pred.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Similar Tickets */}
      {similarTickets.length > 0 && (
        <SimilarTicketsWidget
          tickets={similarTickets}
          onTicketClick={onSimilarTicketClick}
          maxDisplay={5}
        />
      )}
    </div>
  );
};
