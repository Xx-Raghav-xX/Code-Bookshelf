/**
 * Google Keep Clone - Robust Multi-Language Code Compiler Engine
 * Features:
 * - JavaScript: Native in-browser sandbox with console.log interception
 * - HTML/CSS: Live iframe preview
 * - Python, Java, C, C++, Rust, Go, SQL: High-speed Execution API
 * - Automatic AST-style Java Class Normalization & Package Removal
 * - Automatic C/C++ Main Wrapper for Quick Code Snippets
 * - Standard Input (STDIN) Execution Support
 */

class CodeCompilerEngine {
  constructor() {
    this.judge0PrimaryUrl = 'https://ce.judge0.com/submissions?wait=true';
    
    // Judge0 API Language Mappings
    this.languageMap = {
      javascript: { id: 63, label: 'JavaScript (Node.js)', badge: 'JS' },
      python:     { id: 71, label: 'Python 3', badge: 'PY' },
      java:       { id: 62, label: 'Java (OpenJDK)', badge: 'JAVA' },
      c:          { id: 50, label: 'C (GCC)', badge: 'C' },
      cpp:        { id: 54, label: 'C++ (G++)', badge: 'C++' },
      sql:        { id: 82, label: 'SQL (SQLite)', badge: 'SQL' },
      rust:       { id: 73, label: 'Rust', badge: 'RS' },
      go:         { id: 60, label: 'Go', badge: 'GO' },
      html:       { id: 0,  label: 'HTML/CSS', badge: 'HTML' }
    };
  }

  /**
   * Executes Code for a given language
   * @param {string} langKey - Language identifier
   * @param {string} code - Source code text
   * @param {string} [stdin=''] - Optional standard input string
   * @returns {Promise<{output: string, isError: boolean, executionTime?: string, isHtml?: boolean}>}
   */
  async execute(langKey, code, stdin = '') {
    if (!code || !code.trim()) {
      return { output: 'No code provided to execute.', isError: true };
    }

    const normalizedLang = (langKey || 'javascript').toLowerCase();

    // 1. Native JavaScript Browser Execution
    if (normalizedLang === 'javascript' || normalizedLang === 'js') {
      return this.executeJavaScript(code);
    }

    // 2. HTML / CSS Live Preview Generation
    if (normalizedLang === 'html') {
      return { output: code, isHtml: true, isError: false };
    }

    // 3. Normalize Source Code according to Language Rules
    let sourceCode = code;

    if (normalizedLang === 'java') {
      sourceCode = this.normalizeJavaCode(code);
    } else if (normalizedLang === 'c') {
      sourceCode = this.normalizeCCode(code);
    } else if (normalizedLang === 'cpp' || normalizedLang === 'c++') {
      sourceCode = this.normalizeCppCode(code);
    }

    const targetLang = this.languageMap[normalizedLang] || this.languageMap['python'];

    try {
      const payload = {
        source_code: sourceCode,
        language_id: targetLang.id
      };

      if (stdin && stdin.trim()) {
        payload.stdin = stdin.trim();
      }

      const response = await fetch(this.judge0PrimaryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Compiler API returned HTTP status ${response.status}`);
      }

      const data = await response.json();
      
      const stdout = data.stdout ? data.stdout.trim() : '';
      const stderr = data.stderr ? data.stderr.trim() : '';
      const compileOutput = data.compile_output ? data.compile_output.trim() : '';
      const message = data.message ? data.message.trim() : '';
      const duration = data.time ? `${parseFloat(data.time).toFixed(2)}s` : null;

      if (stdout) {
        return {
          output: stdout,
          isError: false,
          executionTime: duration
        };
      }

      const errText = compileOutput || stderr || message || (data.status ? data.status.description : 'Code executed cleanly with no console output.');
      const isError = Boolean(compileOutput || stderr || (data.status && data.status.id >= 6));

      return {
        output: errText,
        isError: isError,
        executionTime: duration
      };
    } catch (err) {
      console.error('Online Compiler Error:', err);
      return {
        output: `Error connecting to Compiler Engine: ${err.message}\nPlease verify your internet connection.`,
        isError: true
      };
    }
  }

  /**
   * Robust Java Code Normalization
   * Strips packages, normalizes class containing main method to `public class Main`,
   * strips `public` from non-main classes, and wraps raw statements into a Main class.
   */
  normalizeJavaCode(code) {
    if (!code || !code.trim()) return code;
    try {
      let normalized = code;

      // 1. Remove package declarations (e.g. package com.example;)
      normalized = normalized.replace(/package\s+[a-zA-Z0-9_.]+;\s*/g, '');

      // 2. Check if main method exists
      const hasMainMethod = /static\s+void\s+main\b/.test(normalized);
      const hasClassDef = /\bclass\s+[A-Za-z0-9_]+/.test(normalized);

      // If unwrapped raw statements (no class or no main method), wrap in standard template
      if (!hasClassDef || !hasMainMethod) {
        return `public class Main {\n    public static void main(String[] args) {\n        ${normalized}\n    }\n}`;
      }

      // 3. Extract all class definitions and locate class containing main method
      const classes = [];
      const classRegex = /(?:public\s+)?class\s+([A-Za-z0-9_]+)/g;
      let match;
      while ((match = classRegex.exec(normalized)) !== null) {
        classes.push({ name: match[1], index: match.index });
      }

      let mainClassName = null;
      const mainPos = normalized.search(/static\s+void\s+main\b/);

      if (mainPos !== -1 && classes.length > 0) {
        for (let i = classes.length - 1; i >= 0; i--) {
          if (classes[i].index < mainPos) {
            mainClassName = classes[i].name;
            break;
          }
        }
      }

      if (!mainClassName && classes.length > 0) {
        mainClassName = classes[0].name;
      }

      if (mainClassName) {
        // Strip 'public' keyword from non-main classes so javac won't fail with "declared in a file named..."
        normalized = normalized.replace(/public\s+class\s+([A-Za-z0-9_]+)/g, (fullMatch, clsName) => {
          return clsName === mainClassName ? 'public class Main' : `class ${clsName}`;
        });

        // Replace references to mainClassName with Main
        if (mainClassName !== 'Main') {
          normalized = normalized.replace(new RegExp(`\\bclass\\s+${mainClassName}\\b`, 'g'), 'class Main');
          normalized = normalized.replace(new RegExp(`\\b${mainClassName}\\b`, 'g'), 'Main');
        }
      }

      return normalized;
    } catch (e) {
      console.warn('Java normalization warning:', e);
      return code;
    }
  }

  /**
   * Auto-wraps raw C code statements without main() into standard main template
   */
  normalizeCCode(code) {
    if (!code || !code.trim()) return code;
    if (!/\bint\s+main\b|\bvoid\s+main\b/.test(code)) {
      return `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    ${code}\n    return 0;\n}`;
    }
    return code;
  }

  /**
   * Auto-wraps raw C++ code statements without main() into standard main template
   */
  normalizeCppCode(code) {
    if (!code || !code.trim()) return code;
    if (!/\bint\s+main\b|\bvoid\s+main\b/.test(code)) {
      return `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    ${code}\n    return 0;\n}`;
    }
    return code;
  }

  /**
   * Native JavaScript Sandbox with intercepted Console Output
   */
  executeJavaScript(code) {
    const logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.map(a => this.formatArg(a)).join(' ')),
      error: (...args) => logs.push('ERROR: ' + args.map(a => this.formatArg(a)).join(' ')),
      warn: (...args) => logs.push('WARN: ' + args.map(a => this.formatArg(a)).join(' ')),
      info: (...args) => logs.push('INFO: ' + args.map(a => this.formatArg(a)).join(' '))
    };

    try {
      const startTime = performance.now();
      const runFn = new Function('console', code);
      const result = runFn(customConsole);
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      if (result !== undefined && logs.length === 0) {
        logs.push(this.formatArg(result));
      }

      const outputText = logs.length > 0 ? logs.join('\n') : 'Code executed cleanly with no output.';

      return {
        output: outputText,
        isError: false,
        executionTime: `${duration}s`
      };
    } catch (err) {
      return {
        output: `Runtime Error: ${err.message}\n${err.stack ? err.stack.split('\n')[0] : ''}`,
        isError: true
      };
    }
  }

  formatArg(arg) {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  }

  /**
   * Generates HTML with Prism syntax highlighting if Prism is loaded, otherwise escapes HTML
   * @param {string} code 
   * @param {string} langKey 
   * @returns {string} HTML string
   */
  highlightCode(code, langKey) {
    if (!code) return '';
    const safeCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const lang = (langKey || 'javascript').toLowerCase();

    if (typeof Prism !== 'undefined' && Prism.highlight) {
      const prismLang = this.getPrismLanguage(lang);
      if (prismLang && Prism.languages[prismLang]) {
        try {
          return Prism.highlight(code, Prism.languages[prismLang], prismLang);
        } catch (e) {
          console.warn('Prism highlight error:', e);
        }
      }
    }
    return safeCode;
  }

  getPrismLanguage(lang) {
    const map = {
      javascript: 'javascript',
      js: 'javascript',
      python: 'python',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cplusplus: 'cpp',
      sql: 'sql',
      rust: 'rust',
      rs: 'rust',
      go: 'go',
      html: 'markup',
      css: 'css'
    };
    return map[lang] || 'javascript';
  }

  /**
   * Returns corresponding CodeMirror mode identifier
   * @param {string} langKey 
   * @returns {string} CodeMirror mode string
   */
  getCodeMirrorMode(langKey) {
    const lang = (langKey || 'javascript').toLowerCase();
    const modeMap = {
      javascript: 'javascript',
      js: 'javascript',
      python: 'python',
      py: 'python',
      java: 'text/x-java',
      c: 'text/x-csrc',
      cpp: 'text/x-c++src',
      cplusplus: 'text/x-c++src',
      sql: 'sql',
      rust: 'rust',
      rs: 'rust',
      go: 'go',
      html: 'htmlmixed',
      css: 'css'
    };
    return modeMap[lang] || 'javascript';
  }
}

window.codeCompiler = new CodeCompilerEngine();



