/**
 * Vanilla JavaScript Integration Example
 * Shows how to integrate the plugin into any web-based office suite
 */

import { PluginManager } from '../PluginManager';
import { PluginUI } from '../ui/PluginUI';

export class EditorIntegration {
  private pluginManager: PluginManager;
  private ui: PluginUI;
  private editorElement: HTMLTextAreaElement | HTMLDivElement | null = null;

  constructor(editorSelector: string) {
    this.editorElement = document.querySelector(editorSelector) as any;
    this.pluginManager = new PluginManager();
    this.ui = new PluginUI('plugin-container');
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.editorElement) return;

    // Real-time grammar checking
    this.editorElement.addEventListener(
      'input',
      this.debounce(() => this.checkGrammar(), 300)
    );

    // Context menu for right-click suggestions
    this.editorElement.addEventListener('contextmenu', (e) => this.showContextMenu(e));

    // UI event listeners
    document.getElementById('generate-btn')?.addEventListener('click', () => this.generateContent());
    document.getElementById('write-article-btn')?.addEventListener('click', () => this.writeArticle());
    document.getElementById('save-settings-btn')?.addEventListener('click', () => this.saveSettings());
  }

  private async checkGrammar(): Promise<void> {
    const text = this.getEditorText();
    if (!text) return;

    try {
      const result = await this.pluginManager.analyzeText(text);
      this.displayGrammarIssues(result.issues);
      this.displayReadability(result.readabilityScore);
    } catch (error) {
      console.error('Grammar check error:', error);
      this.ui.showNotification('Error checking grammar', 'error');
    }
  }

  private displayGrammarIssues(issues: any[]): void {
    const grammarTab = document.getElementById('grammar-tab');
    if (grammarTab) {
      grammarTab.innerHTML = '';
      grammarTab.appendChild(this.ui.renderGrammarIssues(issues));
    }
  }

  private displayReadability(score: number): void {
    const indicator = document.createElement('div');
    indicator.className = 'readability-indicator';
    indicator.innerHTML = `
      <div class="readability-bar">
        <div class="readability-fill" style="width: ${score}%"></div>
      </div>
      <p>Readability Score: ${score.toFixed(1)}/100</p>
    `;
  }

  private async generateContent(): Promise<void> {
    const text = this.getEditorText();
    const type = (document.getElementById('gen-type') as HTMLSelectElement)?.value || 'improve';

    if (!text) {
      this.ui.showNotification('Please select text to generate from', 'info');
      return;
    }

    try {
      const result = await this.pluginManager.generateContent({
        type: type as any,
        text,
        maxTokens: 500,
      });

      const resultContainer = document.getElementById('generation-result');
      if (resultContainer) {
        resultContainer.innerHTML = `
          <div class="generated-content">
            <h5>Generated Content:</h5>
            <p>${result.generated}</p>
            <button class="btn btn-sm" onclick="this.replaceContent()">Use This</button>
          </div>
        `;
      }
      this.ui.showNotification('Content generated successfully', 'success');
    } catch (error) {
      console.error('Content generation error:', error);
      this.ui.showNotification('Error generating content', 'error');
    }
  }

  private async writeArticle(): Promise<void> {
    const title = (document.getElementById('article-title') as HTMLInputElement)?.value;
    const topic = (document.getElementById('article-topic') as HTMLInputElement)?.value;

    if (!title || !topic) {
      this.ui.showNotification('Please enter title and topic', 'info');
      return;
    }

    try {
      const content = await this.pluginManager.writeArticle({
        title,
        topic,
        sections: 3,
      });

      const resultContainer = document.getElementById('generation-result');
      if (resultContainer) {
        resultContainer.innerHTML = `
          <div class="generated-content">
            <h5>Generated Article:</h5>
            <div class="article-preview">${content.replace(/\n/g, '<br>')}</div>
            <button class="btn btn-sm">Insert into Editor</button>
          </div>
        `;
      }
      this.ui.showNotification('Article generated successfully', 'success');
    } catch (error) {
      console.error('Article generation error:', error);
      this.ui.showNotification('Error writing article', 'error');
    }
  }

  private async saveSettings(): Promise<void> {
    const settings = {
      aiModel: (document.getElementById('ai-model') as HTMLSelectElement)?.value,
      apiKey: (document.getElementById('api-key') as HTMLInputElement)?.value,
      correctionMode: (document.getElementById('correction-mode') as HTMLSelectElement)?.value,
      grammarStrictness: (document.getElementById('strictness') as HTMLSelectElement)?.value,
      tone: (document.getElementById('tone') as HTMLSelectElement)?.value,
    };

    try {
      await this.pluginManager.updateSettings(settings);
      this.ui.showNotification('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Settings save error:', error);
      this.ui.showNotification('Error saving settings', 'error');
    }
  }

  private showContextMenu(event: MouseEvent): void {
    event.preventDefault();
    const selection = window.getSelection()?.toString();
    if (!selection) return;

    // Show context menu with suggestions
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <div class="context-menu-item" onclick="checkWord()">Check Grammar</div>
      <div class="context-menu-item" onclick="getSynonyms()">Get Synonyms</div>
      <div class="context-menu-item" onclick="improveText()">Improve Text</div>
    `;
    menu.style.cssText = `
      position: fixed;
      top: ${event.clientY}px;
      left: ${event.clientX}px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 10000;
    `;
    document.body.appendChild(menu);
    setTimeout(() => menu.remove(), 3000);
  }

  private getEditorText(): string {
    if (!this.editorElement) return '';
    if ('value' in this.editorElement) {
      return this.editorElement.value;
    }
    return this.editorElement.textContent || '';
  }

  private debounce(func: Function, wait: number): (...args: any[]) => void {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  public showPanel(): void {
    this.ui.show();
  }

  public hidePanel(): void {
    this.ui.hide();
  }
}
