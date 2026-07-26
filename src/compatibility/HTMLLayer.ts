/**
 * HTML Compatibility Layer - Direct integration with vanilla HTML/JS webapps
 * No build tools required - just include the script tag
 */

declare global {
  interface Window {
    EditorAIPlugin: {
      init: (config: any) => void;
      analyzeText: (text: string) => Promise<any>;
      correctText: (text: string) => Promise<any>;
      getSynonyms: (word: string) => Promise<string[]>;
      generateContent: (request: any) => Promise<any>;
      showSettings: () => void;
      hideSettings: () => void;
      updateSettings: (settings: any) => Promise<void>;
      downloadOfflineData: () => Promise<void>;
      isOnline: () => boolean;
    };
  }
}

export class HTMLCompatibilityLayer {
  private static instance: HTMLCompatibilityLayer;
  private pluginManager: any;
  private ui: any;
  private offlineDataManager: any;

  private constructor() {}

  public static getInstance(): HTMLCompatibilityLayer {
    if (!HTMLCompatibilityLayer.instance) {
      HTMLCompatibilityLayer.instance = new HTMLCompatibilityLayer();
    }
    return HTMLCompatibilityLayer.instance;
  }

  public initialize(config: any = {}): void {
    // Lazy load components to avoid module issues
    this.setupGlobalAPI();
    this.injectStyles();
    this.createPluginContainer();
    this.setupEditorBindings();
  }

  private setupGlobalAPI(): void {
    window.EditorAIPlugin = {
      init: (config) => this.initPlugin(config),
      analyzeText: async (text) => this.analyzeText(text),
      correctText: async (text) => this.correctText(text),
      getSynonyms: async (word) => this.getSynonyms(word),
      generateContent: async (request) => this.generateContent(request),
      showSettings: () => this.showSettings(),
      hideSettings: () => this.hideSettings(),
      updateSettings: async (settings) => this.updateSettings(settings),
      downloadOfflineData: () => this.downloadOfflineData(),
      isOnline: () => this.isOnline(),
    };
  }

  private initPlugin(config: any): void {
    const defaultConfig = {
      aiModel: 'local',
      enableOfflineMode: true,
      correctionMode: 'suggestion',
      debounceDelay: 300,
      ...config,
    };

    // Store in localStorage for persistence
    localStorage.setItem('editorAIConfig', JSON.stringify(defaultConfig));
    console.log('Plugin initialized with config:', defaultConfig);
  }

  private createPluginContainer(): void {
    if (document.getElementById('editor-ai-plugin-container')) return;

    const container = document.createElement('div');
    container.id = 'editor-ai-plugin-container';
    container.className = 'editor-ai-plugin-container';
    container.innerHTML = `
      <div class="plugin-panel" id="plugin-panel">
        <div class="plugin-header">
          <h3>AI Grammar & Content</h3>
          <div class="header-buttons">
            <button id="toggle-settings-btn" class="icon-btn" title="Settings">⚙️</button>
            <button id="minimize-btn" class="icon-btn" title="Minimize">−</button>
            <button id="close-btn" class="icon-btn" title="Close">×</button>
          </div>
        </div>
        <div class="plugin-tabs">
          <button class="tab-btn active" data-tab="grammar">Grammar</button>
          <button class="tab-btn" data-tab="synonyms">Synonyms</button>
          <button class="tab-btn" data-tab="generate">Generate</button>
          <button class="tab-btn" data-tab="settings">Settings</button>
        </div>
        <div class="plugin-content">
          <div id="grammar-content" class="tab-content active"></div>
          <div id="synonyms-content" class="tab-content"></div>
          <div id="generate-content" class="tab-content"></div>
          <div id="settings-content" class="tab-content"></div>
        </div>
        <div class="plugin-footer">
          <span id="status-indicator" class="status offline">Offline</span>
          <small id="plugin-version">v1.0.0</small>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e: any) => this.switchTab(e.target.dataset.tab));
    });

    // Control buttons
    document.getElementById('close-btn')?.addEventListener('click', () => {
      const panel = document.getElementById('plugin-panel');
      if (panel) panel.style.display = 'none';
    });

    document.getElementById('minimize-btn')?.addEventListener('click', () => {
      const content = document.querySelector('.plugin-content');
      if (content) {
        (content as HTMLElement).style.display =
          (content as HTMLElement).style.display === 'none' ? 'block' : 'none';
      }
    });

    document.getElementById('toggle-settings-btn')?.addEventListener('click', () => {
      this.switchTab('settings');
    });
  }

  private switchTab(tabName: string): void {
    // Hide all content
    document.querySelectorAll('.tab-content').forEach((el) => {
      el.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach((el) => {
      el.classList.remove('active');
    });

    // Show selected tab
    const contentId = `${tabName}-content`;
    const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const contentEl = document.getElementById(contentId);

    if (tabBtn) tabBtn.classList.add('active');
    if (contentEl) contentEl.classList.add('active');

    // Load content for tab
    this.loadTabContent(tabName);
  }

  private loadTabContent(tabName: string): void {
    const contentEl = document.getElementById(`${tabName}-content`);
    if (!contentEl) return;

    switch (tabName) {
      case 'grammar':
        this.loadGrammarContent(contentEl);
        break;
      case 'synonyms':
        this.loadSynonymsContent(contentEl);
        break;
      case 'generate':
        this.loadGenerateContent(contentEl);
        break;
      case 'settings':
        this.loadSettingsContent(contentEl);
        break;
    }
  }

  private loadGrammarContent(container: HTMLElement): void {
    if (container.innerHTML.trim()) return; // Already loaded

    const selectedText = window.getSelection()?.toString() || '';
    container.innerHTML = `
      <div class="grammar-section">
        <div class="input-group">
          <textarea id="grammar-input" placeholder="Paste text to check grammar..." class="plugin-textarea">${selectedText}</textarea>
        </div>
        <button id="check-grammar-btn" class="plugin-btn primary">Check Grammar</button>
        <button id="auto-correct-btn" class="plugin-btn secondary">Auto Correct</button>
        <div id="grammar-results" class="results-container"></div>
      </div>
    `;

    document.getElementById('check-grammar-btn')?.addEventListener('click', () => {
      const text = (document.getElementById('grammar-input') as HTMLTextAreaElement)?.value;
      if (text) this.performGrammarCheck(text);
    });

    document.getElementById('auto-correct-btn')?.addEventListener('click', () => {
      const text = (document.getElementById('grammar-input') as HTMLTextAreaElement)?.value;
      if (text) this.performAutoCorrect(text);
    });
  }

  private loadSynonymsContent(container: HTMLElement): void {
    if (container.innerHTML.trim()) return;

    container.innerHTML = `
      <div class="synonyms-section">
        <div class="input-group">
          <input type="text" id="synonym-input" placeholder="Enter a word..." class="plugin-input" />
        </div>
        <button id="find-synonyms-btn" class="plugin-btn primary">Find Synonyms</button>
        <div id="synonyms-results" class="results-container"></div>
      </div>
    `;

    document.getElementById('find-synonyms-btn')?.addEventListener('click', () => {
      const word = (document.getElementById('synonym-input') as HTMLInputElement)?.value;
      if (word) this.performSynonymSearch(word);
    });
  }

  private loadGenerateContent(container: HTMLElement): void {
    if (container.innerHTML.trim()) return;

    container.innerHTML = `
      <div class="generate-section">
        <div class="input-group">
          <label>Generation Type:</label>
          <select id="gen-type" class="plugin-select">
            <option value="improve">Improve Text</option>
            <option value="expand">Expand Text</option>
            <option value="summarize">Summarize</option>
            <option value="rewrite">Rewrite</option>
            <option value="complete">Complete Text</option>
          </select>
        </div>
        <div class="input-group">
          <textarea id="gen-input" placeholder="Enter text to generate from..." class="plugin-textarea"></textarea>
        </div>
        <button id="generate-btn" class="plugin-btn primary">Generate</button>
        <div id="generation-results" class="results-container"></div>
      </div>
      <div class="article-section">
        <h4>Write Article</h4>
        <div class="input-group">
          <input type="text" id="article-title" placeholder="Article title" class="plugin-input" />
        </div>
        <div class="input-group">
          <input type="text" id="article-topic" placeholder="Topic" class="plugin-input" />
        </div>
        <button id="write-article-btn" class="plugin-btn primary">Write Article</button>
      </div>
    `;

    document.getElementById('generate-btn')?.addEventListener('click', () => {
      const text = (document.getElementById('gen-input') as HTMLTextAreaElement)?.value;
      const type = (document.getElementById('gen-type') as HTMLSelectElement)?.value;
      if (text) this.performGeneration(text, type);
    });

    document.getElementById('write-article-btn')?.addEventListener('click', () => {
      const title = (document.getElementById('article-title') as HTMLInputElement)?.value;
      const topic = (document.getElementById('article-topic') as HTMLInputElement)?.value;
      if (title && topic) this.writeArticle(title, topic);
    });
  }

  private loadSettingsContent(container: HTMLElement): void {
    if (container.innerHTML.trim()) return;

    const config = JSON.parse(localStorage.getItem('editorAIConfig') || '{}');

    container.innerHTML = `
      <div class="settings-section">
        <h4>AI Model</h4>
        <div class="input-group">
          <label>Select Model:</label>
          <select id="ai-model-select" class="plugin-select">
            <option value="local" ${config.aiModel === 'local' ? 'selected' : ''}>Local (Offline)</option>
            <option value="openai" ${config.aiModel === 'openai' ? 'selected' : ''}>OpenAI GPT</option>
            <option value="gemini" ${config.aiModel === 'gemini' ? 'selected' : ''}>Google Gemini</option>
            <option value="claude" ${config.aiModel === 'claude' ? 'selected' : ''}>Claude</option>
          </select>
        </div>
        <div class="input-group">
          <label>API Key:</label>
          <input type="password" id="api-key-input" placeholder="Enter API key" class="plugin-input" value="${config.apiKey || ''}" />
        </div>
        <h4>Grammar Settings</h4>
        <div class="input-group">
          <label>Strictness:</label>
          <select id="strictness-select" class="plugin-select">
            <option value="relaxed" ${config.grammarStrictness === 'relaxed' ? 'selected' : ''}>Relaxed</option>
            <option value="standard" ${config.grammarStrictness === 'standard' ? 'selected' : ''}>Standard</option>
            <option value="strict" ${config.grammarStrictness === 'strict' ? 'selected' : ''}>Strict</option>
          </select>
        </div>
        <div class="input-group">
          <label>Tone:</label>
          <select id="tone-select" class="plugin-select">
            <option value="formal" ${config.tone === 'formal' ? 'selected' : ''}>Formal</option>
            <option value="casual" ${config.tone === 'casual' ? 'selected' : ''}>Casual</option>
            <option value="professional" ${config.tone === 'professional' ? 'selected' : ''}>Professional</option>
            <option value="creative" ${config.tone === 'creative' ? 'selected' : ''}>Creative</option>
          </select>
        </div>
        <h4>Offline Data</h4>
        <div class="offline-section">
          <p>Download dictionaries and data for offline use:</p>
          <button id="download-offline-btn" class="plugin-btn secondary">📥 Download Offline Data</button>
          <div id="download-progress" class="progress-container" style="display:none;">
            <div class="progress-bar">
              <div id="progress-fill" class="progress-fill"></div>
            </div>
            <p id="progress-text">Downloading...</p>
          </div>
        </div>
        <button id="save-settings-btn" class="plugin-btn primary">Save Settings</button>
      </div>
    `;

    document.getElementById('save-settings-btn')?.addEventListener('click', () => {
      this.saveSettingsFromUI();
    });

    document.getElementById('download-offline-btn')?.addEventListener('click', () => {
      this.downloadOfflineData();
    });
  }

  private async performGrammarCheck(text: string): Promise<void> {
    const resultsDiv = document.getElementById('grammar-results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = '<p class="loading">Checking grammar...</p>';

    try {
      const result = await this.analyzeText(text);
      this.displayGrammarResults(result, resultsDiv);
    } catch (error) {
      resultsDiv.innerHTML = `<p class="error">Error: ${error}</p>`;
    }
  }

  private async performAutoCorrect(text: string): Promise<void> {
    const resultsDiv = document.getElementById('grammar-results');
    if (!resultsDiv) return;

    try {
      const result = await this.correctText(text);
      const grammarInput = document.getElementById('grammar-input') as HTMLTextAreaElement;
      if (grammarInput) grammarInput.value = result.corrected;

      resultsDiv.innerHTML = `
        <div class="success-message">
          <p>✓ Auto-correction applied!</p>
          <details>
            <summary>View Changes</summary>
            <div class="changes-list">${result.changes.map((c: any) => `<div>${c.type}: ${c.original} → ${c.corrected}</div>`).join('')}</div>
          </details>
        </div>
      `;
    } catch (error) {
      resultsDiv.innerHTML = `<p class="error">Error: ${error}</p>`;
    }
  }

  private async performSynonymSearch(word: string): Promise<void> {
    const resultsDiv = document.getElementById('synonyms-results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = '<p class="loading">Finding synonyms...</p>';

    try {
      const synonyms = await this.getSynonyms(word);
      this.displaySynonymResults(word, synonyms, resultsDiv);
    } catch (error) {
      resultsDiv.innerHTML = `<p class="error">Error: ${error}</p>`;
    }
  }

  private async performGeneration(text: string, type: string): Promise<void> {
    const resultsDiv = document.getElementById('generation-results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = '<p class="loading">Generating...</p>';

    try {
      const result = await this.generateContent({ type, text });
      this.displayGenerationResults(result, resultsDiv);
    } catch (error) {
      resultsDiv.innerHTML = `<p class="error">Error: ${error}</p>`;
    }
  }

  private async writeArticle(title: string, topic: string): Promise<void> {
    const resultsDiv = document.getElementById('generation-results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = '<p class="loading">Writing article...</p>';

    try {
      const result = await this.generateContent({
        type: 'write_article',
        text: `Title: ${title}\nTopic: ${topic}`,
      });
      this.displayGenerationResults(result, resultsDiv);
    } catch (error) {
      resultsDiv.innerHTML = `<p class="error">Error: ${error}</p>`;
    }
  }

  private displayGrammarResults(result: any, container: HTMLElement): void {
    if (!result.issues || result.issues.length === 0) {
      container.innerHTML = '<p class="success">✓ No grammar issues found!</p>';
      return;
    }

    container.innerHTML = `
      <div class="results-list">
        ${result.issues
          .map(
            (issue: any) => `
          <div class="result-item severity-${issue.severity}">
            <div class="result-header">
              <span class="badge badge-${issue.type}">${issue.type}</span>
              <span class="severity">${issue.severity}</span>
            </div>
            <p class="result-message">${issue.message}</p>
            <p class="result-text">"${issue.text}"</p>
            <div class="suggestions">
              ${issue.suggestions.map((s: string) => `<button class="suggestion-btn" onclick="this.parentElement.insertAdjacentText('beforebegin', '${s}')">${s}</button>`).join('')}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  private displaySynonymResults(word: string, synonyms: string[], container: HTMLElement): void {
    if (synonyms.length === 0) {
      container.innerHTML = `<p class="info">No synonyms found for "${word}"</p>`;
      return;
    }

    container.innerHTML = `
      <div class="synonym-results">
        <h4>Synonyms for "${word}":</h4>
        <div class="synonym-buttons">
          ${synonyms.map((syn) => `<button class="synonym-btn" onclick="this.parentElement.insertAdjacentText('beforebegin', '${syn}')">${syn}</button>`).join('')}
        </div>
      </div>
    `;
  }

  private displayGenerationResults(result: any, container: HTMLElement): void {
    container.innerHTML = `
      <div class="generation-result">
        <div class="result-content">${result.generated.replace(/\n/g, '<br>')}</div>
        <div class="result-actions">
          <button class="plugin-btn secondary" onclick="navigator.clipboard.writeText(this.parentElement.previousElementSibling.textContent)">📋 Copy</button>
          <button class="plugin-btn primary" onclick="document.querySelector('.grammar-input').value = this.parentElement.previousElementSibling.textContent">✓ Use</button>
        </div>
      </div>
    `;
  }

  private saveSettingsFromUI(): void {
    const settings = {
      aiModel: (document.getElementById('ai-model-select') as HTMLSelectElement)?.value,
      apiKey: (document.getElementById('api-key-input') as HTMLInputElement)?.value,
      grammarStrictness: (document.getElementById('strictness-select') as HTMLSelectElement)?.value,
      tone: (document.getElementById('tone-select') as HTMLSelectElement)?.value,
    };

    const currentConfig = JSON.parse(localStorage.getItem('editorAIConfig') || '{}');
    const updatedConfig = { ...currentConfig, ...settings };
    localStorage.setItem('editorAIConfig', JSON.stringify(updatedConfig));

    this.showNotification('Settings saved successfully!', 'success');
  }

  private showSettings(): void {
    this.switchTab('settings');
  }

  private hideSettings(): void {
    const panel = document.getElementById('plugin-panel');
    if (panel) panel.style.display = 'none';
  }

  private async analyzeText(text: string): Promise<any> {
    // Simulate API call - in production, this would call the actual plugin
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          issues: [],
          readabilityScore: 75,
        });
      }, 500);
    });
  }

  private async correctText(text: string): Promise<any> {
    // Simulate correction
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          original: text,
          corrected: text,
          changes: [],
        });
      }, 500);
    });
  }

  private async getSynonyms(word: string): Promise<string[]> {
    // Simulate synonym lookup
    const synonymMap: Record<string, string[]> = {
      good: ['excellent', 'great', 'fantastic', 'wonderful'],
      bad: ['poor', 'terrible', 'awful', 'dreadful'],
      happy: ['joyful', 'cheerful', 'delighted', 'pleased'],
      sad: ['unhappy', 'melancholy', 'sorrowful', 'dejected'],
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(synonymMap[word.toLowerCase()] || []);
      }, 300);
    });
  }

  private async generateContent(request: any): Promise<any> {
    // Simulate content generation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: request.type,
          original: request.text,
          generated: '[Generated content will appear here with AI integration]',
        });
      }, 800);
    });
  }

  private async updateSettings(settings: any): Promise<void> {
    const currentConfig = JSON.parse(localStorage.getItem('editorAIConfig') || '{}');
    const updatedConfig = { ...currentConfig, ...settings };
    localStorage.setItem('editorAIConfig', JSON.stringify(updatedConfig));
  }

  private isOnline(): boolean {
    const config = JSON.parse(localStorage.getItem('editorAIConfig') || '{}');
    return config.aiModel !== 'local' && navigator.onLine;
  }

  private async downloadOfflineData(): Promise<void> {
    const progressDiv = document.getElementById('download-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    if (!progressDiv) return;

    progressDiv.style.display = 'block';

    const offlineData = {
      dictionaries: {
        spelling: this.getOfflineSpellingDict(),
        synonyms: this.getOfflineSynonymsDict(),
        grammar: this.getOfflineGrammarRules(),
      },
      metadata: {
        version: '1.0.0',
        downloadedAt: new Date().toISOString(),
      },
    };

    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        if (progressFill) progressFill.style.width = i + '%';
        if (progressText) progressText.textContent = `Downloading... ${i}%`;
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Save to localStorage
      localStorage.setItem('offlineAIData', JSON.stringify(offlineData));

      // Also offer to download as JSON file
      const dataStr = JSON.stringify(offlineData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `editor-ai-offline-data-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      if (progressText) progressText.textContent = '✓ Download complete!';
      this.showNotification('Offline data downloaded successfully!', 'success');

      setTimeout(() => {
        if (progressDiv) progressDiv.style.display = 'none';
      }, 2000);
    } catch (error) {
      if (progressText) progressText.textContent = '✗ Download failed!';
      this.showNotification('Error downloading offline data', 'error');
    }
  }

  private getOfflineSpellingDict(): Record<string, string> {
    return {
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
    };
  }

  private getOfflineSynonymsDict(): Record<string, string[]> {
    return {
      good: ['excellent', 'great', 'fantastic', 'wonderful', 'outstanding'],
      bad: ['poor', 'terrible', 'awful', 'dreadful', 'inferior'],
      big: ['large', 'huge', 'enormous', 'vast', 'substantial'],
      small: ['tiny', 'little', 'compact', 'minute', 'diminutive'],
      happy: ['joyful', 'cheerful', 'delighted', 'pleased', 'content'],
      sad: ['unhappy', 'melancholy', 'sorrowful', 'dejected', 'gloomy'],
      fast: ['quick', 'rapid', 'swift', 'speedy', 'brisk'],
      slow: ['sluggish', 'gradual', 'leisurely', 'lagging', 'tardy'],
      beautiful: ['lovely', 'gorgeous', 'stunning', 'attractive', 'handsome'],
      ugly: ['hideous', 'unsightly', 'unattractive', 'repulsive', 'displeasing'],
    };
  }

  private getOfflineGrammarRules(): Record<string, any> {
    return {
      commonErrors: [
        { pattern: 'their is', correction: 'there is', rule: 'their vs there' },
        { pattern: 'its a', correction: "it's a", rule: 'its vs it\'s' },
        { pattern: 'your going', correction: "you're going", rule: 'your vs you\'re' },
        { pattern: 'a apple', correction: 'an apple', rule: 'a vs an' },
      ],
      punctuation: [
        { rule: 'no-space-before-period', description: 'Remove space before period' },
        { rule: 'space-after-period', description: 'Add space after period' },
      ],
    };
  }

  private setupEditorBindings(): void {
    // Auto-trigger grammar checking on any textarea/contenteditable element
    document.addEventListener('input', (e: any) => {
      if (e.target.matches('textarea, [contenteditable]')) {
        // Could trigger real-time checking here
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const notification = document.createElement('div');
    notification.className = `plugin-notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  private injectStyles(): void {
    if (document.getElementById('editor-ai-plugin-styles')) return;

    const style = document.createElement('style');
    style.id = 'editor-ai-plugin-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }

      .editor-ai-plugin-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      .plugin-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        max-height: 600px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        z-index: 9999;
        overflow: hidden;
      }

      .plugin-header {
        padding: 12px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #ddd;
      }

      .plugin-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .header-buttons {
        display: flex;
        gap: 8px;
      }

      .icon-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.2s;
      }

      .icon-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .plugin-tabs {
        display: flex;
        border-bottom: 1px solid #eee;
        background: #f5f5f5;
      }

      .tab-btn {
        flex: 1;
        padding: 10px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: #666;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
      }

      .tab-btn.active {
        color: #667eea;
        border-bottom-color: #667eea;
      }

      .tab-btn:hover {
        color: #667eea;
      }

      .plugin-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }

      .tab-content {
        display: none;
      }

      .tab-content.active {
        display: block;
      }

      .input-group {
        margin-bottom: 12px;
      }

      .input-group label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .plugin-input,
      .plugin-textarea,
      .plugin-select {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 13px;
        font-family: inherit;
        box-sizing: border-box;
      }

      .plugin-textarea {
        resize: vertical;
        min-height: 80px;
        font-family: 'Monaco', 'Courier New', monospace;
      }

      .plugin-input:focus,
      .plugin-textarea:focus,
      .plugin-select:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .plugin-btn {
        display: inline-block;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.2s;
        width: 100%;
        margin-bottom: 8px;
      }

      .plugin-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .plugin-btn.primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      .plugin-btn.secondary {
        background: #f0f0f0;
        color: #333;
        border: 1px solid #ddd;
      }

      .plugin-btn.secondary:hover {
        background: #e8e8e8;
      }

      .results-container {
        margin-top: 12px;
        padding: 12px;
        background: #f9f9f9;
        border-radius: 4px;
        border-left: 3px solid #667eea;
      }

      .result-item {
        padding: 10px;
        margin-bottom: 8px;
        background: white;
        border: 1px solid #eee;
        border-radius: 4px;
      }

      .result-item.severity-error {
        border-left: 3px solid #f44336;
      }

      .result-item.severity-warning {
        border-left: 3px solid #ff9800;
      }

      .result-item.severity-info {
        border-left: 3px solid #2196F3;
      }

      .badge {
        display: inline-block;
        padding: 2px 6px;
        background: #667eea;
        color: white;
        border-radius: 3px;
        font-size: 11px;
        font-weight: 600;
        margin-right: 6px;
      }

      .suggestion-btn,
      .synonym-btn {
        display: inline-block;
        padding: 4px 8px;
        background: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
        margin-right: 4px;
        margin-top: 4px;
        transition: all 0.2s;
      }

      .suggestion-btn:hover,
      .synonym-btn:hover {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      .plugin-footer {
        padding: 8px 16px;
        background: #f5f5f5;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        color: #999;
      }

      .status-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;
      }

      .status-indicator.online {
        background: #4caf50;
      }

      .status-indicator.offline {
        background: #ff9800;
      }

      .loading {
        text-align: center;
        color: #999;
        font-style: italic;
      }

      .success {
        color: #4caf50;
        font-weight: 600;
      }

      .error {
        color: #f44336;
        font-weight: 600;
      }

      .success-message {
        background: #e8f5e9;
        border: 1px solid #4caf50;
        border-radius: 4px;
        padding: 10px;
        color: #2e7d32;
      }

      .progress-container {
        margin: 12px 0;
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        width: 0%;
        transition: width 0.2s;
      }

      #progress-text {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
      }

      .offline-section {
        background: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 4px;
        padding: 10px;
        margin: 12px 0;
      }

      .offline-section p {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: #856404;
      }
    `;

    document.head.appendChild(style);
  }
}

// Auto-initialize on page load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const layer = HTMLCompatibilityLayer.getInstance();
    layer.initialize();
  });
}
