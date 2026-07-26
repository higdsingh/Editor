/**
 * AI Provider - Manages communication with different AI models
 * Supports OpenAI, Google Gemini, Claude, and falls back to local processing
 */

import { AIModel, ContentGenerationRequest, GeneratedContent } from '../types';
import axios, { AxiosInstance } from 'axios';

export class AIProvider {
  private model: AIModel;
  private apiKey?: string;
  private apiEndpoint?: string;
  private client: AxiosInstance | null = null;
  private isOnlineMode: boolean = true;

  constructor(model: AIModel, apiKey?: string, endpoint?: string) {
    this.model = model;
    this.apiKey = apiKey;
    this.apiEndpoint = endpoint;
    this.initializeClient();
  }

  private initializeClient(): void {
    if (this.model === 'local') {
      this.isOnlineMode = false;
      return;
    }

    if (!this.apiKey) {
      console.warn(`AI model ${this.model} selected but no API key provided. Falling back to local mode.`);
      this.isOnlineMode = false;
      this.model = 'local';
      return;
    }

    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
  }

  public async correctText(text: string): Promise<string> {
    if (!this.isOnlineMode || this.model === 'local') {
      return this.correctTextLocal(text);
    }

    try {
      const prompt = `Please correct the following text for grammar, spelling, and punctuation errors. Return only the corrected text without any explanation.\n\nText: ${text}`;
      return await this.callAI(prompt);
    } catch (error) {
      console.warn('AI correction failed, falling back to local:', error);
      return this.correctTextLocal(text);
    }
  }

  public async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    if (!this.isOnlineMode || this.model === 'local') {
      return this.generateContentLocal(request);
    }

    try {
      const prompt = this.buildGenerationPrompt(request);
      const generated = await this.callAI(prompt, request.maxTokens);

      return {
        original: request.text,
        generated,
        type: request.type,
        tokens: Math.ceil(generated.length / 4), // Rough estimate
        confidence: 0.85,
      };
    } catch (error) {
      console.warn('AI generation failed, falling back to local:', error);
      return this.generateContentLocal(request);
    }
  }

  public async improveContent(text: string, instructions?: string): Promise<string> {
    if (!this.isOnlineMode || this.model === 'local') {
      return this.improveContentLocal(text, instructions);
    }

    try {
      const prompt = `Improve the following text. ${instructions ? `Instructions: ${instructions}` : 'Make it clearer, more engaging, and better structured.'}\n\nText: ${text}`;
      return await this.callAI(prompt);
    } catch (error) {
      console.warn('AI improvement failed, falling back to local:', error);
      return this.improveContentLocal(text, instructions);
    }
  }

  public async writeArticle(title: string, topic: string, sections: number = 3): Promise<string> {
    if (!this.isOnlineMode || this.model === 'local') {
      return this.writeArticleLocal(title, topic, sections);
    }

    try {
      const prompt = `Write a comprehensive article about "${topic}" with the title "${title}". Include ${sections} main sections with clear headings and detailed content for each section.`;
      return await this.callAI(prompt, 2000);
    } catch (error) {
      console.warn('AI article writing failed, falling back to local:', error);
      return this.writeArticleLocal(title, topic, sections);
    }
  }

  private async callAI(prompt: string, maxTokens?: number): Promise<string> {
    if (!this.client) {
      throw new Error('AI client not initialized');
    }

    try {
      let response;

      switch (this.model) {
        case 'openai':
          response = await this.client.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens || 500,
            temperature: 0.7,
          });
          return response.data.choices[0].message.content;

        case 'gemini':
          response = await this.client.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
            {
              contents: [{ parts: [{ text: prompt }] }],
            }
          );
          return response.data.candidates[0].content.parts[0].text;

        case 'claude':
          response = await this.client.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-3-sonnet-20240229',
            max_tokens: maxTokens || 500,
            messages: [{ role: 'user', content: prompt }],
          });
          return response.data.content[0].text;

        default:
          throw new Error(`Unsupported AI model: ${this.model}`);
      }
    } catch (error) {
      throw new Error(`Failed to call AI API: ${error}`);
    }
  }

  private correctTextLocal(text: string): string {
    // Basic local corrections
    let corrected = text;
    corrected = corrected.replace(/\s+/g, ' '); // Multiple spaces
    corrected = corrected.replace(/([.!?])\s*([A-Z])/g, '$1 $2'); // Fix spacing after punctuation
    corrected = corrected.replace(/\b(it's|thats|wheres)\b/gi, (match) => {
      const map: Record<string, string> = {
        "it's": "it's",
        "thats": "that's",
        "wheres": "where's",
      };
      return map[match.toLowerCase()] || match;
    });
    return corrected.trim();
  }

  private generateContentLocal(request: ContentGenerationRequest): GeneratedContent {
    let generated = '';

    switch (request.type) {
      case 'complete':
        generated = request.text + ' [Local: Content completion requires an AI model]';
        break;
      case 'expand':
        generated = request.text + ' ' + request.text; // Simple duplication
        break;
      case 'summarize':
        generated = request.text.substring(0, Math.floor(request.text.length / 2));
        break;
      case 'rewrite':
        generated = this.rewriteLocal(request.text);
        break;
      case 'improve':
        generated = this.improveContentLocal(request.text);
        break;
    }

    return {
      original: request.text,
      generated,
      type: request.type,
      tokens: Math.ceil(generated.length / 4),
      confidence: 0.5,
    };
  }

  private improveContentLocal(text: string, instructions?: string): string {
    let improved = text;
    improved = improved.replace(/\s+/g, ' ');
    improved = improved.replace(/([.!?])([a-z])/g, '$1 $2');
    improved = this.rewriteLocal(improved);
    return improved.trim();
  }

  private rewriteLocal(text: string): string {
    // Simple rewrite: restructure sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    return sentences.reverse().join('. ') + '.';
  }

  private writeArticleLocal(title: string, topic: string, sections: number): string {
    const article = `# ${title}\n\n`;
    const content = Array(sections)
      .fill(null)
      .map((_, i) => `## Section ${i + 1}\n\nThis section discusses ${topic}. [Content generated locally requires an AI model for full functionality.]`)
      .join('\n\n');
    return article + content;
  }

  private buildGenerationPrompt(request: ContentGenerationRequest): string {
    let prompt = `${request.type.toUpperCase()}: ${request.text}`;
    if (request.context) prompt += `\n\nContext: ${request.context}`;
    if (request.instructions) prompt += `\n\nInstructions: ${request.instructions}`;
    if (request.tone) prompt += `\n\nTone: ${request.tone}`;
    return prompt;
  }

  public isOnline(): boolean {
    return this.isOnlineMode;
  }

  public getCurrentModel(): AIModel {
    return this.model;
  }

  public async validateConnection(): Promise<boolean> {
    if (!this.isOnlineMode) return false;
    try {
      const testPrompt = 'Test';
      await this.callAI(testPrompt);
      return true;
    } catch {
      return false;
    }
  }
}
