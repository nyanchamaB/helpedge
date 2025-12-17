/**
 * AI Classification and Explainability Type Definitions
 * Based on backend DTOs from HelpEdge API
 */

// ============================================
// Enums
// ============================================

export enum ClassificationMethod {
  RuleBased = 'RuleBased',
  MachineLearning = 'MachineLearning',
  Hybrid = 'Hybrid',
  Manual = 'Manual',
}

export enum OverrideType {
  Category = 'Category',
  Priority = 'Priority',
  Assignee = 'Assignee',
  Multiple = 'Multiple',
}

// ============================================
// AI Classification Details
// ============================================

export interface TicketAIDetails {
  ticketId: string;
  method: ClassificationMethod;
  needsReview?: boolean;
  reasoning?: string;
  finalConfidence?: number;
  finalCategory?: string;
  finalPriority?: string;
  finalAssignee?: string;
  ruleBasedResult?: RuleBasedResult;
  mlResult?: MLPredictionResult;
  processingTimeMs?: number;
  classifiedAt?: string;
}

export interface RuleBasedResult {
  category?: string;
  priority?: string;
  assignee?: string;
  confidence: number;
  matchedKeywords?: string[];
  matchedRules?: string[];
  reasoning?: string;
}

export interface MLPredictionResult {
  category?: string;
  priority?: string;
  confidence: number;
  allPredictions?: CategoryPrediction[];
  topFeatures?: string[];
  modelVersion?: string;
}

export interface CategoryPrediction {
  category: string;
  probability: number;
}

// ============================================
// Performance Metrics
// ============================================

export interface AIPerformanceMetrics {
  totalClassifications: number;
  classificationsWithOutcome: number;
  overallAccuracy: number;
  categoryAccuracy: number;
  priorityAccuracy: number;
  assigneeAccuracy: number;
  automationRate: number;
  overrideRate: number;
  approvalRate: number;
  reviewRate: number;
  averageProcessingTimeMs: number;
  averageConfidence: number;
  performanceByMethod?: Record<string, MethodPerformance>;
  startDate: string;
  endDate: string;
}

export interface MethodPerformance {
  method: string;
  count: number;
  accuracy: number;
  averageConfidence: number;
  averageProcessingTimeMs: number;
}

export interface CategoryPerformance {
  category: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  averageConfidence: number;
  confusionMatrix?: Record<string, number>;
}

export interface ConfusionMatrix {
  categories: string[];
  matrix: number[][];
  totalPredictions: number;
  accuracy: number;
}

// ============================================
// AI Performance Logs
// ============================================

export interface AIPerformanceLog {
  id: string;
  ticketId: string;
  ticketNumber?: string;
  method: ClassificationMethod;
  confidence: number;
  processingTimeMs: number;
  predictedCategory?: string;
  actualCategory?: string;
  predictedPriority?: string;
  actualPriority?: string;
  wasOverridden: boolean;
  overrideType?: OverrideType;
  overrideReason?: string;
  classifiedAt: string;
  outcomeRecordedAt?: string;
}

// ============================================
// Override & Feedback
// ============================================

export interface OverrideRequest {
  correctCategory?: string;
  correctPriority?: string;
  correctAssignee?: string;
  reason?: string;
}

export interface OverrideRecord {
  id: string;
  ticketId: string;
  ticketNumber?: string;
  originalCategory?: string;
  correctedCategory?: string;
  originalPriority?: string;
  correctedPriority?: string;
  originalAssignee?: string;
  correctedAssignee?: string;
  overrideType: OverrideType;
  reason?: string;
  correctedBy: string;
  correctedByName?: string;
  overriddenAt: string;
}

// ============================================
// Review Queue
// ============================================

export interface ReviewQueueTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  aiCategory?: string;
  aiPriority?: string;
  aiAssignee?: string;
  aiConfidence?: number;
  aiMethod?: ClassificationMethod;
  createdAt: string;
  createdBy?: string;
  queuedAt: string;
}

export interface ReviewQueueStats {
  totalInQueue: number;
  averageConfidence: number;
  oldestTicketAge: number;
  byCategory?: Record<string, number>;
  byPriority?: Record<string, number>;
}

// ============================================
// ML Model Management
// ============================================

export interface MLModel {
  id: string;
  version: string;
  trainingDate: string;
  accuracy: number;
  trainingExamplesCount: number;
  testExamplesCount: number;
  isActive: boolean;
  notes?: string;
  modelPath?: string;
  metadata?: Record<string, any>;
}

export interface MLModelStats {
  totalModels: number;
  activeModel?: MLModel;
  latestModel?: MLModel;
  trainingDataCount: number;
  averageAccuracy: number;
  retrainingEligible: boolean;
  retrainingStats?: RetrainingStats;
}

export interface RetrainingStats {
  newVerifiedExamples: number;
  overridesLast30Days: number;
  currentAccuracy: number;
  isEligible: boolean;
  reason?: string;
}

export interface RetrainingRequest {
  useVerifiedDataOnly?: boolean;
  minConfidenceThreshold?: number;
  notes?: string;
}

export interface RetrainingResult {
  success: boolean;
  newModelId?: string;
  newModelVersion?: string;
  accuracy?: number;
  improvementPercent?: number;
  wasActivated: boolean;
  message?: string;
}

// ============================================
// Training Data
// ============================================

export interface TrainingData {
  id: string;
  ticketId?: string;
  ticketNumber?: string;
  description: string;
  subject?: string;
  actualCategory: string;
  actualPriority?: string;
  actualAssignee?: string;
  isVerified: boolean;
  source: TrainingDataSource;
  createdAt: string;
  metadata?: Record<string, any>;
}

export enum TrainingDataSource {
  Override = 'Override',
  Approval = 'Approval',
  Manual = 'Manual',
  Import = 'Import',
}

export interface TrainingDataStats {
  totalCount: number;
  verifiedCount: number;
  bySource?: Record<string, number>;
  byCategory?: Record<string, number>;
  oldestExample?: string;
  newestExample?: string;
  balanceScore?: number;
}

export interface BulkTrainingDataRequest {
  examples: {
    description: string;
    subject?: string;
    category: string;
    priority?: string;
    assignee?: string;
  }[];
  source: TrainingDataSource;
}

// ============================================
// Analytics & Reporting
// ============================================

export interface AIAnalyticsFilter {
  startDate?: string;
  endDate?: string;
  method?: ClassificationMethod;
  category?: string;
  minConfidence?: number;
  maxConfidence?: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface AccuracyTrend {
  dates: string[];
  ruleBasedAccuracy: number[];
  mlAccuracy: number[];
  hybridAccuracy: number[];
  overallAccuracy: number[];
}

// ============================================
// Notifications
// ============================================

export interface AINotification {
  id: string;
  type: AINotificationType;
  title: string;
  message: string;
  ticketId?: string;
  ticketNumber?: string;
  modelId?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export enum AINotificationType {
  LowConfidence = 'LowConfidence',
  ReviewQueueAlert = 'ReviewQueueAlert',
  ModelRetrained = 'ModelRetrained',
  OverrideRecorded = 'OverrideRecorded',
  TrainingDataAdded = 'TrainingDataAdded',
}

// ============================================
// User Preferences
// ============================================

export interface AIUserPreferences {
  showExplanations: ExplanationDisplayMode;
  autoApproveThreshold?: number;
  detailLevel: ExplanationDetailLevel;
  enableNotifications: boolean;
  notificationTypes: AINotificationType[];
}

export enum ExplanationDisplayMode {
  Always = 'Always',
  LowConfidenceOnly = 'LowConfidenceOnly',
  Never = 'Never',
}

export enum ExplanationDetailLevel {
  Simple = 'Simple',
  Detailed = 'Detailed',
  Technical = 'Technical',
}

// ============================================
// UI Component Props
// ============================================

export interface ConfidenceVisualizationProps {
  confidence: number;
  method: ClassificationMethod;
  needsReview?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export interface KeyPhrasesHighlightProps {
  keywords: string[];
  text: string;
  scores?: Record<string, number>;
}

export interface SimilarTicket {
  ticketId: string;
  ticketNumber: string;
  description: string;
  category: string;
  priority: string;
  similarity: number;
  resolvedAt?: string;
  resolutionTime?: number;
}

export interface SimilarTicketsProps {
  tickets: SimilarTicket[];
  onTicketClick?: (ticketId: string) => void;
  maxDisplay?: number;
}
