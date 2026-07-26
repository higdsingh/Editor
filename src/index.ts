/**
 * Main entry point for the Editor AI Plugin
 */

export { PluginManager } from './PluginManager';
export { GrammarChecker } from './core/GrammarChecker';
export { SynonymEngine } from './core/SynonymEngine';
export { ContentGenerator } from './core/ContentGenerator';
export { AIProvider } from './ai/AIProvider';
export { PluginUI } from './ui/PluginUI';
export { EditorIntegration } from './integration/VanillaJS';

export type {
  AIModel,
  CorrectionMode,
  PluginSettings,
  GrammarIssue,
  SynonymSuggestion,
  ContentGenerationRequest,
  GeneratedContent,
  AnalysisResult,
  CorrectionResult,
  ArticleWritingRequest,
  ContentRewriteRequest,
  PluginAPI,
  PluginHooks,
} from './types';

// Plugin version
export const version = '1.0.0';
