/**
 * Code Bookshelf - AI Code Assistant Engine (Explain, Optimize, Bug Fix & Snippet Generation)
 */
class AICodeAssistant {
  constructor() {
    this.provider = localStorage.getItem('keep-ai-provider') || 'free';
    this.apiKey = localStorage.getItem('keep-ai-apikey') || '';
  }

  setProvider(provider, apiKey = '') {
    this.provider = provider;
    this.apiKey = apiKey;
    localStorage.setItem('keep-ai-provider', provider);
    localStorage.setItem('keep-ai-apikey', apiKey);
  }

  async callLLM(systemPrompt, userPrompt) {
    if (this.provider === 'gemini' && this.apiKey) {
      return await this.callGeminiAPI(systemPrompt, userPrompt);
    }
    return await this.callPollinationsAPI(systemPrompt, userPrompt);
  }

  async callPollinationsAPI(systemPrompt, userPrompt) {
    const url = 'https://text.pollinations.ai/';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'openai',
        jsonMode: false
      })
    });

    if (!response.ok) {
      throw new Error(`AI service error (HTTP ${response.status})`);
    }

    const text = await response.text();
    return text.trim();
  }

  async callGeminiAPI(systemPrompt, userPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nUser Request:\n${userPrompt}` }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error (HTTP ${response.status})`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  }

  /**
   * 💡 1. Explain Code
   */
  async explainCode(code, language) {
    const systemPrompt = `You are an expert programming tutor and computer scientist. Explain the provided code snippet clearly. Include:
1. High-level Summary (what the snippet does).
2. Step-by-step Line-by-Line breakdown.
3. Time & Space Complexity analysis (e.g. O(N), O(1)).
4. Key Concepts & Edge cases.
Format your response using clean, standard Markdown.`;

    const userPrompt = `Language: ${language || 'javascript'}\nCode:\n\`\`\`${language || ''}\n${code}\n\`\`\``;
    return await this.callLLM(systemPrompt, userPrompt);
  }

  /**
   * ⚡ 2. Optimize & Refactor Code
   */
  async optimizeCode(code, language) {
    const systemPrompt = `You are a principal software engineer. Optimize and refactor the provided code snippet for execution speed, syntax readability, and minimal time/space complexity.
Provide response in strict format:
EXPLANATION:
<markdown explanation of optimizations made>

REFACTORED_CODE:
\`\`\`${language || ''}
<only the full refactored working code here>
\`\`\``;

    const userPrompt = `Language: ${language || 'javascript'}\nOriginal Code:\n\`\`\`${language || ''}\n${code}\n\`\`\``;
    return await this.callLLM(systemPrompt, userPrompt);
  }

  /**
   * 🐛 3. Auto-Fix Bugs from Execution Errors
   */
  async fixBug(code, language, errorOutput, stdin = '') {
    const systemPrompt = `You are an expert compiler and debugging engineer. A user code snippet failed during execution with an error. Analyze the code and execution log, diagnose the root cause, and provide the fixed code.
Provide response in strict format:
BUG_DIAGNOSIS:
<markdown explanation of what caused the bug and how to fix it>

FIXED_CODE:
\`\`\`${language || ''}
<only the full corrected working code here>
\`\`\``;

    const userPrompt = `Language: ${language || 'javascript'}\nCode:\n\`\`\`${language || ''}\n${code}\n\`\`\`\n\nStdin:\n${stdin}\n\nExecution Output / Error Log:\n${errorOutput}`;
    return await this.callLLM(systemPrompt, userPrompt);
  }

  /**
   * ✨ 4. Generate Code Snippet from Prompt
   */
  async generateSnippet(promptText, targetLanguage = 'javascript') {
    const systemPrompt = `You are an AI code generator. Create a clean, production-ready, working code snippet in ${targetLanguage} based on the user request. Include example usage / test cases.
Provide response in strict format:
TITLE: <concise title for the note>
EXPLANATION: <brief summary>
CODE:
\`\`\`${targetLanguage}
<complete working code here>
\`\`\``;

    const userPrompt = `Target Language: ${targetLanguage}\nRequest: ${promptText}`;
    return await this.callLLM(systemPrompt, userPrompt);
  }

  parseCodeBlock(rawResponse) {
    const codeMatch = rawResponse.match(/```(?:\w+)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : null;
  }
}

window.aiAssistant = new AICodeAssistant();
