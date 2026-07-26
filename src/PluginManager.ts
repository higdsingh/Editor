/**
 * Plugin Manager - Main orchestrator for the AI Grammar & Content Plugin
 * Manages all components and provides unified API
 */

import { PluginSettings, PluginAPI, PluginHooks, GrammarIssue, AnalysisResult, CorrectionResult, ContentGenerationRequest, GeneratedContent } from './types';
import { GrammarChecker } from './core/GrammarChecker';
import { SynonymEngine } from './core/SynonymEngine';
import { ContentGenerator } from './core/ContentGenerator';
import { AIProvider } from './ai/AIProvider';

export class PluginManager implements PluginAPI {
  private settings: PluginSettings;
  private grammarChecker: GrammarChecker;
  private synonymEngine: SynonymEngine;
  private aiProvider: AIProvider;
  private contentGenerator: ContentGenerator;
  private hooks: PluginHooks = {};
  private processingQueue: Set<string> = new Set();

  constructor(initialSettings?: Partial<PluginSettings>) {
    this.settings = this.getDefaultSettings();
    if (initialSettings) {
      this.settings = { ...this.settings, ...initialSettings };
    }

    // Initialize components
    this.grammarChecker = new GrammarChecker();
    this.synonymEngine = new SynonymEngine();
    this.aiProvider = new AIProvider(
      this.settings.aiModel,
      this.settings.apiKey,
      this.settings.apiEndpoint
    );
    this.contentGenerator = new ContentGenerator(this.aiProvider);
  }

  private getDefaultSettings(): PluginSettings {
    return {
      aiModel: 'local',
      correctionMode: 'suggestion',
      autoCorrect: false,
      showSuggestions: true,
      grammarStrictness: 'standard',
      language: 'en',
      dialect: 'en-US',
      tone: 'professional',
      readabilityLevel: 'intermediate',
      enableSynonymSuggestions: true,
      enableContentGeneration: true,
      enableOfflineMode: true,
      offlineLimitationsWarning: true,
      debounceDelay: 300,
      batchProcessing: false,
    };
  }

  // Grammar & Analysis
  public async analyzeText(text: string): Promise<AnalysisResult> {
    const issues = this.grammarChecker.analyzeGrammar(text);
    const stats = this.grammarChecker.getTextStatistics(text);
    const readabilityScore = this.grammarChecker.getReadabilityScore(text);

    return {
      originalText: text,
      issues,
      readabilityScore,
      wordCount: stats.wordCount,
      sentenceCount: stats.sentenceCount,
      averageWordLength: stats.averageWordLength,
      suggestions: this.generateSuggestions(issues),
      processedWithAI: this.aiProvider.isOnline(),
    };
  }

  public async getGrammarIssues(text: string): Promise<GrammarIssue[]> {
    const issues = this.grammarChecker.analyzeGrammar(text);
    for (const issue of issues) {
      this.hooks.onIssueFound?.(issue);
    }
    return issues;
  }

  public async correctText(text: string): Promise<CorrectionResult> {
    const corrected = await this.aiProvider.correctText(text);
    const changes: any[] = []; // Simplified change tracking

    const result: CorrectionResult = {
      original: text,
      corrected,
      changes,
    };

    this.hooks.onCorrection?.(result);
    return result;
  }

  public autoCorrectText(text: string): string {
    // Local auto-correction
    let corrected = text;
    corrected = corrected.replace(/\s+/g, ' ');
    corrected = corrected.replace(/([.!?])([a-z])/g, '$1 $2');
    return corrected.trim();
  }

  // Synonyms & Vocabulary
  public async getSynonymSuggestions(word: string) {
    const suggestion = await this.synonymEngine.getSynonyms(word);
    return suggestion?.synonyms || [];
  }

  public async findBetterWords(text: string): Promise<Map<string, string[]>> {
    return this.synonymEngine.findBetterWords(text);
  }

  // Content Generation & Improvement
  public async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    return this.aiProvider.generateContent(request);
  }

  public async writeArticle(request: any): Promise<string> {
    return this.contentGenerator.writeArticle(request);
  }

  public async rewriteContent(request: any): Promise<string> {
    return this.contentGenerator.rewriteContent(request);
  }

  public async improveContent(text: string, instructions?: string): Promise<string> {
    return this.contentGenerator.improveContent(text, instructions);
  }

  // Settings & Configuration
  public getSettings(): PluginSettings {
    return { ...this.settings };
  }

  public async updateSettings(newSettings: Partial<PluginSettings>): Promise<void> {
    const oldSettings = { ...this.settings };
    this.settings = { ...this.settings, ...newSettings };

    // Reinitialize AI provider if model changed
    if (newSettings.aiModel && newSettings.aiModel !== oldSettings.aiModel) {
      this.aiProvider = new AIProvider(
        newSettings.aiModel,
        newSettings.apiKey,
        newSettings.apiEndpoint
      );
      this.contentGenerator = new ContentGenerator(this.aiProvider);
    }

    this.hooks.onSettingsChange?.(this.settings);
  }

  public async getAvailableModels(): Promise<any[]> {
    return ['local', 'openai', 'gemini', 'claude'];
  }

  public async validateAPIKey(model: string, key: string): Promise<boolean> {
    const testProvider = new AIProvider(model as any, key);
    return testProvider.validateConnection();
  }

  // Offline & Local Processing
  public isOfflineMode(): boolean {
    return !this.aiProvider.isOnline();
  }

  public getOfflineLimitations(): string[] {
    return [
      'Grammar checking: Basic patterns only',
      'Synonym suggestions: Limited offline dictionary',
      'Content generation: Templates only, no AI enhancement',
      'Article writing: Outline generation only',
      'Spell checking: Common misspellings only',
    ];
  }

  // Hooks
  public registerHooks(hooks: PluginHooks): void {
    this.hooks = { ...this.hooks, ...hooks };
  }

  private generateSuggestions(issues: GrammarIssue[]): string[] {
    return issues.slice(0, 3).map(issue => `${issue.type}: ${issue.message}`);
  }
}
