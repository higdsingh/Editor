/**
 * Core type definitions for the AI Grammar & Content Plugin
 */

export type AIModel = 'openai' | 'gemini' | 'claude' | 'local';

export type CorrectionMode = 'manual' | 'automatic' | 'suggestion';

export interface PluginSettings {
  // AI Model Configuration
  aiModel: AIModel;
  apiKey?: string;
  apiEndpoint?: string;
  modelName?: string;

  // Grammar & Correction
  correctionMode: CorrectionMode;
  autoCorrect: boolean;
  showSuggestions: boolean;
  grammarStrictness: 'relaxed' | 'standard' | 'strict';

  // Language & Style
  language: string;
  dialect: string;
  tone: 'formal' | 'casual' | 'professional' | 'creative';
  readabilityLevel: 'beginner' | 'intermediate' | 'advanced';

  // Features
  enableSynonymSuggestions: boolean;
  enableContentGeneration: boolean;
  enableOfflineMode: boolean;
  offlineLimitationsWarning: boolean;

  // Performance
  debounceDelay: number;
  batchProcessing: boolean;
}

export interface GrammarIssue {
  id: string;
  text: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
  startIndex: number;
  endIndex: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestions: string[];
  category?: string;
  rule?: string;
}

export interface SynonymSuggestion {
  word: string;
  synonyms: string[];
  partOfSpeech: string;
  confidence: number;
}

export interface ContentGenerationRequest {
  type: 'complete' | 'expand' | 'summarize' | 'rewrite' | 'improve';
  text: string;
  context?: string;
  tone?: string;
  maxTokens?: number;
  instructions?: string;
}

export interface GeneratedContent {
  original: string;
  generated: string;
  type: string;
  tokens: number;
  confidence: number;
}

export interface AnalysisResult {
  originalText: string;
  issues: GrammarIssue[];
  readabilityScore: number;
  wordCount: number;
  sentenceCount: number;
  averageWordLength: number;
  suggestions: string[];
  processedWithAI: boolean;
}

export interface CorrectionResult {
  original: string;
  corrected: string;
  changes: Array<{
    type: string;
    original: string;
    corrected: string;
    reason: string;
  }>;
}

export interface ArticleWritingRequest {
  title: string;
  topic: string;
  outline?: string[];
  tone: string;
  sections?: number;
  wordCountTarget?: number;
  style?: string;
  references?: string[];
}

export interface ContentRewriteRequest {
  content: string;
  purpose: 'clarity' | 'conciseness' | 'engagement' | 'formality' | 'simplification';
  tone?: string;
  targetAudience?: string;
  preserveLength?: boolean;
}

export interface PluginAPI {
  // Grammar & Analysis
  analyzeText(text: string): Promise<AnalysisResult>;
  getGrammarIssues(text: string): Promise<GrammarIssue[]>;
  correctText(text: string): Promise<CorrectionResult>;
  autoCorrectText(text: string): string;

  // Synonyms & Vocabulary
  getSynonymSuggestions(word: string): Promise<SynonymSuggestion[]>;
  findBetterWords(text: string): Promise<Map<string, string[]>>;

  // Content Generation & Improvement
  generateContent(request: ContentGenerationRequest): Promise<GeneratedContent>;
  writeArticle(request: ArticleWritingRequest): Promise<string>;
  rewriteContent(request: ContentRewriteRequest): Promise<string>;
  improveContent(text: string, instructions?: string): Promise<string>;

  // Settings & Configuration
  getSettings(): PluginSettings;
  updateSettings(settings: Partial<PluginSettings>): Promise<void>;
  getAvailableModels(): Promise<AIModel[]>;
  validateAPIKey(model: AIModel, key: string): Promise<boolean>;

  // Offline & Local Processing
  isOfflineMode(): boolean;
  getOfflineLimitations(): string[];
}

export interface PluginHooks {
  onTextChange?(text: string): void;
  onIssueFound?(issue: GrammarIssue): void;
  onCorrection?(result: CorrectionResult): void;
  onSettingsChange?(settings: PluginSettings): void;
  onError?(error: Error): void;
}
