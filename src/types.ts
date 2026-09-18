export type RelationshipType =
  | 'Parent / Family'
  | 'Partner'
  | 'Friend'
  | 'Roommate'
  | 'Professor / Advisor'
  | 'Manager / Coworker'
  | 'Other';

export type Tone = 'Warm' | 'Calm' | 'Direct' | 'Formal';
export type Length = 'Short' | 'Medium' | 'Detailed';
export type Format = 'Text Message' | 'Email' | 'Letter';
export type DraftMode = 'Balanced' | 'More Empathetic' | 'More Direct';

export interface MessageContext {
  id: string;
  recipientName: string;
  relationship: string;
  situations: string[];
  customSituation: string;
  goals: string[];
  customGoal: string;
  userContext: string;
  shouldNotImply: string;
  tone: Tone;
  length: Length;
  format: Format;
  createdAt: number;
  updatedAt: number;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  reason: string;
}

export interface ClarificationState {
  questions: ClarificationQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  isComplete: boolean;
  isChecking: boolean;
}

export interface Revision {
  id: string;
  versionNumber: number;
  content: string;
  mode: DraftMode;
  timestamp: number;
  label?: string;
}

export interface AssumptionItem {
  id: string;
  originalText: string;
  category:
    | 'unsupported_emotion'
    | 'unsupported_motive'
    | 'unsupported_event'
    | 'recipient_assumption'
    | 'unsupported_responsibility'
    | 'unsupported_commitment';
  categoryLabel: string;
  explanation: string;
  neutralReplacement: string;
}

export interface SupportedFactItem {
  id: string;
  statement: string;
  sourceContext: string;
}

export interface ResponsibilityDimension {
  title: string;
  scoreLabel: string;
  description: string;
  status: 'positive' | 'neutral' | 'attention';
}

export interface ResponsibilityBalanceResult {
  accountability: ResponsibilityDimension;
  boundary: ResponsibilityDimension;
  balance: ResponsibilityDimension;
  summary: string;
}

export interface AssumptionCheckResult {
  supportedByInput: SupportedFactItem[];
  possibleAssumptions: AssumptionItem[];
  responsibilityBalance: ResponsibilityBalanceResult;
  analyzedAt: number;
}

export interface SavedDraft {
  id: string;
  title: string;
  recipientName: string;
  context: MessageContext;
  currentDraft: string;
  activeMode: DraftMode;
  revisions: Revision[];
  assumptionCheckResult?: AssumptionCheckResult | null;
  lastModified: number;
}

export type ActiveTab = 'home' | 'new-message' | 'workspace' | 'drafts' | 'history' | 'settings';
