/**
 * Plugin UI Component - Provides visual interface for the grammar and content plugin
 */

export class PluginUI {
  private container: HTMLElement | null = null;
  private isVisible: boolean = false;

  constructor(containerId?: string) {
    if (containerId) {
      this.container = document.getElementById(containerId);
    }
  }

  public renderPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'ai-plugin-panel';
    panel.className = 'ai-plugin-panel';
    panel.innerHTML = `
      <div class="plugin-header">
        <h3>AI Grammar & Content Assistant</h3>
        <button id="close-plugin" class="close-btn">×</button>
      </div>
      <div class="plugin-tabs">
        <button class="tab-btn active" data-tab="grammar">Grammar</button>
        <button class="tab-btn" data-tab="synonyms">Synonyms</button>
        <button class="tab-btn" data-tab="generation">Generate</button>
        <button class="tab-btn" data-tab="settings">Settings</button>
      </div>
      <div class="plugin-content">
        <div id="grammar-tab" class="tab-content active"></div>
        <div id="synonyms-tab" class="tab-content"></div>
        <div id="generation-tab" class="tab-content"></div>
        <div id="settings-tab" class="tab-content"></div>
      </div>
    `;
    return panel;
  }

  public renderGrammarIssues(issues: any[]): HTMLElement {
    const container = document.createElement('div');
    container.className = 'issues-container';

    if (issues.length === 0) {
      container.innerHTML = '<p class="no-issues">No grammar issues found!</p>';
      return container;
    }

    issues.forEach((issue) => {
      const issueEl = document.createElement('div');
      issueEl.className = `issue issue-${issue.severity}`;
      issueEl.innerHTML = `
        <div class="issue-header">
          <span class="issue-type">${issue.type}</span>
          <span class="issue-severity">${issue.severity}</span>
        </div>
        <p class="issue-message">${issue.message}</p>
        <p class="issue-text">"${issue.text}"</p>
        <div class="issue-suggestions">
          ${issue.suggestions.map((s: string) => `<button class="suggestion-btn">${s}</button>`).join('')}
        </div>
      `;
      container.appendChild(issueEl);
    });

    return container;
  }

  public renderSynonymSuggestions(word: string, synonyms: string[]): HTMLElement {
    const container = document.createElement('div');
    container.className = 'synonyms-container';
    container.innerHTML = `
      <div class="synonym-header">
        <h4>Alternatives for "${word}"</h4>
      </div>
      <div class="synonyms-list">
        ${synonyms.map((syn) => `<button class="synonym-btn">${syn}</button>`).join('')}
      </div>
    `;
    return container;
  }

  public renderContentGenerator(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'content-generator-container';
    container.innerHTML = `
      <div class="generator-section">
        <h4>Generate Content</h4>
        <select id="gen-type" class="generator-select">
          <option value="complete">Complete Text</option>
          <option value="expand">Expand Section</option>
          <option value="summarize">Summarize</option>
          <option value="rewrite">Rewrite</option>
          <option value="improve">Improve</option>
        </select>
        <button id="generate-btn" class="btn btn-primary">Generate</button>
      </div>
      <div class="article-section">
        <h4>Write Article</h4>
        <input type="text" id="article-title" placeholder="Article title" class="input-field" />
        <input type="text" id="article-topic" placeholder="Topic" class="input-field" />
        <button id="write-article-btn" class="btn btn-primary">Write Article</button>
      </div>
      <div class="result-container" id="generation-result"></div>
    `;
    return container;
  }

  public renderSettings(settings: any): HTMLElement {
    const container = document.createElement('div');
    container.className = 'settings-container';
    container.innerHTML = `
      <div class="settings-group">
        <h4>AI Model Configuration</h4>
        <div class="setting-item">
          <label>AI Model:</label>
          <select id="ai-model" class="settings-select">
            <option value="local" ${settings.aiModel === 'local' ? 'selected' : ''}>Local (Offline)</option>
            <option value="openai" ${settings.aiModel === 'openai' ? 'selected' : ''}>OpenAI GPT</option>
            <option value="gemini" ${settings.aiModel === 'gemini' ? 'selected' : ''}>Google Gemini</option>
            <option value="claude" ${settings.aiModel === 'claude' ? 'selected' : ''}>Claude</option>
          </select>
        </div>
        <div class="setting-item">
          <label>API Key:</label>
          <input type="password" id="api-key" placeholder="Enter API key" class="input-field" value="${settings.apiKey || ''}" />
        </div>
      </div>
      <div class="settings-group">
        <h4>Grammar & Correction</h4>
        <div class="setting-item">
          <label>Correction Mode:</label>
          <select id="correction-mode" class="settings-select">
            <option value="manual" ${settings.correctionMode === 'manual' ? 'selected' : ''}>Manual</option>
            <option value="suggestion" ${settings.correctionMode === 'suggestion' ? 'selected' : ''}>Suggestions</option>
            <option value="automatic" ${settings.correctionMode === 'automatic' ? 'selected' : ''}>Automatic</option>
          </select>
        </div>
        <div class="setting-item">
          <label>Grammar Strictness:</label>
          <select id="strictness" class="settings-select">
            <option value="relaxed" ${settings.grammarStrictness === 'relaxed' ? 'selected' : ''}>Relaxed</option>
            <option value="standard" ${settings.grammarStrictness === 'standard' ? 'selected' : ''}>Standard</option>
            <option value="strict" ${settings.grammarStrictness === 'strict' ? 'selected' : ''}>Strict</option>
          </select>
        </div>
      </div>
      <div class="settings-group">
        <h4>Language & Style</h4>
        <div class="setting-item">
          <label>Tone:</label>
          <select id="tone" class="settings-select">
            <option value="formal" ${settings.tone === 'formal' ? 'selected' : ''}>Formal</option>
            <option value="casual" ${settings.tone === 'casual' ? 'selected' : ''}>Casual</option>
            <option value="professional" ${settings.tone === 'professional' ? 'selected' : ''}>Professional</option>
            <option value="creative" ${settings.tone === 'creative' ? 'selected' : ''}>Creative</option>
          </select>
        </div>
      </div>
      <button id="save-settings-btn" class="btn btn-primary">Save Settings</button>
    `;
    return container;
  }

  public show(): void {
    if (this.container) {
      this.container.style.display = 'block';
      this.isVisible = true;
    }
  }

  public hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;
    }
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public showNotification(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
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
}
