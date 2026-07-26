/**
 * Content Generator - Handles article writing, rewriting, and content improvement
 */

import { ArticleWritingRequest, ContentRewriteRequest, AIModel } from '../types';
import { AIProvider } from '../ai/AIProvider';

export class ContentGenerator {
  private aiProvider: AIProvider;

  constructor(aiProvider: AIProvider) {
    this.aiProvider = aiProvider;
  }

  public async writeArticle(request: ArticleWritingRequest): Promise<string> {
    const sections = request.sections || 3;
    return this.aiProvider.writeArticle(request.title, request.topic, sections);
  }

  public async rewriteContent(request: ContentRewriteRequest): Promise<string> {
    const instructions = this.buildRewriteInstructions(request);
    return this.aiProvider.improveContent(request.content, instructions);
  }

  public async improveContent(text: string, customInstructions?: string): Promise<string> {
    const instructions =
      customInstructions ||
      'Improve this content by enhancing clarity, readability, and engagement while maintaining the original meaning.';
    return this.aiProvider.improveContent(text, instructions);
  }

  private buildRewriteInstructions(request: ContentRewriteRequest): string {
    let instructions = `Rewrite the following content for ${request.purpose}. `;

    if (request.purpose === 'clarity') {
      instructions += 'Make it clearer and easier to understand.';
    } else if (request.purpose === 'conciseness') {
      instructions += 'Make it more concise and remove unnecessary words.';
    } else if (request.purpose === 'engagement') {
      instructions += 'Make it more engaging and interesting.';
    } else if (request.purpose === 'formality') {
      instructions += 'Make it more formal and professional.';
    } else if (request.purpose === 'simplification') {
      instructions += 'Simplify the language for a general audience.';
    }

    if (request.tone) instructions += ` Use a ${request.tone} tone.`;
    if (request.targetAudience) instructions += ` Target audience: ${request.targetAudience}.`;
    if (!request.preserveLength) instructions += ` Feel free to adjust the length as needed.`;

    return instructions;
  }

  public async generateOutline(topic: string, sections: number = 3): Promise<string[]> {
    // Local outline generation
    const outline: string[] = [];
    const subtopics = [
      `Introduction to ${topic}`,
      `Key aspects and features`,
      `Practical applications`,
      `Benefits and advantages`,
      `Challenges and considerations`,
      `Future trends`,
      `Conclusion and summary`,
    ];

    for (let i = 0; i < sections && i < subtopics.length; i++) {
      outline.push(subtopics[i]);
    }

    return outline;
  }

  public async expandSection(section: string, targetLength?: number): Promise<string> {
    const instructions =
      targetLength && targetLength > section.length
        ? `Expand this section to approximately ${targetLength} characters while maintaining quality.`
        : 'Expand this section with more details and examples.';

    return this.aiProvider.improveContent(section, instructions);
  }

  public async summarizeContent(text: string, maxLength?: number): Promise<string> {
    const instructions =
      maxLength && maxLength > 0
        ? `Summarize this content in approximately ${maxLength} characters.`
        : 'Provide a brief summary of the following content.';

    return this.aiProvider.improveContent(text, instructions);
  }
}
