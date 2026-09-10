# 📚 Code Bookshelf

> A modern, interactive multi-language code snippet notebook and developer workspace. Write, run, organize, and share code snippets in **9+ programming languages** with real-time compilation, CodeMirror editing, Prism syntax highlighting, Markdown + KaTeX math rendering, and a spotlight command palette.

---

## ✨ Features

### 🚀 Multi-Language Compiler Engine
- **In-Browser Execution**: Native JavaScript sandbox with console output interception (`console.log`, `warn`, `error`).
- **Live HTML/CSS Preview**: Real-time iframe rendering for web frontend snippets.
- **Judge0 API Integration**: High-speed compilation & execution for:
  - **Python 3**
  - **Java (OpenJDK)** (Automatic AST normalization to `public class Main`)
  - **C (GCC)** & **C++ (G++)** (Auto-wraps raw code inside `int main()`)
  - **SQL (SQLite)**
  - **Rust**
  - **Go**
- **Standard Input (STDIN)**: Full STDIN support for interactive code algorithms.

### 📝 Code Editor & Rich Formatting
- **CodeMirror 5 Integration**: Line numbers, bracket matching, auto-indentation, and light/dark theme support.
- **Prism.js Syntax Highlighting**: Tokenized, high-contrast code block rendering on note cards.
- **Markdown Support**: Render headings, bold text, bullet lists, blockquotes, and tables using **Marked.js**.
- **LaTeX Math Equations**: Render inline (`$E=mc^2$`) and block (`$$\frac{a}{b}$$`) math formulas using **KaTeX**.
- **Inline Hashtags (`#tag`)**: Automatically parses `#hashtags` typed in notes and registers them as sidebar labels.
- **Interactive Checklists & Canvas Drawing**: Create task checklists or draw sketches directly onto notes.

### ⚡ Productivity & Quick Search
- **Spotlight Command Palette (`Ctrl` + `K` / `Cmd` + `K`)**: Quick command palette to search notes, jump to labels, toggle themes, or create code snippets from anywhere.
- **Filter & Search**: Search by text, programming language, note type (Code, Checklist, Text), or labels.
- **Drag & Drop Reordering**: Reorder notes intuitively with HTML5 drag and drop.
- **Views & Themes**: Grid vs. List view modes with instant Light / Dark mode toggle.

### 💾 Backup, Import & Link Sharing
- **Share Snippet Links**: Compress code into URL hash links using `lz-string` for instant sharing (`#sharedNote=...`).
- **GitHub Gist Import**: Import public Gists directly by entering a Gist URL or Gist ID.
- **JSON Backup & Restore**: Export all notes to JSON or restore from backup files.
- **Download as Source File**: Download any code snippet directly as a `.py`, `.js`, `.java`, `.cpp`, `.rs`, or `.go` file.

---

## 🛠️ Technology Stack

- **Frontend Core**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Code Editor**: [CodeMirror 5](https://codemirror.net/5/)
- **Syntax Highlighting**: [Prism.js](https://prismjs.com/)
- **Markdown & Math**: [Marked.js](https://marked.js.org/) & [KaTeX](https://katex.org/)
- **URL Compression**: [lz-string](https://pieroxy.net/blog/pages/lz-string/index.html)
- **Compiler Backend**: [Judge0 API](https://ce.judge0.com/)

---

## 🚀 Quick Start (Running Locally)

Since Code Bookshelf is a client-side web application, no build process or npm install is required!

### Option 1: Open Directly
Double-click `index.html` in your browser.

### Option 2: Run Local Web Server (Recommended)
Using Python:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

Using Node `npx`:
```bash
npx serve .
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | Open Spotlight Command Palette |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> | Save Note / Execute active Code Snippet |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd> | Focus Search Bar |
| <kbd>Escape</kbd> | Close Modals & Command Palette |

---

## 🌐 Hosting & Deployment

Code Bookshelf can be hosted for free on any static host:
- **GitHub Pages**: Go to Repo > Settings > Pages > Select `main` branch root (`/`).
- **Netlify**: Drag and drop the project folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **Vercel**: Run `npx vercel` in the project directory.

---

## 📄 License

MIT License © 2026 Code Bookshelf
