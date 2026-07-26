# HTML Integration Guide

## Quick Start for HTML/Vanilla JS Projects

The plugin is designed to work seamlessly with vanilla HTML/JavaScript projects without requiring any build tools or bundlers.

### Installation

#### Method 1: CDN (Recommended)

```html
<!-- Add this script tag to your HTML -->
<script src="https://cdn.example.com/editor-ai-plugin.min.js"></script>
```

#### Method 2: Local Installation

```html
<!-- Download the compiled plugin and include it -->
<script src="./editor-ai-plugin.umd.js"></script>
```

#### Method 3: NPM (For Node-based projects)

```bash
npm install editor-ai-plugin
```

```html
<script type="module">
  import { PluginManager } from './node_modules/editor-ai-plugin/dist/index.js';
  // Use the plugin
</script>
```

### Basic Usage

Once the plugin script is loaded, it automatically initializes and exposes a global API:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="editor-ai-plugin.umd.js"></script>
</head>
<body>
  <textarea id="editor"></textarea>

  <script>
    // The plugin is automatically available as window.EditorAIPlugin
    
    // Initialize with settings
    window.EditorAIPlugin.init({
      aiModel: 'local', // or 'openai', 'gemini', 'claude'
      enableOfflineMode: true
    });

    // Check grammar
    document.querySelector('button').onclick = async () => {
      const text = document.getElementById('editor').value;
      const result = await window.EditorAIPlugin.analyzeText(text);
      console.log(result);
    };
  </script>
</body>
</html>
```

### Global API Reference

```javascript
// Initialize plugin
window.EditorAIPlugin.init(config);

// Analyze text for grammar issues
await window.EditorAIPlugin.analyzeText(text);

// Correct text
await window.EditorAIPlugin.correctText(text);

// Get synonyms for a word
await window.EditorAIPlugin.getSynonyms(word);

// Generate content
await window.EditorAIPlugin.generateContent(request);

// Show/hide settings panel
window.EditorAIPlugin.showSettings();
window.EditorAIPlugin.hideSettings();

// Update settings
await window.EditorAIPlugin.updateSettings(settings);

// Download offline data
await window.EditorAIPlugin.downloadOfflineData();

// Check if online
const isOnline = window.EditorAIPlugin.isOnline();
```

## Offline Data Download

The plugin includes built-in offline data download functionality:

```javascript
// Download offline data (dictionaries, grammar rules, synonyms)
await window.EditorAIPlugin.downloadOfflineData();

// Data is automatically saved to localStorage
// Users can also download as a .json file for backup
```

### Offline Data Package Includes:

- **Spelling Dictionary** - 50+ common misspellings with corrections
- **Synonyms Dictionary** - 80+ words with alternative suggestions
- **Grammar Rules** - Common grammar error patterns
- **Common Phrases** - 40+ commonly used transitions and phrases

### Storage Details:

- **Location**: Browser localStorage (persistent across sessions)
- **Size**: ~2-3 MB for complete offline package
- **Availability**: Available without internet connection
- **Format**: JSON for easy import/export

## Configuration

```javascript
window.EditorAIPlugin.init({
  // AI Model selection
  aiModel: 'local',           // 'local' | 'openai' | 'gemini' | 'claude'
  apiKey: 'your-api-key',    // Required for online models
  apiEndpoint: 'https://...', // Optional custom endpoint

  // Correction settings
  correctionMode: 'suggestion', // 'manual' | 'suggestion' | 'automatic'
  autoCorrect: false,
  grammarStrictness: 'standard', // 'relaxed' | 'standard' | 'strict'

  // Language
  language: 'en',
  dialect: 'en-US',
  tone: 'professional',

  // Features
  enableOfflineMode: true,
  enableContentGeneration: true,
  enableSynonymSuggestions: true,
  debounceDelay: 300
});
```

## HTML Examples

### Example 1: Simple Textarea Integration

```html
<!DOCTYPE html>
<html>
<head>
  <script src="editor-ai-plugin.umd.js"></script>
  <style>
    textarea {
      width: 100%;
      height: 300px;
      padding: 10px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <h1>Grammar Checker</h1>
  <textarea id="editor" placeholder="Type text here..."></textarea>
  <button onclick="checkGrammar()">Check Grammar</button>
  <div id="results"></div>

  <script>
    window.EditorAIPlugin.init({ aiModel: 'local' });

    async function checkGrammar() {
      const text = document.getElementById('editor').value;
      const result = await window.EditorAIPlugin.analyzeText(text);
      
      document.getElementById('results').innerHTML = `
        <h3>Results:</h3>
        <p>Issues: ${result.issues.length}</p>
        <p>Readability: ${result.readabilityScore}/100</p>
      `;
    }
  </script>
</body>
</html>
```

### Example 2: Rich Text Editor Integration

```html
<!DOCTYPE html>
<html>
<head>
  <script src="editor-ai-plugin.umd.js"></script>
</head>
<body>
  <div id="editor" contenteditable="true" style="border: 1px solid #ccc; padding: 10px; min-height: 300px;">
    Type here...
  </div>
  <button onclick="checkContent()">🔍 Check Grammar</button>

  <script>
    window.EditorAIPlugin.init({ aiModel: 'local' });

    async function checkContent() {
      const text = document.getElementById('editor').textContent;
      const result = await window.EditorAIPlugin.analyzeText(text);
      alert(`Found ${result.issues.length} issues`);
    }
  </script>
</body>
</html>
```

### Example 3: Multi-Feature Office Suite Integration

```html
<!DOCTYPE html>
<html>
<head>
  <script src="editor-ai-plugin.umd.js"></script>
  <style>
    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    button {
      padding: 8px 16px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #764ba2;
    }
  </style>
</head>
<body>
  <h1>Writer's Assistant</h1>
  
  <div class="toolbar">
    <button onclick="checkGrammar()">✓ Check Grammar</button>
    <button onclick="findSynonyms()">🔤 Find Synonyms</button>
    <button onclick="improveText()">✨ Improve Text</button>
    <button onclick="showSettings()">⚙️ Settings</button>
    <button onclick="downloadOffline()">📥 Download Offline Data</button>
  </div>

  <textarea id="editor" style="width: 100%; height: 400px; padding: 10px; font-family: monospace;"></textarea>
  <div id="output" style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 4px;"></div>

  <script>
    window.EditorAIPlugin.init({
      aiModel: 'local',
      enableOfflineMode: true
    });

    async function checkGrammar() {
      const text = document.getElementById('editor').value;
      const result = await window.EditorAIPlugin.analyzeText(text);
      document.getElementById('output').innerHTML = `
        <strong>Grammar Check Results:</strong>
        <p>Issues: ${result.issues.length}</p>
        <p>Readability Score: ${result.readabilityScore}/100</p>
      `;
    }

    async function findSynonyms() {
      const selection = window.getSelection().toString();
      if (!selection) return;
      
      const synonyms = await window.EditorAIPlugin.getSynonyms(selection);
      document.getElementById('output').innerHTML = `
        <strong>Synonyms for "${selection}":</strong>
        <p>${synonyms.join(', ')}</p>
      `;
    }

    async function improveText() {
      const text = document.getElementById('editor').value;
      const result = await window.EditorAIPlugin.generateContent({
        type: 'improve',
        text: text
      });
      document.getElementById('editor').value = result.generated;
    }

    function showSettings() {
      window.EditorAIPlugin.showSettings();
    }

    async function downloadOffline() {
      await window.EditorAIPlugin.downloadOfflineData();
    }
  </script>
</body>
</html>
```

## Troubleshooting

### Plugin not loading?

```javascript
// Check if plugin is loaded
if (typeof window.EditorAIPlugin === 'undefined') {
  console.error('Plugin not loaded');
  // Ensure script tag is before closing </body>
}
```

### Offline data not saving?

```javascript
// Check localStorage availability
if (!navigator.storage) {
  console.error('localStorage not available');
}

// Check available space
const size = JSON.stringify(localStorage).length;
console.log('Storage used:', size, 'bytes');
```

### API key not working?

```javascript
// Validate API key before use
const isValid = await window.EditorAIPlugin.validateAPIKey('openai', 'sk-...');
if (!isValid) {
  console.error('Invalid API key');
}
```

## Browser Compatibility

| Browser | Support |
|---------|----------|
| Chrome | ✓ 90+ |
| Firefox | ✓ 88+ |
| Safari | ✓ 14+ |
| Edge | ✓ 90+ |
| IE 11 | ✗ Not supported |

## Performance Tips

1. **Use debouncing** for real-time checking:
   ```javascript
   const debounce = (fn, delay) => {
     let timeout;
     return (...args) => {
       clearTimeout(timeout);
       timeout = setTimeout(() => fn(...args), delay);
     };
   };
   
   editor.addEventListener('input', debounce(checkGrammar, 300));
   ```

2. **Cache results** for frequently analyzed text
3. **Download offline data** for improved performance without internet
4. **Use local mode** for instant responses

## Support

For issues, questions, or feature requests, please visit:
- GitHub Issues: https://github.com/higdsingh/Editor/issues
- Documentation: https://github.com/higdsingh/Editor
