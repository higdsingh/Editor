/**
 * Offline Data Manager - Handles downloading, storing, and managing offline data
 */

export interface OfflineDataPackage {
  version: string;
  downloadedAt: string;
  dictionaries: {
    spelling: Record<string, string>;
    synonyms: Record<string, string[]>;
    grammar: Record<string, any>;
    commonPhrases: string[];
  };
  statistics: {
    totalEntries: number;
    totalSize: number;
  };
}

export class OfflineDataManager {
  private static readonly STORAGE_KEY = 'editorAI_offlineData';
  private static readonly VERSION = '1.0.0';
  private static readonly MAX_STORAGE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Build comprehensive offline data package
   */
  public static buildOfflinePackage(): OfflineDataPackage {
    return {
      version: this.VERSION,
      downloadedAt: new Date().toISOString(),
      dictionaries: {
        spelling: this.getSpellingDictionary(),
        synonyms: this.getSynonymsDictionary(),
        grammar: this.getGrammarRules(),
        commonPhrases: this.getCommonPhrases(),
      },
      statistics: {
        totalEntries: 0,
        totalSize: 0,
      },
    };
  }

  /**
   * Save offline data to localStorage
   */
  public static saveToStorage(data: OfflineDataPackage): boolean {
    try {
      const json = JSON.stringify(data);
      const size = new Blob([json]).size;

      if (size > this.MAX_STORAGE_SIZE) {
        console.warn(`Offline data exceeds max storage size (${size} bytes)`);
        return false;
      }

      localStorage.setItem(this.STORAGE_KEY, json);
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  }

  /**
   * Load offline data from localStorage
   */
  public static loadFromStorage(): OfflineDataPackage | null {
    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return null;
    }
  }

  /**
   * Export offline data as JSON file
   */
  public static exportAsJSON(data: OfflineDataPackage): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `editor-ai-offline-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import offline data from JSON file
   */
  public static async importFromJSON(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as OfflineDataPackage;
      return this.saveToStorage(data);
    } catch (error) {
      console.error('Failed to import offline data:', error);
      return false;
    }
  }

  /**
   * Check if offline data is available
   */
  public static hasOfflineData(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  /**
   * Get offline data size in bytes
   */
  public static getOfflineDataSize(): number {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? new Blob([data]).size : 0;
  }

  /**
   * Clear offline data
   */
  public static clearOfflineData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private static getSpellingDictionary(): Record<string, string> {
    return {
      // Common misspellings
      recieve: 'receive',
      occured: 'occurred',
      seperate: 'separate',
      definately: 'definitely',
      begining: 'beginning',
      maintainence: 'maintenance',
      sincerely: 'sincerely',
      accomodate: 'accommodate',
      aquire: 'acquire',
      bussiness: 'business',
      comming: 'coming',
      concieve: 'conceive',
      deceive: 'deceive',
      dissapear: 'disappear',
      embarass: 'embarrass',
      existance: 'existence',
      focussed: 'focused',
      foriegn: 'foreign',
      goverment: 'government',
      greatful: 'grateful',
      hassel: 'hassle',
      indispensible: 'indispensable',
      knowlege: 'knowledge',
      liscence: 'license',
      mispell: 'misspell',
      necesary: 'necessary',
      neibour: 'neighbour',
      occassion: 'occasion',
      occasionally: 'occasionally',
      paleontology: 'paleontology',
      paralel: 'parallel',
      pastime: 'pastime',
      perseverence: 'perseverance',
      posession: 'possession',
      preferance: 'preference',
      presense: 'presence',
      priviledge: 'privilege',
      profesional: 'professional',
      promiss: 'promise',
      prosedure: 'procedure',
      questionaire: 'questionnaire',
      reccomend: 'recommend',
      relavent: 'relevant',
      resistable: 'resistible',
      responce: 'response',
      restaurent: 'restaurant',
      rhyme: 'rhyme',
      rythm: 'rhythm',
      seance: 'seance',
      seperate: 'separate',
      sequense: 'sequence',
      sincerely: 'sincerely',
      supersede: 'supersede',
      trafic: 'traffic',
      truely: 'truly',
      unecessary: 'unnecessary',
      untill: 'until',
      usualy: 'usually',
      vaccuum: 'vacuum',
      wierd: 'weird',
    };
  }

  private static getSynonymsDictionary(): Record<string, string[]> {
    return {
      good: ['excellent', 'great', 'fantastic', 'wonderful', 'outstanding', 'fine', 'splendid'],
      bad: ['poor', 'terrible', 'awful', 'dreadful', 'inferior', 'unsuitable', 'regrettable'],
      big: ['large', 'huge', 'enormous', 'vast', 'substantial', 'immense', 'colossal'],
      small: ['tiny', 'little', 'compact', 'minute', 'diminutive', 'slight', 'petite'],
      happy: ['joyful', 'cheerful', 'delighted', 'pleased', 'content', 'thrilled', 'elated'],
      sad: ['unhappy', 'melancholy', 'sorrowful', 'dejected', 'gloomy', 'miserable', 'forlorn'],
      fast: ['quick', 'rapid', 'swift', 'speedy', 'brisk', 'hasty', 'fleet'],
      slow: ['sluggish', 'gradual', 'leisurely', 'lagging', 'tardy', 'unhurried', 'plodding'],
      beautiful: ['lovely', 'gorgeous', 'stunning', 'attractive', 'handsome', 'elegant', 'exquisite'],
      ugly: ['hideous', 'unsightly', 'unattractive', 'repulsive', 'displeasing', 'grotesque'],
      important: ['significant', 'crucial', 'essential', 'vital', 'critical', 'paramount', 'noteworthy'],
      unimportant: ['trivial', 'minor', 'insignificant', 'negligible', 'inconsequential', 'trifling'],
      start: ['begin', 'commence', 'initiate', 'launch', 'establish', 'open', 'inaugurate'],
      end: ['finish', 'conclude', 'terminate', 'complete', 'close', 'cease', 'culminate'],
      help: ['assist', 'aid', 'support', 'facilitate', 'benefit', 'serve', 'contribute'],
      show: ['display', 'demonstrate', 'reveal', 'exhibit', 'present', 'indicate', 'illustrate'],
      tell: ['say', 'inform', 'communicate', 'express', 'narrate', 'disclose', 'convey'],
      increase: ['grow', 'expand', 'amplify', 'enhance', 'elevate', 'boost', 'augment'],
      decrease: ['reduce', 'diminish', 'lower', 'decline', 'shrink', 'lessen', 'cut'],
      different: ['distinct', 'varied', 'diverse', 'dissimilar', 'unique', 'unlike', 'disparate'],
      same: ['identical', 'similar', 'equivalent', 'matching', 'alike', 'comparable', 'uniform'],
      think: ['believe', 'suppose', 'consider', 'imagine', 'reflect', 'ponder', 'meditate'],
      want: ['desire', 'wish', 'crave', 'yearn', 'seek', 'need', 'hanker'],
      give: ['provide', 'offer', 'grant', 'donate', 'distribute', 'supply', 'present'],
      get: ['obtain', 'acquire', 'receive', 'retrieve', 'attain', 'secure', 'procure'],
      take: ['seize', 'grab', 'capture', 'choose', 'accept', 'claim', 'snatch'],
      go: ['proceed', 'travel', 'move', 'advance', 'depart', 'leave', 'traverse'],
      come: ['arrive', 'approach', 'reach', 'emerge', 'return', 'appear', 'materialize'],
      make: ['create', 'produce', 'construct', 'manufacture', 'build', 'craft', 'fabricate'],
      do: ['perform', 'execute', 'accomplish', 'undertake', 'complete', 'conduct', 'implement'],
      say: ['state', 'mention', 'remark', 'declare', 'utter', 'note', 'articulate'],
      see: ['observe', 'view', 'witness', 'notice', 'perceive', 'spot', 'discern'],
      know: ['understand', 'comprehend', 'realize', 'recognize', 'aware', 'familiar', 'acquainted'],
      like: ['enjoy', 'appreciate', 'admire', 'prefer', 'favor', 'relish', 'delight'],
      love: ['adore', 'cherish', 'treasure', 'devoted', 'affectionate', 'passionate', 'worship'],
      hate: ['despise', 'detest', 'abhor', 'loathe', 'dislike', 'resent', 'execrate'],
    };
  }

  private static getGrammarRules(): Record<string, any> {
    return {
      commonErrors: [
        { pattern: /\btheir\s+(is|are|was|were)\b/gi, correction: 'there $1', rule: 'their vs there' },
        { pattern: /\bits\s+a\b/gi, correction: "it's a", rule: 'its vs it\'s' },
        { pattern: /\byour\s+(going|coming)\b/gi, correction: "you're $1", rule: 'your vs you\'re' },
        { pattern: /\ba\s+([aeiou])/gi, correction: 'an $1', rule: 'a vs an' },
        { pattern: /\baffect\s+(on|to)\b/gi, correction: 'effect $1', rule: 'affect vs effect' },
        { pattern: /\bwho\s+(did|does|have|has)\b/gi, correction: 'whom $1', rule: 'who vs whom' },
        { pattern: /\bthey're\s+was\b/gi, correction: 'they were', rule: 'subject-verb agreement' },
        { pattern: /\bi\s+(was|am)\s+.*\b(then)\b/gi, correction: 'than', rule: 'then vs than' },
      ],
      punctuation: [
        { rule: 'no-space-before-period', description: 'Remove space before period' },
        { rule: 'space-after-period', description: 'Add space after period' },
        { rule: 'no-space-before-comma', description: 'Remove space before comma' },
        { rule: 'space-after-comma', description: 'Add space after comma' },
      ],
    };
  }

  private static getCommonPhrases(): string[] {
    return [
      'in conclusion',
      'to summarize',
      'on the other hand',
      'in addition',
      'furthermore',
      'moreover',
      'however',
      'therefore',
      'as a result',
      'in fact',
      'for instance',
      'for example',
      'in particular',
      'such as',
      'in short',
      'ultimately',
      'significantly',
      'notably',
      'particularly',
      'specifically',
      'interestingly',
      'surprisingly',
      'obviously',
      'clearly',
      'undoubtedly',
      'certainly',
      'definitely',
      'arguably',
      'nonetheless',
      'conversely',
      'instead',
      'likewise',
      'similarly',
      'consequently',
      'subsequently',
      'eventually',
      'meanwhile',
      'previously',
      'initially',
      'ultimately',
    ];
  }
}
