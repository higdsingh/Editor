/**
 * Synonym Engine - Provides word alternatives and vocabulary enhancement
 * Uses offline dictionary and can connect to online thesaurus APIs
 */

import { SynonymSuggestion } from '../types';

export class SynonymEngine {
  private synonymDictionary: Map<string, SynonymSuggestion> = new Map();
  private wordCache: Map<string, SynonymSuggestion[]> = new Map();

  constructor() {
    this.initializeSynonymDictionary();
  }

  private initializeSynonymDictionary(): void {
    // Basic offline synonym dictionary
    const synonyms: Record<string, string[]> = {
      'good': ['excellent', 'great', 'fantastic', 'wonderful', 'outstanding', 'fine'],
      'bad': ['poor', 'terrible', 'awful', 'dreadful', 'inferior', 'unsuitable'],
      'big': ['large', 'huge', 'enormous', 'vast', 'substantial', 'immense'],
      'small': ['tiny', 'little', 'compact', 'minute', 'diminutive', 'slight'],
      'happy': ['joyful', 'cheerful', 'delighted', 'pleased', 'content', 'thrilled'],
      'sad': ['unhappy', 'melancholy', 'sorrowful', 'dejected', 'gloomy', 'miserable'],
      'fast': ['quick', 'rapid', 'swift', 'speedy', 'brisk', 'hasty'],
      'slow': ['sluggish', 'gradual', 'leisurely', 'lagging', 'tardy', 'unhurried'],
      'beautiful': ['lovely', 'gorgeous', 'stunning', 'attractive', 'handsome', 'elegant'],
      'ugly': ['hideous', 'unsightly', 'unattractive', 'repulsive', 'displeasing'],
      'important': ['significant', 'crucial', 'essential', 'vital', 'critical', 'paramount'],
      'unimportant': ['trivial', 'minor', 'insignificant', 'negligible', 'inconsequential'],
      'start': ['begin', 'commence', 'initiate', 'launch', 'establish', 'open'],
      'end': ['finish', 'conclude', 'terminate', 'complete', 'close', 'cease'],
      'help': ['assist', 'aid', 'support', 'facilitate', 'benefit', 'serve'],
      'show': ['display', 'demonstrate', 'reveal', 'exhibit', 'present', 'indicate'],
      'tell': ['say', 'inform', 'communicate', 'express', 'narrate', 'disclose'],
      'increase': ['grow', 'expand', 'amplify', 'enhance', 'elevate', 'boost'],
      'decrease': ['reduce', 'diminish', 'lower', 'decline', 'shrink', 'lessen'],
      'different': ['distinct', 'varied', 'diverse', 'dissimilar', 'unique', 'unlike'],
      'same': ['identical', 'similar', 'equivalent', 'matching', 'alike', 'comparable'],
      'think': ['believe', 'suppose', 'consider', 'imagine', 'reflect', 'ponder'],
      'want': ['desire', 'wish', 'crave', 'yearn', 'seek', 'need'],
      'give': ['provide', 'offer', 'grant', 'donate', 'distribute', 'supply'],
      'get': ['obtain', 'acquire', 'receive', 'retrieve', 'attain', 'secure'],
      'take': ['seize', 'grab', 'capture', 'choose', 'accept', 'claim'],
      'go': ['proceed', 'travel', 'move', 'advance', 'depart', 'leave'],
      'come': ['arrive', 'approach', 'reach', 'emerge', 'return', 'appear'],
      'make': ['create', 'produce', 'construct', 'manufacture', 'build', 'craft'],
      'do': ['perform', 'execute', 'accomplish', 'undertake', 'complete', 'conduct'],
      'say': ['state', 'mention', 'remark', 'declare', 'utter', 'note'],
      'see': ['observe', 'view', 'witness', 'notice', 'perceive', 'spot'],
      'know': ['understand', 'comprehend', 'realize', 'recognize', 'aware', 'familiar'],
      'like': ['enjoy', 'appreciate', 'admire', 'prefer', 'favor', 'relish'],
      'love': ['adore', 'cherish', 'treasure', 'passionate', 'devoted', 'affectionate'],
      'hate': ['despise', 'detest', 'abhor', 'loathe', 'dislike', 'resent'],
    };

    for (const [word, synList] of Object.entries(synonyms)) {
      this.synonymDictionary.set(word.toLowerCase(), {
        word,
        synonyms: synList,
        partOfSpeech: this.detectPartOfSpeech(word),
        confidence: 0.95,
      });
    }
  }

  private detectPartOfSpeech(word: string): string {
    // Simple POS detection
    const word_lower = word.toLowerCase();

    // Adverbs ending in -ly
    if (word_lower.endsWith('ly')) return 'adverb';

    // Verbs (simplified)
    const verbEndings = ['ate', 'ify', 'ize', 'ise'];
    if (verbEndings.some(ending => word_lower.endsWith(ending))) return 'verb';

    // Adjectives ending in -ful, -less, -ous, -ible, -able
    const adjEndings = ['ful', 'less', 'ous', 'ible', 'able', 'ive'];
    if (adjEndings.some(ending => word_lower.endsWith(ending))) return 'adjective';

    // Nouns ending in -tion, -sion, -ment, -ness
    const nounEndings = ['tion', 'sion', 'ment', 'ness'];
    if (nounEndings.some(ending => word_lower.endsWith(ending))) return 'noun';

    return 'noun'; // default
  }

  public async getSynonyms(word: string, limit: number = 6): Promise<SynonymSuggestion | null> {
    const normalizedWord = word.toLowerCase().trim();

    // Check cache first
    if (this.wordCache.has(normalizedWord)) {
      return this.convertToSuggestion(
        this.synonymDictionary.get(normalizedWord) || null,
        limit
      );
    }

    // Check dictionary
    const suggestion = this.synonymDictionary.get(normalizedWord);
    if (suggestion) {
      this.wordCache.set(normalizedWord, [suggestion]);
      return this.convertToSuggestion(suggestion, limit);
    }

    return null;
  }

  private convertToSuggestion(
    suggestion: SynonymSuggestion | null,
    limit: number
  ): SynonymSuggestion | null {
    if (!suggestion) return null;
    return {
      ...suggestion,
      synonyms: suggestion.synonyms.slice(0, limit),
    };
  }

  public async findBetterWords(text: string): Promise<Map<string, string[]>> {
    const words = text.match(/\b[a-z]+\b/gi) || [];
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const suggestions = new Map<string, string[]>();

    for (const word of uniqueWords) {
      const syn = await this.getSynonyms(word, 3);
      if (syn && syn.synonyms.length > 0) {
        suggestions.set(word, syn.synonyms);
      }
    }

    return suggestions;
  }

  public async enhanceVocabulary(
    text: string,
    targetDifficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<string> {
    let enhancedText = text;
    const wordsToReplace = await this.findBetterWords(text);

    for (const [originalWord, alternatives] of wordsToReplace) {
      // Select alternative based on difficulty
      let replacement = alternatives[0];

      if (targetDifficulty === 'hard' && alternatives.length > 2) {
        replacement = alternatives[alternatives.length - 1];
      } else if (targetDifficulty === 'easy' && alternatives.length > 0) {
        replacement = alternatives[0];
      } else if (alternatives.length > 0) {
        replacement = alternatives[Math.floor(alternatives.length / 2)];
      }

      // Replace word (case-insensitive)
      const regex = new RegExp(`\\b${originalWord}\\b`, 'gi');
      enhancedText = enhancedText.replace(regex, replacement);
    }

    return enhancedText;
  }

  public async getRelatedWords(word: string, relationshipType: 'synonym' | 'antonym' | 'related' = 'synonym'): Promise<string[]> {
    const normalized = word.toLowerCase();

    if (relationshipType === 'synonym') {
      const syn = await this.getSynonyms(word);
      return syn?.synonyms || [];
    }

    // Antonyms (basic mapping)
    const antonyms: Record<string, string[]> = {
      'good': ['bad', 'evil', 'poor'],
      'bad': ['good', 'excellent', 'great'],
      'big': ['small', 'tiny', 'little'],
      'small': ['big', 'large', 'huge'],
      'happy': ['sad', 'unhappy', 'miserable'],
      'sad': ['happy', 'joyful', 'cheerful'],
      'fast': ['slow', 'sluggish', 'tardy'],
      'slow': ['fast', 'quick', 'rapid'],
      'hot': ['cold', 'cool', 'chilly'],
      'cold': ['hot', 'warm', 'heated'],
      'light': ['dark', 'dim', 'murky'],
      'dark': ['light', 'bright', 'illuminated'],
      'up': ['down', 'under', 'below'],
      'down': ['up', 'above', 'over'],
      'begin': ['end', 'finish', 'conclude'],
      'end': ['begin', 'start', 'commence'],
    };

    if (relationshipType === 'antonym') {
      return antonyms[normalized] || [];
    }

    // Related words (context-based)
    return [];
  }

  public async getMostCommonAlternatives(
    text: string,
    count: number = 5
  ): Promise<Array<{ word: string; alternatives: string[] }>> {
    const words = text.match(/\b[a-z]+\b/gi) || [];
    const wordFreq = new Map<string, number>();

    for (const word of words) {
      const lower = word.toLowerCase();
      wordFreq.set(lower, (wordFreq.get(lower) || 0) + 1);
    }

    // Sort by frequency
    const sorted = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count * 2); // Get more candidates

    const results: Array<{ word: string; alternatives: string[] }> = [];

    for (const [word] of sorted) {
      const syn = await this.getSynonyms(word, 3);
      if (syn && syn.synonyms.length > 0) {
        results.push({
          word,
          alternatives: syn.synonyms,
        });
        if (results.length >= count) break;
      }
    }

    return results;
  }
}
