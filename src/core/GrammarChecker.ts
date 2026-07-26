/**
 * Local Grammar Checker using compromise NLP library
 * Provides offline grammar analysis and corrections
 */

import { GrammarIssue, AnalysisResult } from '../types';

declare const nlp: any; // compromise NLP library

export class GrammarChecker {
  private commonErrors: Map<RegExp, { message: string; suggestion: string }> = new Map();

  constructor() {
    this.initializeCommonErrorPatterns();
  }

  private initializeCommonErrorPatterns(): void {
    // Common grammar patterns
    this.commonErrors.set(
      /\b(their)\s+(is|are|was|were)\b/gi,
      { message: 'Incorrect usage of "their" with verb', suggestion: 'Use "they" instead' }
    );

    this.commonErrors.set(
      /\b(its)\s+a\b/gi,
      { message: '"its" should be "it\'s"', suggestion: 'Use "it\'s" (it is)' }
    );

    this.commonErrors.set(
      /\b(your)\s+(going|coming|running)\b/gi,
      { message: '"your" should be "you\'re"', suggestion: 'Use "you\'re" (you are)' }
    );

    this.commonErrors.set(
      /\b(a)\s+([aeiou])/gi,
      { message: 'Use "an" before vowels', suggestion: 'Use "an" instead of "a"' }
    );

    this.commonErrors.set(
      /\b(affect)\s+(on|to)\b/gi,
      { message: 'Use "effect" (noun)', suggestion: 'Did you mean "effect"?' }
    );

    this.commonErrors.set(
      /\b(than)\s+(me|him|her)\b/gi,
      { message: 'Incorrect pronoun usage', suggestion: 'Use nominative pronoun (I, he, she)' }
    );

    this.commonErrors.set(
      /\b(who)\s+(did|does|have|has)\b/gi,
      { message: 'Use "whom" for object', suggestion: 'Consider using "whom"' }
    );
  }

  public analyzeGrammar(text: string): GrammarIssue[] {
    const issues: GrammarIssue[] = [];
    let id = 0;

    // Check common error patterns
    for (const [pattern, { message, suggestion }] of this.commonErrors) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        issues.push({
          id: `issue-${id++}`,
          text: match[0],
          type: 'grammar',
          startIndex: match.index!,
          endIndex: match.index! + match[0].length,
          message,
          severity: 'error',
          suggestions: [suggestion],
        });
      }
    }

    // Check punctuation issues
    issues.push(...this.checkPunctuation(text, id));

    // Check spelling (basic)
    issues.push(...this.checkSpelling(text, issues.length));

    return issues;
  }

  private checkPunctuation(text: string, startId: number): GrammarIssue[] {
    const issues: GrammarIssue[] = [];
    let id = startId;

    // Multiple spaces
    const multiSpaceRegex = /  +/g;
    let match;
    while ((match = multiSpaceRegex.exec(text)) !== null) {
      issues.push({
        id: `issue-${id++}`,
        text: match[0],
        type: 'punctuation',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        message: 'Multiple spaces detected',
        severity: 'warning',
        suggestions: [' '],
      });
    }

    // Comma before conjunction without subject
    const misplacedCommaRegex = /,\s+(and|or|but)\s+\b(?!.*\b(and|or|but)\b)/g;
    const commaMatches = text.match(misplacedCommaRegex);
    if (commaMatches) {
      for (const commaMatch of commaMatches) {
        const idx = text.indexOf(commaMatch);
        issues.push({
          id: `issue-${id++}`,
          text: commaMatch,
          type: 'punctuation',
          startIndex: idx,
          endIndex: idx + commaMatch.length,
          message: 'Consider removing comma before conjunction',
          severity: 'info',
          suggestions: [commaMatch.substring(1)],
        });
      }
    }

    return issues;
  }

  private checkSpelling(text: string, startId: number): GrammarIssue[] {
    const issues: GrammarIssue[] = [];
    
    // Basic spelling: commonly misspelled words
    const misspellings: Record<RegExp, { message: string; suggestion: string }> = {
      /\b(recieve)\b/gi: {
        message: 'Misspelled word',
        suggestion: 'receive',
      },
      /\b(occured)\b/gi: {
        message: 'Misspelled word',
        suggestion: 'occurred',
      },
      /\b(seperate)\b/gi: {
        message: 'Misspelled word',
        suggestion: 'separate',
      },
      /\b(definately)\b/gi: {
        message: 'Misspelled word',
        suggestion: 'definitely',
      },
      /\b(begining)\b/gi: {
        message: 'Misspelled word',
        suggestion: 'beginning',
      },
      /\b(maintainence)\b/gi: {
        message: 'Misspelled word',
        suggestion: 'maintenance',
      },
      /\b(sincerely|sincerly)\b/gi: {
        message: 'Misspelled word',
        suggestion: 'sincerely',
      },
    };

    let id = startId;
    for (const [pattern, { message, suggestion }] of Object.entries(misspellings)) {
      const regex = new RegExp(pattern);
      const matches = [...text.matchAll(new RegExp(pattern, 'gi'))];
      for (const match of matches) {
        issues.push({
          id: `issue-${id++}`,
          text: match[0],
          type: 'spelling',
          startIndex: match.index!,
          endIndex: match.index! + match[0].length,
          message,
          severity: 'error',
          suggestions: [suggestion],
        });
      }
    }

    return issues;
  }

  public getReadabilityScore(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const syllables = this.countSyllables(text);

    if (words === 0 || sentences === 0) return 0;

    // Flesch-Kincaid Grade Level
    const gradeLevel = (0.39 * (words / sentences)) + (11.8 * (syllables / words)) - 15.59;
    
    // Convert to readability score (0-100)
    return Math.max(0, Math.min(100, 100 - gradeLevel * 10));
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    let totalSyllables = 0;

    for (const word of words) {
      let count = 0;
      const vowels = word.match(/[aeiouy]/g) || [];
      count = vowels.length;

      // Adjust for silent e
      if (word.endsWith('e')) count--;
      // Adjust for double vowels
      if (word.match(/[aeiouy]{2}/)) count--;

      totalSyllables += Math.max(1, count);
    }

    return totalSyllables;
  }

  public getTextStatistics(text: string): {
    wordCount: number;
    sentenceCount: number;
    averageWordLength: number;
    averageSentenceLength: number;
  } {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const totalCharacters = words.join('').length;
    const totalWords = words.length;

    return {
      wordCount: totalWords,
      sentenceCount: Math.max(1, sentences.length),
      averageWordLength: totalCharacters / Math.max(1, totalWords),
      averageSentenceLength: totalWords / Math.max(1, sentences.length),
    };
  }
}
