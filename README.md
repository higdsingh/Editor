# AI Grammar & Content Plugin for Web-Based Office Suite

A comprehensive plugin that provides real-time grammar checking, content improvement, synonym suggestions, and AI-powered content generation capabilities for web-based office suite applications.

## 🎯 Features

### Grammar & Spelling
- ✅ Real-time grammar checking with instant feedback
- ✅ Spelling error detection and suggestions
- ✅ Punctuation issue identification
- ✅ Configurable strictness levels (relaxed, standard, strict)
- ✅ Automatic or manual correction modes

### Synonym & Vocabulary Enhancement
- ✅ Synonym suggestions for better word choice
- ✅ Vocabulary enhancement based on difficulty level
- ✅ Antonym suggestions
- ✅ Related word recommendations
- ✅ Offline dictionary support

### Content Generation & Improvement
- ✅ AI-powered content completion
- ✅ Text expansion and summarization
- ✅ Article writing with structured outlines
- ✅ Content rewriting for different purposes (clarity, conciseness, engagement)
- ✅ Tone and style customization

### AI Model Support
- ✅ **Local/Offline Mode**: Full functionality with limitations
- ✅ **OpenAI GPT**: Advanced grammar and content generation
- ✅ **Google Gemini**: Enhanced analysis and writing
- ✅ **Claude**: Sophisticated content creation
- ✅ Automatic fallback to local processing

### Settings & Configuration
- ✅ Select preferred AI model
- ✅ API key management
- ✅ Language and dialect selection
- ✅ Tone and formality preferences
- ✅ Readability level settings
- ✅ Offline mode with graceful degradation

## 📦 Installation

```bash
npm install editor-ai-plugin
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { PluginManager } from 'editor-ai-plugin';
import { EditorIntegration } from 'editor-ai-plugin/integration';

// Initialize the plugin
const plugin = new PluginManager({
  aiModel: 'local', // Start with local mode
  enableOfflineMode: true,
  correctionMode: 'suggestion',
});

// Integrate with your editor
const integration = new EditorIntegration('#editor-textarea');
integration.showPanel();
```

### With AI Model (OpenAI Example)

```typescript
const plugin = new PluginManager({
  aiModel: 'openai',
  apiKey: 'sk-...', // Your OpenAI API key
  correctionMode: 'automatic',
  enableContentGeneration: true,
});
```

### Grammar Checking

```typescript
const result = await plugin.analyzeText('Your text here');
console.log(result.issues);           // Grammar issues
console.log(result.readabilityScore); // 0-100 score
console.log(result.wordCount);        // Word statistics
```

### Getting Synonyms

```typescript
const synonyms = await plugin.getSynonymSuggestions('good');
// Returns: ['excellent', 'great', 'fantastic', 'wonderful', ...]
```

### Content Generation

```typescript
const article = await plugin.writeArticle({
  title: 'Introduction to AI',
  topic: 'Artificial Intelligence',
  sections: 3,
});
```

### Rewriting Content

```typescript
const rewritten = await plugin.rewriteContent({
  content: 'Your original text',
  purpose: 'clarity', // or 'conciseness', 'engagement', 'formality', 'simplification'
  tone: 'professional',
});
```

## 🔧 Configuration

### Default Settings

```typescript
interface PluginSettings {
  // AI Model
  aiModel: 'openai' | 'gemini' | 'claude' | 'local'; // default: 'local'
  apiKey?: string;
  apiEndpoint?: string;

  // Grammar
  correctionMode: 'manual' | 'automatic' | 'suggestion'; // default: 'suggestion'
  autoCorrect: boolean; // default: false
  grammarStrictness: 'relaxed' | 'standard' | 'strict'; // default: 'standard'

  // Language & Style
  language: string; // default: 'en'
  dialect: string; // default: 'en-US'
  tone: 'formal' | 'casual' | 'professional' | 'creative'; // default: 'professional'
  readabilityLevel: 'beginner' | 'intermediate' | 'advanced';

  // Features
  enableSynonymSuggestions: boolean; // default: true
  enableContentGeneration: boolean; // default: true
  enableOfflineMode: boolean; // default: true
}
```

### Updating Settings

```typescript
await plugin.updateSettings({
  aiModel: 'openai',
  apiKey: 'your-api-key',
  tone: 'casual',
  grammarStrictness: 'strict',
});
```

## 🌐 Offline Mode

When running in offline mode (no AI model selected or no internet connection), the plugin provides:

- **Available:**
  - Grammar checking (basic patterns)
  - Spelling detection (common errors)
  - Punctuation checking
  - Synonym suggestions (limited dictionary)
  - Text statistics (word count, readability)

- **Limited/Unavailable:**
  - Advanced grammar analysis
  - Content generation (templates only)
  - Complex rewriting tasks
  - Article writing

```typescript
// Check offline status
if (plugin.isOfflineMode()) {
  console.log('Running in offline mode');
  console.log(plugin.getOfflineLimitations());
}
```

## 🎨 UI Integration

### Render Grammar Issues

```typescript
const ui = new PluginUI('plugin-container');
const issues = await plugin.getGrammarIssues(text);
const issuesPanel = ui.renderGrammarIssues(issues);
```

### Render Settings Panel

```typescript
const settingsPanel = ui.renderSettings(plugin.getSettings());
```

### Show Notifications

```typescript
ui.showNotification('Grammar check complete!', 'success');
ui.showNotification('Error connecting to AI service', 'error');
```

## 🔌 Event Hooks

```typescript
plugin.registerHooks({
  onTextChange: (text: string) => {
    console.log('Text changed:', text);
  },
  onIssueFound: (issue) => {
    console.log('Issue found:', issue);
  },
  onCorrection: (result) => {
    console.log('Correction applied:', result);
  },
  onSettingsChange: (settings) => {
    console.log('Settings updated:', settings);
  },
  onError: (error) => {
    console.error('Plugin error:', error);
  },
});
```

## 📋 API Reference

### Grammar & Analysis

```typescript
// Analyze entire text
await plugin.analyzeText(text: string): Promise<AnalysisResult>

// Get only grammar issues
await plugin.getGrammarIssues(text: string): Promise<GrammarIssue[]>

// Correct text
await plugin.correctText(text: string): Promise<CorrectionResult>

// Auto-correct (local only)
plugin.autoCorrectText(text: string): string
```

### Synonyms & Vocabulary

```typescript
// Get synonym suggestions
await plugin.getSynonymSuggestions(word: string): Promise<string[]>

// Find better word alternatives in text
await plugin.findBetterWords(text: string): Promise<Map<string, string[]>>
```

### Content Generation

```typescript
// Generate content
await plugin.generateContent(request: ContentGenerationRequest): Promise<GeneratedContent>

// Write article
await plugin.writeArticle(request: ArticleWritingRequest): Promise<string>

// Rewrite content
await plugin.rewriteContent(request: ContentRewriteRequest): Promise<string>

// Improve content
await plugin.improveContent(text: string, instructions?: string): Promise<string>
```

### Settings

```typescript
// Get current settings
plugin.getSettings(): PluginSettings

// Update settings
await plugin.updateSettings(settings: Partial<PluginSettings>): Promise<void>

// Get available AI models
await plugin.getAvailableModels(): Promise<AIModel[]>

// Validate API key
await plugin.validateAPIKey(model: AIModel, key: string): Promise<boolean>
```

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     Plugin Integration Layer        │
│  (EditorIntegration, PluginUI)      │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│        PluginManager (API)          │
│    - Orchestrates all components    │
└──────────────────┬──────────────────┘
                   │
      ┌────────────┼────────────┬───────────────┐
      │            │            │               │
      ▼            ▼            ▼               ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐
│ Grammar  │ │ Synonym  │ │   AI     │ │ Content   │
│ Checker  │ │  Engine  │ │ Provider │ │ Generator │
└──────────┘ └──────────┘ └──────────┘ └───────────┘
      │            │            │               │
      └────────────┼────────────┼───────────────┘
                   │
      ┌────────────▼────────────┐
      │   Local Processing /    │
      │    AI Model APIs        │
      └─────────────────────────┘
```

## 🔐 API Key Management

### OpenAI

```typescript
await plugin.validateAPIKey('openai', 'sk-...');
await plugin.updateSettings({
  aiModel: 'openai',
  apiKey: 'sk-...',
});
```

### Google Gemini

```typescript
await plugin.validateAPIKey('gemini', 'AIza...');
await plugin.updateSettings({
  aiModel: 'gemini',
  apiKey: 'AIza...',
});
```

### Claude

```typescript
await plugin.validateAPIKey('claude', 'sk-ant-...');
await plugin.updateSettings({
  aiModel: 'claude',
  apiKey: 'sk-ant-...',
});
```

## 📊 Performance Considerations

- **Debounce Delay**: Default 300ms for real-time checking
- **Batch Processing**: Enable for large documents
- **Local Processing**: ~100ms for 1000 words
- **API Requests**: 1-3s depending on model and content

## 🐛 Error Handling

```typescript
try {
  const result = await plugin.analyzeText(text);
} catch (error) {
  console.error('Analysis failed:', error);
  // Automatically falls back to local processing
}
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please see CONTRIBUTING.md

## 📞 Support

For issues and questions, please open a GitHub issue or contact support.
