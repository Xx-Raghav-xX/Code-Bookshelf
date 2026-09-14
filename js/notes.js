const PRESET_CODE_TEMPLATES = [
  {
    id: 'preset_cpp_cp',
    name: 'Competitive Programming C++ Template',
    language: 'cpp',
    icon: '⚡',
    code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void solve() {
    int n;
    if (!(cin >> n)) return;
    cout << "Processing testcase with N = " << n << endl;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int t = 1;
    cin >> t;
    while(t--) {
        solve();
    }
    return 0;
}`
  },
  {
    id: 'preset_express_api',
    name: 'Express.js REST API Starter',
    language: 'javascript',
    icon: '🌐',
    code: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/data', (req, res) => {
    const { name, payload } = req.body;
    res.status(201).json({ message: 'Created', data: { name, payload } });
});

app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});`
  },
  {
    id: 'preset_python_fastio',
    name: 'Python Fast I/O & Main Starter',
    language: 'python',
    icon: '🐍',
    code: `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        print("No input provided.")
        return
    print(f"Read {len(input_data)} tokens from stdin.")
    print("Tokens:", input_data)

if __name__ == '__main__':
    main()`
  },
  {
    id: 'preset_java_starter',
    name: 'Java Scanner & Class Template',
    language: 'java',
    icon: '☕',
    code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter your name:");
        if (sc.hasNext()) {
            String name = sc.next();
            System.out.println("Hello, " + name + "! Welcome to Code Bookshelf.");
        } else {
            System.out.println("Hello, World!");
        }
        sc.close();
    }
}`
  },
  {
    id: 'preset_sql_schema',
    name: 'SQL Schema & CRUD Template',
    language: 'sql',
    icon: '🗃️',
    code: `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email) VALUES
    ('raghav_c', 'raghav@example.com'),
    ('antigravity_dev', 'ai@example.com');

SELECT * FROM users ORDER BY created_at DESC;`
  },
  {
    id: 'preset_go_http',
    name: 'Go HTTP Web Server Template',
    language: 'go',
    icon: '⚡',
    code: `package main

import (
    "fmt"
    "net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello World from Go Server! Path: %s\n", r.URL.Path)
}

func main() {
    http.HandleFunc("/", handler)
    fmt.Println("Server running on http://localhost:8080")
    http.ListenAndServe(":8080", nil)
}`
  },
  {
    id: 'preset_rust_starter',
    name: 'Rust Fast I/O Starter',
    language: 'rust',
    icon: '🦀',
    code: `use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    println!("Enter text:");
    for line in stdin.lock().lines() {
        match line {
            Ok(content) => println!("Echo: {}", content),
            Err(err) => eprintln!("Error: {}", err),
        }
    }
}`
  },
  {
    id: 'preset_html_live',
    name: 'HTML5 Live Preview Component',
    language: 'html',
    icon: '🎨',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; text-align: center; }
    .card { background: #1e293b; padding: 24px; border-radius: 12px; max-width: 400px; margin: auto; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    button { background: #3b82f6; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🚀 Live HTML Component</h2>
    <p>Interactive web widget preview.</p>
    <button onclick="alert('Hello from Code Bookshelf!')">Click Me!</button>
  </div>
</body>
</html>`
  }
];

class NotesManager {
  constructor() {
    this.notes = this.loadFromStorage();
    this.labels = this.loadLabelsFromStorage();
    this.collections = this.loadCollectionsFromStorage();
    this.presetTemplates = PRESET_CODE_TEMPLATES;
    this.customTemplates = this.loadTemplatesFromStorage();
    
    // Layout & Filter State
    this.isListView = localStorage.getItem('keep-list-view') === 'true';
    this.selectedLanguageFilter = 'all';
    this.selectedTypeFilter = 'all';
    this.selectedTagFilters = [];
    this.isStarredFilter = false;
    this.defaultCodeLanguage = localStorage.getItem('keep-default-lang') || 'javascript';

    // Note Creator State
    this.selectedColor = 'default';
    this.isPinned = false;
    this.selectedLabels = [];
    this.selectedReminder = null;

    this.currentView = 'notes'; // 'notes', 'reminders', 'archive', 'bin', 'favorites', 'label_<name>', 'collection_<id>'
    this.searchQuery = '';

    // Advanced Note Creator State
    this.isChecklistMode = false;
    this.checklistItems = [];
    this.isCodeMode = false;
    this.codeLanguage = this.defaultCodeLanguage;
    this.codeContent = '';
    this.attachedImage = null;

    // Currently Editing Note ID & Dragging Note ID
    this.editingNoteId = null;
    this.draggedNoteId = null;

    // Active collection being managed
    this.activeManageCollectionId = null;

    // Canvas State
    this.drawingColor = '#202124';
    this.isDrawing = false;

    // Command Palette State
    this.paletteSelectedIndex = 0;
    this.paletteFilteredItems = [];
  }

  getNotesStorageKey() {
    const userId = window.googleAuth ? window.googleAuth.getCurrentUserId() : '';
    return userId ? `keep-notes-${userId}` : 'keep-notes';
  }

  getLabelsStorageKey() {
    const userId = window.googleAuth ? window.googleAuth.getCurrentUserId() : '';
    return userId ? `keep-labels-${userId}` : 'keep-labels';
  }

  getCollectionsStorageKey() {
    const userId = window.googleAuth ? window.googleAuth.getCurrentUserId() : '';
    return userId ? `keep-collections-${userId}` : 'keep-collections';
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.getNotesStorageKey());
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load notes:', e);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.getNotesStorageKey(), JSON.stringify(this.notes));
      const userId = window.googleAuth ? window.googleAuth.getCurrentUserId() : '';
      if (userId && window.cloudDb && window.cloudDb.isReady()) {
        window.cloudDb.batchSaveNotes(userId, this.notes);
      }
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  }

  loadLabelsFromStorage() {
    try {
      const data = localStorage.getItem(this.getLabelsStorageKey());
      return data ? JSON.parse(data) : ['Personal', 'Work', 'Ideas'];
    } catch (e) {
      return ['Personal', 'Work', 'Ideas'];
    }
  }

  saveLabelsToStorage() {
    try {
      localStorage.setItem(this.getLabelsStorageKey(), JSON.stringify(this.labels));
    } catch (e) {
      console.error('Failed to save labels:', e);
    }
  }

  loadCollectionsFromStorage() {
    try {
      const data = localStorage.getItem(this.getCollectionsStorageKey());
      if (data) {
        const cols = JSON.parse(data);
        if (Array.isArray(cols) && cols.length > 0) return cols;
      }
    } catch (e) {
      console.error('Failed to load collections:', e);
    }

    return [
      {
        id: 'col_leetcode_75',
        name: 'LeetCode 75 Patterns',
        description: 'Top algorithm patterns & problem-solving code templates for technical interviews',
        icon: '⚡',
        noteIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'col_react_hooks',
        name: 'React Custom Hooks',
        description: 'Useful reusable Hooks for production React applications',
        icon: '⚛️',
        noteIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'col_system_design',
        name: 'System Design Cheatsheet',
        description: 'Core architectural principles, caching, and scalability code references',
        icon: '🏗️',
        noteIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  saveCollectionsToStorage() {
    try {
      localStorage.setItem(this.getCollectionsStorageKey(), JSON.stringify(this.collections));
    } catch (e) {
      console.error('Failed to save collections:', e);
    }
  }

  getTemplatesStorageKey() {
    const userId = window.googleAuth ? window.googleAuth.getCurrentUserId() : '';
    return userId ? `keep-templates-${userId}` : 'keep-templates';
  }

  loadTemplatesFromStorage() {
    try {
      const data = localStorage.getItem(this.getTemplatesStorageKey());
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load custom templates:', e);
      return [];
    }
  }

  saveTemplatesToStorage() {
    try {
      localStorage.setItem(this.getTemplatesStorageKey(), JSON.stringify(this.customTemplates));
    } catch (e) {
      console.error('Failed to save custom templates:', e);
    }
  }

  getActivityStorageKey() {
    const userId = window.googleAuth ? window.googleAuth.getCurrentUserId() : '';
    return userId ? `keep-activity-log-${userId}` : 'keep-activity-log';
  }

  loadActivityLog() {
    try {
      const data = localStorage.getItem(this.getActivityStorageKey());
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Failed to load activity log:', e);
      return {};
    }
  }

  logActivity(count = 1) {
    try {
      const log = this.loadActivityLog();
      const today = new Date().toISOString().slice(0, 10);
      log[today] = (log[today] || 0) + count;
      localStorage.setItem(this.getActivityStorageKey(), JSON.stringify(log));
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  }

  calculateStreak(activityMap) {
    let streak = 0;
    const d = new Date();
    const todayStr = d.toISOString().slice(0, 10);
    
    if (!activityMap[todayStr]) {
      d.setDate(d.getDate() - 1);
    }

    while (true) {
      const dateStr = d.toISOString().slice(0, 10);
      if (activityMap[dateStr] && activityMap[dateStr] > 0) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  renderAnalyticsDashboard() {
    const activityLog = this.loadActivityLog();
    const codeNotes = this.notes.filter(n => n.isCode && !n.isBinned);

    let totalLines = 0;
    const langLinesMap = {};
    const langColors = {
      javascript: '#f1e05a',
      python: '#3572A5',
      cpp: '#f34b7d',
      c: '#555555',
      java: '#b07219',
      rust: '#dea584',
      go: '#00ADD8',
      sql: '#e38c00',
      html: '#e34c26'
    };

    codeNotes.forEach(n => {
      const lines = (n.code || '').split('\n').length;
      totalLines += lines;
      const lang = (n.codeLanguage || 'javascript').toLowerCase();
      langLinesMap[lang] = (langLinesMap[lang] || 0) + lines;
    });

    const activeStreak = this.calculateStreak(activityLog);
    const totalActivities = Object.values(activityLog).reduce((a, b) => a + b, 0);
    const sortedLangs = Object.keys(langLinesMap).sort((a, b) => langLinesMap[b] - langLinesMap[a]);

    let barSegmentsHtml = '';
    let langListHtml = '';

    if (totalLines > 0 && sortedLangs.length > 0) {
      sortedLangs.forEach(lang => {
        const lines = langLinesMap[lang];
        const pct = Math.round((lines / totalLines) * 100);
        const color = langColors[lang] || '#a855f7';
        const formattedLang = lang === 'cpp' ? 'C++' : (lang === 'javascript' ? 'JS' : lang.toUpperCase());

        barSegmentsHtml += `<div class="language-stacked-segment" style="width: ${pct}%; background-color: ${color};" data-tooltip="${formattedLang}: ${lines} lines (${pct}%)"></div>`;

        langListHtml += `
          <div class="language-item">
            <div class="language-dot" style="background-color: ${color};"></div>
            <span class="language-name">${formattedLang}</span>
            <span class="language-percent">${pct}%</span>
          </div>
        `;
      });
    } else {
      barSegmentsHtml = `<div class="language-stacked-segment" style="width: 100%; background-color: var(--border-color);" data-tooltip="No code stored yet"></div>`;
      langListHtml = `<span style="font-size: 12px; color: var(--text-secondary);">No code snippets created yet.</span>`;
    }

    const heatmapCells = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 364);

    let curr = new Date(startDate);
    while (curr <= endDate) {
      const dateStr = curr.toISOString().slice(0, 10);
      const count = activityLog[dateStr] || 0;

      let level = 0;
      if (count >= 10) level = 4;
      else if (count >= 6) level = 3;
      else if (count >= 3) level = 2;
      else if (count >= 1) level = 1;

      const formattedDate = curr.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      const tooltipText = `${count} activity action${count === 1 ? '' : 's'} on ${formattedDate}`;

      heatmapCells.push(`<div class="heatmap-cell level-${level}" data-tooltip="${this.escapeHtml(tooltipText)}"></div>`);

      curr.setDate(curr.getDate() + 1);
    }

    return `
      <div class="analytics-dashboard-container">
        <div class="analytics-header">
          <h2>📊 Developer Analytics & Activity Dashboard</h2>
          <p>Real-time telemetry on code volume, language distribution, and daily programming streak</p>
        </div>

        <div class="analytics-stats-grid">
          <div class="stat-card">
            <div class="stat-card-title">Stored Code Snippets</div>
            <div class="stat-card-value">${codeNotes.length}</div>
            <div class="stat-card-sub text-muted">Across all active notebooks</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Total Lines of Code</div>
            <div class="stat-card-value">${totalLines.toLocaleString()}</div>
            <div class="stat-card-sub text-muted">Written & persisted in Keep</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Coding Activity Streak</div>
            <div class="stat-card-value">🔥 ${activeStreak} <span style="font-size: 16px; font-weight: normal;">Days</span></div>
            <div class="stat-card-sub text-muted">Current consecutive streak</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Total Activity Actions</div>
            <div class="stat-card-value">⚡ ${totalActivities}</div>
            <div class="stat-card-sub text-muted">Snippet additions & executions</div>
          </div>
        </div>

        <div class="analytics-section-card">
          <h3 class="analytics-section-title">🎨 Language Distribution</h3>
          <div class="language-stacked-bar">
            ${barSegmentsHtml}
          </div>
          <div class="language-list-grid">
            ${langListHtml}
          </div>
        </div>

        <div class="analytics-section-card">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
            <h3 class="analytics-section-title" style="margin: 0;">🟩 365-Day Activity Heatmap</h3>
            <div style="font-size: 12px; color: var(--text-secondary);">
              Total: <strong>${totalActivities} actions</strong> past year
            </div>
          </div>

          <div class="heatmap-grid-container">
            <div class="heatmap-grid">
              ${heatmapCells.join('')}
            </div>
          </div>

          <div class="heatmap-legend">
            <span>Less</span>
            <div class="heatmap-cell level-0"></div>
            <div class="heatmap-cell level-1"></div>
            <div class="heatmap-cell level-2"></div>
            <div class="heatmap-cell level-3"></div>
            <div class="heatmap-cell level-4"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    `;
  }

  init() {
    this.initToast();
    this.initViewToggle();
    this.initExportListener();
    this.initKeyboardShortcuts();
    this.initSearchFilterPopover();
    this.initSettingsModal();
    this.initCreator();
    this.initColorPicker();
    this.initSearchListener();
    this.initDrawingCanvas();
    this.initRemindersPopover();
    this.initLabelsPopover();
    this.initEditLabelsModal();
    this.initEditNoteModal();
    this.initCommandPalette();
    this.initCollections();
    this.initTemplates();
    this.renderSidebarCollections();

    // Listen for auth changes to dynamically switch notebook storage
    window.addEventListener('auth:change', (e) => {
      this.notes = this.loadFromStorage();
      this.labels = this.loadLabelsFromStorage();
      this.collections = this.loadCollectionsFromStorage();
      this.renderSidebarLabels();
      this.renderSidebarCollections();
      this.render();

      const user = e.detail ? e.detail.user : null;
      if (user) {
        this.showToast(`Welcome back, ${user.name}!`);
        if (window.cloudDb && window.cloudDb.isReady()) {
          window.cloudDb.listenToUserNotes(user.id, (cloudNotes) => {
            if (Array.isArray(cloudNotes) && cloudNotes.length > 0) {
              this.notes = cloudNotes;
              localStorage.setItem(this.getNotesStorageKey(), JSON.stringify(this.notes));
              this.render();
            }
          });
        }
      } else {
        this.showToast('Signed out. Switched to Guest notebook.');
        if (window.cloudDb) {
          window.cloudDb.stopListening();
        }
      }
    });

    this.renderSidebarLabels();
    this.applyListViewState();
    this.render();
    this.checkUrlHashForSharedNote();
  }

  initSearchFilterPopover() {
    this.renderTagFilterChips();

    // 1. Toggle Filter Popover & Clear Action via Event Delegation
    document.addEventListener('click', (e) => {
      const filterBtn = e.target.closest('#search-filter-btn');
      if (filterBtn) {
        e.stopPropagation();
        const filterPopover = document.getElementById('search-filter-popover');
        if (filterPopover) {
          this.renderTagFilterChips();
          filterPopover.classList.toggle('active');
        }
        return;
      }

      const clearBtn = e.target.closest('#clear-filters-btn');
      if (clearBtn) {
        e.stopPropagation();
        this.selectedLanguageFilter = 'all';
        this.selectedTypeFilter = 'all';
        this.selectedTagFilters = [];
        this.isStarredFilter = false;

        const langSelect = document.getElementById('filter-language-select');
        const typeSelect = document.getElementById('filter-type-select');
        const starredCheckbox = document.getElementById('filter-starred-checkbox');

        if (langSelect) langSelect.value = 'all';
        if (typeSelect) typeSelect.value = 'all';
        if (starredCheckbox) starredCheckbox.checked = false;

        this.renderTagFilterChips();
        this.updateFilterButtonBadge();
        const filterPopover = document.getElementById('search-filter-popover');
        if (filterPopover) filterPopover.classList.remove('active');
        this.render();
        return;
      }

      const filterPopover = document.getElementById('search-filter-popover');
      if (filterPopover && filterPopover.classList.contains('active')) {
        if (!e.target.closest('#search-filter-popover')) {
          filterPopover.classList.remove('active');
        }
      }
    });

    // 2. Filter Dropdowns & Checkbox Change Delegation
    document.addEventListener('change', (e) => {
      if (e.target && e.target.id === 'filter-language-select') {
        this.selectedLanguageFilter = e.target.value;
        this.updateFilterButtonBadge();
        this.render();
      }
      if (e.target && e.target.id === 'filter-type-select') {
        this.selectedTypeFilter = e.target.value;
        this.updateFilterButtonBadge();
        this.render();
      }
      if (e.target && e.target.id === 'filter-starred-checkbox') {
        this.isStarredFilter = e.target.checked;
        this.updateFilterButtonBadge();
        this.render();
      }
    });
  }

  renderTagFilterChips() {
    const container = document.getElementById('filter-tags-container');
    if (!container) return;

    const allTags = new Set();
    this.notes.forEach(n => {
      if (n.labels && Array.isArray(n.labels)) {
        n.labels.forEach(l => allTags.add(l));
      }
    });

    if (allTags.size === 0) {
      container.innerHTML = `<span style="font-size: 11px; color: var(--text-secondary); padding: 4px;">No tags found</span>`;
      return;
    }

    container.innerHTML = Array.from(allTags).map(tag => {
      const isSelected = this.selectedTagFilters.includes(tag);
      return `
        <span class="tag-filter-chip ${isSelected ? 'selected' : ''}" data-filter-tag="${this.escapeHtml(tag)}" style="font-size: 11px; padding: 3px 8px; border-radius: 12px; border: 1px solid var(--border-color); background: ${isSelected ? 'var(--primary-yellow)' : 'var(--bg-primary)'}; color: ${isSelected ? '#202124' : 'var(--text-primary)'}; cursor: pointer; user-select: none; font-weight: ${isSelected ? '600' : 'normal'};">
          #${this.escapeHtml(tag)}
        </span>
      `;
    }).join('');

    container.querySelectorAll('[data-filter-tag]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = chip.getAttribute('data-filter-tag');
        const idx = this.selectedTagFilters.indexOf(tag);
        if (idx !== -1) {
          this.selectedTagFilters.splice(idx, 1);
        } else {
          this.selectedTagFilters.push(tag);
        }
        this.renderTagFilterChips();
        this.updateFilterButtonBadge();
        this.render();
      });
    });
  }

  updateFilterButtonBadge() {
    const filterBtn = document.getElementById('search-filter-btn');
    if (filterBtn) {
      const hasFilter = this.selectedLanguageFilter !== 'all' || 
                        this.selectedTypeFilter !== 'all' || 
                        this.selectedTagFilters.length > 0 || 
                        this.isStarredFilter;
      filterBtn.classList.toggle('has-filter', hasFilter);
    }
  }

  initSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('close-settings-modal-btn');
    const saveBtn = document.getElementById('save-settings-btn');
    const themeCheckbox = document.getElementById('settings-theme-checkbox');
    const langSelect = document.getElementById('settings-default-language-select');
    const viewSelect = document.getElementById('settings-default-view-select');
    const exportBtn = document.getElementById('settings-export-btn');
    const importBtn = document.getElementById('settings-import-btn');
    const importFileInput = document.getElementById('settings-import-input');
    const gistBtn = document.getElementById('settings-gist-btn');
    const gistInput = document.getElementById('settings-gist-input');
    const aiProviderSelect = document.getElementById('settings-ai-provider-select');
    const aiKeyInput = document.getElementById('settings-ai-apikey-input');

    if (aiProviderSelect) {
      aiProviderSelect.addEventListener('change', (e) => {
        const apiKey = aiKeyInput ? aiKeyInput.value.trim() : '';
        if (window.aiAssistant) {
          window.aiAssistant.setProvider(e.target.value, apiKey);
        }
      });
    }

    if (aiKeyInput) {
      aiKeyInput.addEventListener('input', (e) => {
        const provider = aiProviderSelect ? aiProviderSelect.value : 'free';
        if (window.aiAssistant) {
          window.aiAssistant.setProvider(provider, e.target.value.trim());
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSettingsModal());
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.closeSettingsModal());
    }

    if (settingsModal) {
      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) this.closeSettingsModal();
      });
    }

    if (themeCheckbox) {
      themeCheckbox.addEventListener('change', (e) => {
        document.body.classList.toggle('dark-theme', e.target.checked);
        localStorage.setItem('keep-theme', e.target.checked ? 'dark' : 'light');
      });
    }

    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        this.defaultCodeLanguage = e.target.value;
        localStorage.setItem('keep-default-lang', e.target.value);
        const creatorLangSelect = document.getElementById('creator-language-select');
        if (creatorLangSelect) creatorLangSelect.value = e.target.value;
      });
    }

    if (viewSelect) {
      viewSelect.addEventListener('change', (e) => {
        this.isListView = e.target.value === 'list';
        localStorage.setItem('keep-list-view', this.isListView);
        this.applyListViewState();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportNotesJson());
    }

    if (importBtn && importFileInput) {
      importBtn.addEventListener('click', () => importFileInput.click());
      importFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.importNotesJson(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    if (gistBtn && gistInput) {
      gistBtn.addEventListener('click', () => {
        this.importGithubGist(gistInput.value);
      });
      gistInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.importGithubGist(gistInput.value);
        }
      });
    }
  }

  openSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    const themeCheckbox = document.getElementById('settings-theme-checkbox');
    const langSelect = document.getElementById('settings-default-language-select');
    const viewSelect = document.getElementById('settings-default-view-select');

    if (!settingsModal) return;

    if (themeCheckbox) {
      themeCheckbox.checked = document.body.classList.contains('dark-theme');
    }
    if (langSelect) {
      langSelect.value = this.defaultCodeLanguage;
    }
    if (viewSelect) {
      viewSelect.value = this.isListView ? 'list' : 'grid';
    }

    const aiProviderSelect = document.getElementById('settings-ai-provider-select');
    const aiKeyInput = document.getElementById('settings-ai-apikey-input');
    if (aiProviderSelect && window.aiAssistant) {
      aiProviderSelect.value = window.aiAssistant.provider || 'free';
    }
    if (aiKeyInput && window.aiAssistant) {
      aiKeyInput.value = window.aiAssistant.apiKey || '';
    }

    settingsModal.classList.add('active');
  }

  closeSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) settingsModal.classList.remove('active');
  }

  initToast() {
    if (!document.getElementById('toast-notification')) {
      const toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
  }

  showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }
  }

  initViewToggle() {
    const viewBtn = document.getElementById('view-toggle-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isListView = !this.isListView;
        localStorage.setItem('keep-list-view', this.isListView);
        this.applyListViewState();
      });
    }
  }

  applyListViewState() {
    const contentArea = document.querySelector('.content-area');
    const viewToggleContainer = document.getElementById('view-toggle-container');
    const iconList = document.getElementById('view-icon-list');
    const iconGrid = document.getElementById('view-icon-grid');

    if (contentArea) {
      contentArea.classList.toggle('list-view', this.isListView);
    }
    if (viewToggleContainer) {
      viewToggleContainer.setAttribute('data-tooltip', this.isListView ? 'Grid view' : 'List view');
    }
    if (iconList && iconGrid) {
      iconList.style.display = this.isListView ? 'none' : 'block';
      iconGrid.style.display = this.isListView ? 'block' : 'none';
    }
  }

  initExportListener() {
    const exportBtn = document.getElementById('export-notes-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.exportNotesJson();
      });
    }
  }

  exportNotesJson() {
    const dataStr = JSON.stringify(this.notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keep-notes-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Exported notes to JSON!');
  }

  importNotesJson(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) {
          this.showToast('Invalid backup file format.');
          return;
        }
        let addedCount = 0;
        imported.forEach(n => {
          if (n && (n.title || n.body || n.code)) {
            if (!n.id || this.notes.some(existing => existing.id === n.id)) {
              n.id = 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
            }
            this.notes.unshift(n);
            addedCount++;
          }
        });
        this.saveToStorage();
        this.render();
        this.closeSettingsModal();
        this.showToast(`Successfully imported ${addedCount} notes!`);
      } catch (err) {
        console.error('Import error:', err);
        this.showToast('Error parsing JSON backup file.');
      }
    };
    reader.readAsText(file);
  }

  async importGithubGist(gistInput) {
    if (!gistInput || !gistInput.trim()) {
      this.showToast('Please enter a Gist URL or Gist ID.');
      return;
    }
    const gistId = gistInput.trim().replace(/\/$/, '').split('/').pop();
    this.showToast('Fetching Gist from GitHub...');
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`);
      if (!response.ok) {
        throw new Error(`Gist not found (Status ${response.status})`);
      }
      const data = await response.json();
      const files = data.files;
      if (!files || Object.keys(files).length === 0) {
        this.showToast('No files found in Gist.');
        return;
      }

      let count = 0;
      for (const fileName in files) {
        const fileObj = files[fileName];
        const code = fileObj.content || '';
        const rawLang = (fileObj.language || '').toLowerCase();
        const langMap = {
          javascript: 'javascript', js: 'javascript',
          python: 'python', py: 'python',
          java: 'java', c: 'c', cpp: 'cpp', 'c++': 'cpp',
          sql: 'sql', rust: 'rust', rs: 'rust', go: 'go', html: 'html'
        };
        const codeLanguage = langMap[rawLang] || 'javascript';

        const newNote = {
          id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          title: data.description || fileName || 'Imported Gist',
          body: `Imported from GitHub Gist: ${fileName}`,
          code: code,
          codeLanguage: codeLanguage,
          isCode: true,
          type: 'code',
          color: 'default',
          isPinned: false,
          labels: ['Gist'],
          createdAt: Date.now()
        };
        this.notes.unshift(newNote);
        count++;
      }

      this.saveToStorage();
      this.render();
      this.closeSettingsModal();
      this.showToast(`Imported ${count} snippet(s) from Gist!`);
    } catch (err) {
      console.error('Gist import failed:', err);
      this.showToast(`Failed to import Gist: ${err.message}`);
    }
  }

  generateShareableLink(noteId) {
    const note = this.notes.find(n => n.id === noteId);
    if (!note) return;

    const payload = {
      title: note.title || '',
      body: note.body || '',
      code: note.code || '',
      codeLanguage: note.codeLanguage || 'javascript',
      isCode: !!note.isCode
    };

    try {
      let hashData = '';
      if (typeof LZString !== 'undefined') {
        hashData = LZString.compressToEncodedURIComponent(JSON.stringify(payload));
      } else {
        hashData = btoa(encodeURIComponent(JSON.stringify(payload)));
      }
      const shareUrl = `${window.location.origin}${window.location.pathname}#sharedNote=${hashData}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showToast('Shareable link copied to clipboard!');
      });
    } catch (err) {
      console.error('Failed to generate share link:', err);
      this.showToast('Could not generate share link.');
    }
  }

  checkUrlHashForSharedNote() {
    const hash = window.location.hash;
    if (!hash || !hash.includes('#sharedNote=')) return;

    const hashData = hash.replace('#sharedNote=', '');
    if (!hashData) return;

    try {
      let jsonStr = '';
      if (typeof LZString !== 'undefined') {
        jsonStr = LZString.decompressFromEncodedURIComponent(hashData);
      } else {
        jsonStr = decodeURIComponent(atob(hashData));
      }

      if (!jsonStr) return;
      const noteData = JSON.parse(jsonStr);

      history.replaceState(null, null, window.location.pathname);

      if (confirm(`Import shared code note "${noteData.title || 'Untitled Code Note'}" into your Code Bookshelf?`)) {
        const newNote = {
          id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          title: noteData.title || 'Shared Code Note',
          body: noteData.body || '',
          code: noteData.code || '',
          codeLanguage: noteData.codeLanguage || 'javascript',
          isCode: true,
          type: 'code',
          color: 'default',
          isPinned: true,
          labels: ['Shared'],
          createdAt: Date.now()
        };
        this.notes.unshift(newNote);
        this.saveToStorage();
        this.render();
        this.showToast('Shared note imported successfully!');
      }
    } catch (err) {
      console.error('Error parsing shared note hash:', err);
    }
  }

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Escape: Close open modals
      if (e.key === 'Escape') {
        const editModal = document.getElementById('edit-note-modal');
        const labelsModal = document.getElementById('edit-labels-modal');
        const drawingModal = document.getElementById('drawing-modal');
        if (editModal && editModal.style.display === 'flex') {
          editModal.style.display = 'none';
        }
        if (labelsModal && labelsModal.style.display === 'flex') {
          labelsModal.style.display = 'none';
        }
        if (drawingModal && drawingModal.style.display === 'flex') {
          drawingModal.style.display = 'none';
        }
      }

      // Ctrl + Enter / Cmd + Enter: Save Note or Run Code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const editModal = document.getElementById('edit-note-modal');
        if (editModal && editModal.style.display === 'flex' && this.editingNoteId) {
          e.preventDefault();
          this.saveEditNote();
          return;
        }

        const creator = document.getElementById('note-creator');
        if (creator && creator.classList.contains('expanded')) {
          e.preventDefault();
          this.addNote();
          return;
        }
      }

      // Ctrl + Shift + F or Ctrl + F (when outside editable inputs): Focus Search
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'f' && e.shiftKey)) {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });
  }

  duplicateNote(noteId) {
    const noteIdx = this.notes.findIndex(n => n.id === noteId);
    if (noteIdx === -1) return;
    const original = this.notes[noteIdx];
    const clone = JSON.parse(JSON.stringify(original));
    clone.id = 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    clone.title = original.title ? `${original.title} (Copy)` : 'Copy Note';
    clone.createdAt = Date.now();
    this.notes.splice(noteIdx + 1, 0, clone);
    this.saveToStorage();
    this.render();
    this.showToast('Note duplicated!');
  }

  copyCodeToClipboard(noteId) {
    const note = this.notes.find(n => n.id === noteId);
    if (note && note.code) {
      navigator.clipboard.writeText(note.code).then(() => {
        this.showToast('Code copied to clipboard!');
      });
    }
  }

  downloadCodeFile(noteId) {
    const note = this.notes.find(n => n.id === noteId);
    if (!note || !note.code) return;
    const extMap = {
      javascript: 'js', python: 'py', java: 'java', c: 'c',
      cpp: 'cpp', sql: 'sql', rust: 'rs', go: 'go', html: 'html'
    };
    const ext = extMap[note.codeLanguage] || 'txt';
    const titleSanitized = (note.title || 'code-snippet').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${titleSanitized}.${ext}`;

    const blob = new Blob([note.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast(`Downloaded ${filename}`);
  }

  copyOutputToClipboard(noteId) {
    const note = this.notes.find(n => n.id === noteId);
    if (note && note.lastOutput) {
      navigator.clipboard.writeText(note.lastOutput).then(() => {
        this.showToast('Output copied to clipboard!');
      });
    }
  }

  formatCodeHighlight(code, lang) {
    if (!code) return '';
    if (window.codeCompiler && window.codeCompiler.highlightCode) {
      const prismLang = window.codeCompiler.getPrismLanguage(lang);
      const highlightedHtml = window.codeCompiler.highlightCode(code, lang);
      return `<div class="code-card-snippet-container"><pre class="language-${prismLang}"><code>${highlightedHtml}</code></pre></div>`;
    }
    const lines = this.escapeHtml(code).split('\n');
    return lines.map((line, idx) => {
      return `<div class="code-line"><span class="code-line-num">${idx + 1}</span><span class="code-line-text">${line}</span></div>`;
    }).join('');
  }

  formatMarkdownAndMath(text) {
    if (!text) return '';
    let content = text;

    content = content.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
      if (typeof katex !== 'undefined') {
        try {
          return katex.renderToString(math.trim(), { displayMode: true });
        } catch (e) { return match; }
      }
      return match;
    });

    content = content.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
      if (typeof katex !== 'undefined') {
        try {
          return katex.renderToString(math.trim(), { displayMode: false });
        } catch (e) { return match; }
      }
      return match;
    });

    content = content.replace(/(^|\s)#([a-zA-Z0-9_\-]+)/g, '$1<span class="inline-hashtag">#$2</span>');

    if (typeof marked !== 'undefined' && marked.parse) {
      try {
        return `<div class="markdown-body">${marked.parse(content)}</div>`;
      } catch (e) {
        console.warn('Marked parse error:', e);
      }
    }

    return `<div class="note-card-body">${this.escapeHtml(content)}</div>`;
  }

  extractAndAssignHashtags(note) {
    if (!note) return;
    const combined = `${note.title || ''} ${note.body || ''}`;
    const regex = /(?:^|\s)#([a-zA-Z0-9_\-]+)/g;
    let match;
    note.labels = note.labels || [];

    while ((match = regex.exec(combined)) !== null) {
      const tag = match[1];
      if (tag && tag.length > 0) {
        const existingLabel = this.labels.find(l => l.toLowerCase() === tag.toLowerCase()) || (tag.charAt(0).toUpperCase() + tag.slice(1));
        if (!note.labels.includes(existingLabel)) {
          note.labels.push(existingLabel);
        }
        if (!this.labels.includes(existingLabel)) {
          this.labels.push(existingLabel);
          this.saveLabelsToStorage();
          this.renderSidebarLabels();
        }
      }
    }
  }

  /**
   * Note Creator Handlers
   */
  initCreator() {
    const creator = document.getElementById('note-creator');
    const titleInput = document.getElementById('note-title-input');
    const bodyInput = document.getElementById('note-body-input');
    const closeBtn = document.getElementById('creator-close-btn');
    const creatorPinBtn = document.getElementById('creator-pin-btn');
    
    const listBtn = document.getElementById('creator-list-btn');
    const drawingBtn = document.getElementById('creator-drawing-btn');
    const codeQuickBtn = document.getElementById('creator-code-btn');
    const codeToggleBtn = document.getElementById('creator-code-toggle-btn');
    const languageSelect = document.getElementById('creator-language-select');
    const codeInput = document.getElementById('creator-code-input');
    const newChecklistInput = document.getElementById('new-checklist-input');

    if (!creator) return;

    creator.addEventListener('click', (e) => {
      if (e.target.closest('#creator-close-btn') || 
          e.target.closest('.color-picker-menu') || 
          e.target.closest('.popover-menu') || 
          e.target.closest('.drawing-modal')) {
        return;
      }
      if (!creator.classList.contains('expanded')) {
        creator.classList.add('expanded');
        setTimeout(() => bodyInput && bodyInput.focus(), 100);
      }
    });

    if (listBtn) {
      listBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        creator.classList.add('expanded');
        this.enableChecklistMode(true);
        setTimeout(() => newChecklistInput && newChecklistInput.focus(), 100);
      });
    }

    if (codeQuickBtn) {
      codeQuickBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        creator.classList.add('expanded');
        this.enableCodeMode(true);
        setTimeout(() => codeInput && codeInput.focus(), 100);
      });
    }

    if (codeToggleBtn) {
      codeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.enableCodeMode(!this.isCodeMode);
        if (this.isCodeMode) {
          setTimeout(() => codeInput && codeInput.focus(), 100);
        }
      });
    }

    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        this.codeLanguage = e.target.value;
      });
    }

    if (codeInput) {
      codeInput.addEventListener('input', (e) => {
        this.codeContent = e.target.value;
      });
    }

    if (newChecklistInput) {
      newChecklistInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const text = newChecklistInput.value.trim();
          if (text) {
            this.checklistItems.push({ text: text, completed: false });
            newChecklistInput.value = '';
            this.renderCreatorChecklist();
          }
        }
      });
    }

    if (drawingBtn) {
      drawingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openDrawingModal();
      });
    }

    const closeAndSave = () => {
      this.createNoteFromForm();
      this.resetCreatorForm();
    };

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeAndSave();
      });
    }

    if (creatorPinBtn) {
      creatorPinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isPinned = !this.isPinned;
        creatorPinBtn.classList.toggle('pinned', this.isPinned);
      });
    }

    document.addEventListener('click', (e) => {
      if (creator.classList.contains('expanded') && !creator.contains(e.target)) {
        const colorMenu = document.getElementById('color-picker-menu');
        const drawingModal = document.getElementById('drawing-modal');
        const reminderPopover = document.getElementById('reminder-popover');
        const labelPopover = document.getElementById('label-popover');

        if ((colorMenu && colorMenu.contains(e.target)) || 
            (drawingModal && drawingModal.contains(e.target)) ||
            (reminderPopover && reminderPopover.contains(e.target)) ||
            (labelPopover && labelPopover.contains(e.target))) return;

        closeAndSave();
      }

      // Close all card-level color menus on document click
      document.querySelectorAll('.card-color-picker-menu.active').forEach(menu => {
        if (!menu.contains(e.target) && !e.target.closest('[data-action="color"]')) {
          menu.classList.remove('active');
        }
      });
    });
  }

  enableCodeMode(enable) {
    this.isCodeMode = enable;
    if (enable) {
      this.isChecklistMode = false;
      const checklistContainer = document.getElementById('checklist-container');
      if (checklistContainer) checklistContainer.style.display = 'none';
    }
    const bodyInput = document.getElementById('note-body-input');
    const codeContainer = document.getElementById('code-container');
    const codeInput = document.getElementById('creator-code-input');

    if (enable) {
      if (bodyInput) bodyInput.style.display = 'none';
      if (codeContainer) codeContainer.style.display = 'flex';
      if (codeInput) {
        this.setupCodeMirror(codeInput, this.codeLanguage || 'javascript');
      }
    } else {
      if (bodyInput) bodyInput.style.display = 'block';
      if (codeContainer) codeContainer.style.display = 'none';
      if (codeInput && codeInput._cm) {
        try { codeInput._cm.toTextArea(); } catch (e) {}
      }
    }
  }

  enableChecklistMode(enable) {
    this.isChecklistMode = enable;
    if (enable) {
      this.isCodeMode = false;
      const codeContainer = document.getElementById('code-container');
      if (codeContainer) codeContainer.style.display = 'none';
    }
    const bodyInput = document.getElementById('note-body-input');
    const checklistContainer = document.getElementById('checklist-container');

    if (enable) {
      if (bodyInput) bodyInput.style.display = 'none';
      if (checklistContainer) checklistContainer.style.display = 'flex';
    } else {
      if (bodyInput) bodyInput.style.display = 'block';
      if (checklistContainer) checklistContainer.style.display = 'none';
    }
  }

  renderCreatorChecklist() {
    const listElem = document.getElementById('checklist-items-list');
    if (!listElem) return;

    listElem.innerHTML = this.checklistItems.map((item, index) => `
      <div class="checklist-row">
        <input type="checkbox" class="checklist-checkbox" ${item.completed ? 'checked' : ''} data-index="${index}">
        <input type="text" class="checklist-input ${item.completed ? 'checked' : ''}" value="${this.escapeHtml(item.text)}" data-index="${index}">
        <button class="checklist-remove-btn" data-remove="${index}">✕</button>
      </div>
    `).join('');

    listElem.querySelectorAll('.checklist-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-index');
        this.checklistItems[idx].completed = e.target.checked;
        this.renderCreatorChecklist();
      });
    });

    listElem.querySelectorAll('.checklist-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-index');
        this.checklistItems[idx].text = e.target.value;
      });
    });

    listElem.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-remove');
        this.checklistItems.splice(idx, 1);
        this.renderCreatorChecklist();
      });
    });
  }

  /**
   * Reminders & Labels Popover Dropdowns
   */
  initRemindersPopover() {
    const btn = document.getElementById('creator-reminder-btn');
    const popover = document.getElementById('reminder-popover');
    if (!btn || !popover) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.classList.toggle('active');
    });

    popover.querySelectorAll('[data-reminder]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedReminder = item.getAttribute('data-reminder');
        this.renderCreatorChips();
        popover.classList.remove('active');
      });
    });
  }

  initLabelsPopover() {
    const btn = document.getElementById('creator-label-btn');
    const popover = document.getElementById('label-popover');
    const listElem = document.getElementById('label-popover-list');
    if (!btn || !popover || !listElem) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.renderLabelsPopoverList();
      popover.classList.toggle('active');
    });
  }

  renderLabelsPopoverList() {
    const listElem = document.getElementById('label-popover-list');
    if (!listElem) return;

    listElem.innerHTML = this.labels.map(label => {
      const isChecked = this.selectedLabels.includes(label);
      return `
        <div class="popover-item" data-label-name="${this.escapeHtml(label)}">
          <input type="checkbox" ${isChecked ? 'checked' : ''}>
          <span>${this.escapeHtml(label)}</span>
        </div>
      `;
    }).join('');

    listElem.querySelectorAll('.popover-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = item.getAttribute('data-label-name');
        if (this.selectedLabels.includes(name)) {
          this.selectedLabels = this.selectedLabels.filter(l => l !== name);
        } else {
          this.selectedLabels.push(name);
        }
        this.renderLabelsPopoverList();
        this.renderCreatorChips();
      });
    });
  }

  renderCreatorChips() {
    const container = document.getElementById('creator-chips-row');
    if (!container) return;

    let html = '';
    if (this.selectedReminder) {
      html += `
        <span class="chip-badge">
          <svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"></path></svg>
          ${this.escapeHtml(this.selectedReminder)}
          <button class="chip-remove-btn" id="remove-creator-reminder">✕</button>
        </span>
      `;
    }

    this.selectedLabels.forEach((label, idx) => {
      html += `
        <span class="chip-badge">
          ${this.escapeHtml(label)}
          <button class="chip-remove-btn" data-remove-label="${idx}">✕</button>
        </span>
      `;
    });

    container.innerHTML = html;

    const removeReminderBtn = document.getElementById('remove-creator-reminder');
    if (removeReminderBtn) {
      removeReminderBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedReminder = null;
        this.renderCreatorChips();
      });
    }

    container.querySelectorAll('[data-remove-label]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = btn.getAttribute('data-remove-label');
        this.selectedLabels.splice(idx, 1);
        this.renderCreatorChips();
      });
    });
  }

  /**
   * Edit Labels Management Modal
   */
  initEditLabelsModal() {
    const openBtn = document.getElementById('open-edit-labels-btn');
    const modal = document.getElementById('edit-labels-modal');
    const closeBtn = document.getElementById('close-labels-modal-btn');
    const addBtn = document.getElementById('add-label-modal-btn');
    const input = document.getElementById('new-label-modal-input');

    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openEditLabelsModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
        this.renderSidebarLabels();
      });
    }

    const addNewLabel = () => {
      const val = input ? input.value.trim() : '';
      if (val && !this.labels.includes(val)) {
        this.labels.push(val);
        this.saveLabelsToStorage();
        if (input) input.value = '';
        this.renderModalLabelsList();
        this.renderSidebarLabels();
      }
    };

    if (addBtn) addBtn.addEventListener('click', addNewLabel);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addNewLabel();
        }
      });
    }
  }

  openEditLabelsModal() {
    const modal = document.getElementById('edit-labels-modal');
    if (modal) {
      this.renderModalLabelsList();
      modal.classList.add('active');
    }
  }

  renderModalLabelsList() {
    const listElem = document.getElementById('modal-labels-list');
    if (!listElem) return;

    listElem.innerHTML = this.labels.map((label, idx) => `
      <div class="label-modal-row">
        <svg viewBox="0 0 24 24" width="18" height="18" style="vertical-align: middle; fill: var(--text-secondary); margin-right: 4px;"><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84l3.96-5.58a.99.99 0 0 0 0-1.16l-3.96-5.58z"></path></svg>
        <input type="text" class="label-modal-input" value="${this.escapeHtml(label)}" data-label-index="${idx}">
        <button class="checklist-remove-btn" data-delete-label="${idx}" aria-label="Delete label">
          <svg viewBox="0 0 24 24" width="16" height="16" style="vertical-align: middle; fill: var(--text-secondary);"><path d="M15 4V3H9v1H4v2h16V4h-5zm1 4H8v12h8V8zM6 7v13c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6z"></path></svg>
        </button>
      </div>
    `).join('');

    listElem.querySelectorAll('.label-modal-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-label-index');
        const newName = e.target.value.trim();
        if (newName) {
          this.labels[idx] = newName;
          this.saveLabelsToStorage();
          this.renderSidebarLabels();
        }
      });
    });

    listElem.querySelectorAll('[data-delete-label]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = btn.getAttribute('data-delete-label');
        this.labels.splice(idx, 1);
        this.saveLabelsToStorage();
        this.renderModalLabelsList();
        this.renderSidebarLabels();
      });
    });
  }

  renderSidebarLabels() {
    const container = document.getElementById('sidebar-dynamic-labels');
    if (!container) return;

    container.innerHTML = this.labels.map(label => `
      <a href="#label-${this.escapeHtml(label)}" class="nav-item ${this.currentView === 'label_' + label ? 'active' : ''}" data-nav="label_${this.escapeHtml(label)}">
        <span class="nav-item-icon">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84l3.96-5.58a.99.99 0 0 0 0-1.16l-3.96-5.58z"></path>
          </svg>
        </span>
        <span class="nav-item-label">${this.escapeHtml(label)}</span>
      </a>
    `).join('');

    container.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        const section = item.getAttribute('data-nav');
        
        const titleElem = document.getElementById('active-section-title');
        if (titleElem) titleElem.textContent = section.replace('label_', '');

        this.setView(section);
      });
    });
  }

  renderSidebarCollections() {
    const container = document.getElementById('sidebar-dynamic-collections');
    if (!container) return;

    container.innerHTML = this.collections.map(col => {
      const noteCount = (col.noteIds || []).filter(id => this.notes.some(n => n.id === id && !n.isArchived && !n.isBinned)).length;
      return `
        <a href="#col-${col.id}" class="nav-item ${this.currentView === 'collection_' + col.id ? 'active' : ''}" data-nav="collection_${col.id}">
          <span class="nav-item-icon" style="font-size: 18px;">${col.icon || '📚'}</span>
          <span class="nav-item-label">${this.escapeHtml(col.name)}</span>
          <span class="collection-count-badge">${noteCount}</span>
        </a>
      `;
    }).join('');

    container.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        const section = item.getAttribute('data-nav');
        
        const titleElem = document.getElementById('active-section-title');
        const colId = section.replace('collection_', '');
        const col = this.collections.find(c => c.id === colId);
        if (titleElem && col) titleElem.textContent = col.name;

        this.setView(section);
      });
    });
  }

  initCollections() {
    const createBtn = document.getElementById('create-collection-btn');
    const closeBtn = document.getElementById('close-collection-modal-btn');
    const cancelBtn = document.getElementById('cancel-collection-modal-btn');
    const saveBtn = document.getElementById('save-collection-modal-btn');

    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.openCollectionModal();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeCollectionModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeCollectionModal());

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const idInput = document.getElementById('collection-modal-id');
        const nameInput = document.getElementById('collection-modal-name');
        const descInput = document.getElementById('collection-modal-desc');
        const iconSelect = document.getElementById('collection-modal-icon');

        const name = nameInput.value.trim();
        if (!name) {
          this.showToast('Please enter a collection name.');
          return;
        }

        const id = idInput.value || 'col_' + Date.now();
        const existingIdx = this.collections.findIndex(c => c.id === id);

        if (existingIdx >= 0) {
          this.collections[existingIdx] = {
            ...this.collections[existingIdx],
            name,
            description: descInput.value.trim(),
            icon: iconSelect.value,
            updatedAt: new Date().toISOString()
          };
          this.showToast(`Updated collection "${name}"`);
        } else {
          this.collections.push({
            id,
            name,
            description: descInput.value.trim(),
            icon: iconSelect.value,
            noteIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          this.showToast(`Created collection "${name}"`);
        }

        this.saveCollectionsToStorage();
        this.renderSidebarCollections();
        this.closeCollectionModal();
        if (this.currentView === 'collection_' + id) {
          this.render();
        }
      });
    }

    // Manage Snippets Modal
    const doneManageBtn = document.getElementById('done-manage-snippets-modal-btn');
    const closeManageBtn = document.getElementById('close-manage-snippets-modal-btn');
    const searchManageInput = document.getElementById('manage-snippets-search');

    if (doneManageBtn) doneManageBtn.addEventListener('click', () => this.closeManageSnippetsModal());
    if (closeManageBtn) closeManageBtn.addEventListener('click', () => this.closeManageSnippetsModal());

    if (searchManageInput) {
      searchManageInput.addEventListener('input', (e) => {
        this.renderManageSnippetsList(e.target.value);
      });
    }
  }

  openCollectionModal(collectionId = null) {
    const modal = document.getElementById('collection-modal');
    if (!modal) return;

    const titleElem = document.getElementById('collection-modal-title');
    const idInput = document.getElementById('collection-modal-id');
    const nameInput = document.getElementById('collection-modal-name');
    const descInput = document.getElementById('collection-modal-desc');
    const iconSelect = document.getElementById('collection-modal-icon');

    if (collectionId) {
      const col = this.collections.find(c => c.id === collectionId);
      if (col) {
        titleElem.textContent = 'Edit Collection';
        idInput.value = col.id;
        nameInput.value = col.name;
        descInput.value = col.description || '';
        iconSelect.value = col.icon || '📚';
      }
    } else {
      titleElem.textContent = 'Create Collection';
      idInput.value = '';
      nameInput.value = '';
      descInput.value = '';
      iconSelect.value = '📚';
    }

    modal.classList.add('show');
    nameInput.focus();
  }

  closeCollectionModal() {
    const modal = document.getElementById('collection-modal');
    if (modal) modal.classList.remove('show');
  }

  openManageSnippetsModal(collectionId) {
    this.activeManageCollectionId = collectionId;
    const modal = document.getElementById('collection-manage-snippets-modal');
    if (!modal) return;

    const col = this.collections.find(c => c.id === collectionId);
    const titleElem = document.getElementById('collection-manage-title');
    if (titleElem && col) {
      titleElem.textContent = `Manage "${col.name}" Snippets`;
    }

    this.renderManageSnippetsList();
    modal.classList.add('show');
  }

  closeManageSnippetsModal() {
    const modal = document.getElementById('collection-manage-snippets-modal');
    if (modal) modal.classList.remove('show');
    this.activeManageCollectionId = null;
    this.renderSidebarCollections();
    this.render();
  }

  renderManageSnippetsList(filterQuery = '') {
    const container = document.getElementById('manage-snippets-list');
    if (!container || !this.activeManageCollectionId) return;

    const col = this.collections.find(c => c.id === this.activeManageCollectionId);
    if (!col) return;

    const query = (filterQuery || '').toLowerCase();
    const availableNotes = this.notes.filter(n => !n.isArchived && !n.isBinned);
    const filteredNotes = availableNotes.filter(n => {
      const title = (n.title || '').toLowerCase();
      const body = (n.body || '').toLowerCase();
      const code = (n.code || '').toLowerCase();
      const lang = (n.codeLanguage || '').toLowerCase();
      return title.includes(query) || body.includes(query) || code.includes(query) || lang.includes(query);
    });

    if (filteredNotes.length === 0) {
      container.innerHTML = '<div style="font-size: 13px; color: var(--text-secondary); padding: 12px; text-align: center;">No matching code snippets found.</div>';
      return;
    }

    container.innerHTML = filteredNotes.map(n => {
      const isChecked = (col.noteIds || []).includes(n.id);
      const title = n.title || (n.isCode ? `${n.codeLanguage ? n.codeLanguage.toUpperCase() : 'Code'} Snippet` : 'Untitled Note');
      return `
        <label style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-primary); cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
            <input type="checkbox" class="manage-snippet-checkbox" data-note-id="${n.id}" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;">
            <div>
              <div style="font-size: 14px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 380px;">${this.escapeHtml(title)}</div>
              <div style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 8px;">
                ${n.codeLanguage ? `<span style="text-transform: uppercase;">${n.codeLanguage}</span>` : ''}
                <span>${n.code ? `${n.code.split('\n').length} lines` : 'Text'}</span>
              </div>
            </div>
          </div>
          <span style="font-size: 12px; font-weight: 600; color: ${isChecked ? '#1a73e8' : 'var(--text-secondary)'};">${isChecked ? 'Included' : 'Add'}</span>
        </label>
      `;
    }).join('');

    container.querySelectorAll('.manage-snippet-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const noteId = chk.getAttribute('data-note-id');
        if (!col.noteIds) col.noteIds = [];

        if (chk.checked) {
          if (!col.noteIds.includes(noteId)) col.noteIds.push(noteId);
        } else {
          col.noteIds = col.noteIds.filter(id => id !== noteId);
        }

        col.updatedAt = new Date().toISOString();
        this.saveCollectionsToStorage();
        this.renderSidebarCollections();
      });
    });
  }

  initTemplates() {
    this.presetTemplates = PRESET_CODE_TEMPLATES;
    this.customTemplates = this.loadTemplatesFromStorage();

    const creatorBtn = document.getElementById('creator-template-btn');
    const creatorMenu = document.getElementById('creator-template-menu');
    const editBtn = document.getElementById('edit-template-btn');
    const editMenu = document.getElementById('edit-template-menu');

    if (creatorBtn && creatorMenu) {
      creatorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (editMenu) editMenu.classList.remove('show');
        this.renderTemplateMenu(creatorMenu, 'creator');
        creatorMenu.classList.toggle('show');
      });
    }

    if (editBtn && editMenu) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (creatorMenu) creatorMenu.classList.remove('show');
        this.renderTemplateMenu(editMenu, 'edit');
        editMenu.classList.toggle('show');
      });
    }

    document.addEventListener('click', () => {
      if (creatorMenu) creatorMenu.classList.remove('show');
      if (editMenu) editMenu.classList.remove('show');
    });
  }

  renderTemplateMenu(menuElem, targetContext) {
    if (!menuElem) return;

    const presets = this.presetTemplates;
    const custom = this.customTemplates;

    let html = `
      <div style="font-size: 11px; font-weight: bold; color: var(--text-secondary); text-transform: uppercase; padding: 4px 6px; letter-spacing: 0.5px;">
        🚀 PRESET BOILERPLATES
      </div>
    `;

    presets.forEach(tmpl => {
      html += `
        <div class="popover-item template-item" data-tmpl-id="${tmpl.id}" data-target="${targetContext}" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 8px; font-size: 12px; cursor: pointer; border-radius: 4px;">
          <span style="display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <span>${tmpl.icon || '⚡'}</span>
            <strong style="color: var(--text-primary); font-weight: 500;">${this.escapeHtml(tmpl.name)}</strong>
          </span>
          <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; background: var(--hover-bg); padding: 1px 6px; border-radius: 8px; color: var(--accent-color, #1a73e8);">${tmpl.language}</span>
        </div>
      `;
    });

    html += `
      <div style="height: 1px; background: var(--border-color); margin: 6px 0;"></div>
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: bold; color: var(--text-secondary); text-transform: uppercase; padding: 4px 6px; letter-spacing: 0.5px;">
        <span>⭐ MY CUSTOM TEMPLATES</span>
      </div>
    `;

    if (custom.length === 0) {
      html += `<div style="font-size: 11px; color: var(--text-secondary); padding: 4px 6px; font-style: italic;">No custom boilerplates saved yet.</div>`;
    } else {
      custom.forEach(tmpl => {
        html += `
          <div class="popover-item template-item" data-tmpl-id="${tmpl.id}" data-target="${targetContext}" style="display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 6px 8px; font-size: 12px; cursor: pointer; border-radius: 4px;">
            <span style="display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span>⭐</span>
              <strong style="color: var(--text-primary); font-weight: 500;">${this.escapeHtml(tmpl.name)}</strong>
            </span>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; background: var(--hover-bg); padding: 1px 6px; border-radius: 8px; color: var(--accent-color, #1a73e8);">${tmpl.language}</span>
              <button class="chip-remove-btn" data-delete-tmpl="${tmpl.id}" style="font-size: 11px; padding: 2px;">✕</button>
            </div>
          </div>
        `;
      });
    }

    html += `
      <div style="height: 1px; background: var(--border-color); margin: 6px 0;"></div>
      <div class="popover-item" data-save-current-tmpl="${targetContext}" style="display: flex; align-items: center; gap: 6px; padding: 6px 8px; font-size: 12px; font-weight: 600; color: #1a73e8; cursor: pointer; border-radius: 4px; background: var(--hover-bg);">
        ➕ Save Current Code as Template
      </div>
    `;

    menuElem.innerHTML = html;

    // Attach click handlers
    menuElem.querySelectorAll('[data-tmpl-id]').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('[data-delete-tmpl]')) return;
        const tmplId = item.getAttribute('data-tmpl-id');
        const target = item.getAttribute('data-target');
        this.applyTemplate(tmplId, target);
        menuElem.classList.remove('show');
      });
    });

    menuElem.querySelectorAll('[data-delete-tmpl]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tmplId = btn.getAttribute('data-delete-tmpl');
        this.deleteCustomTemplate(tmplId);
        this.renderTemplateMenu(menuElem, targetContext);
      });
    });

    const saveBtn = menuElem.querySelector('[data-save-current-tmpl]');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.saveCurrentCodeAsTemplate(targetContext);
        menuElem.classList.remove('show');
      });
    }
  }

  applyTemplate(tmplId, targetContext) {
    const allTemplates = [...this.presetTemplates, ...this.customTemplates];
    const tmpl = allTemplates.find(t => t.id === tmplId);
    if (!tmpl) return;

    if (targetContext === 'creator') {
      const langSelect = document.getElementById('creator-language-select');
      const codeInput = document.getElementById('creator-code-input');
      const titleInput = document.getElementById('note-title-input');

      if (langSelect) langSelect.value = tmpl.language;
      if (codeInput) codeInput.value = tmpl.code;
      if (titleInput && !titleInput.value) titleInput.value = tmpl.name;

      this.isCodeMode = true;
      this.codeLanguage = tmpl.language;

      const codeContainer = document.getElementById('code-container');
      const bodyInput = document.getElementById('note-body-input');
      if (codeContainer) codeContainer.style.display = 'block';
      if (bodyInput) bodyInput.style.display = 'none';

      this.showToast(`Inserted template "${tmpl.name}"!`);
    } else if (targetContext === 'edit') {
      const langSelect = document.getElementById('edit-language-select');
      const titleInput = document.getElementById('edit-note-title');

      if (langSelect) langSelect.value = tmpl.language;
      if (titleInput && !titleInput.value) titleInput.value = tmpl.name;

      if (this.editCodeMirror) {
        this.editCodeMirror.setValue(tmpl.code);
        this.editCodeMirror.setOption('mode', this.getCodeMirrorMode(tmpl.language));
      } else {
        const editCodeInput = document.getElementById('edit-code-input');
        if (editCodeInput) editCodeInput.value = tmpl.code;
      }

      this.showToast(`Inserted template "${tmpl.name}"!`);
    }
  }

  saveCurrentCodeAsTemplate(targetContext) {
    let code = '';
    let lang = 'javascript';
    let defaultName = '';

    if (targetContext === 'creator') {
      const codeInput = document.getElementById('creator-code-input');
      const langSelect = document.getElementById('creator-language-select');
      const titleInput = document.getElementById('note-title-input');
      code = codeInput ? codeInput.value : '';
      lang = langSelect ? langSelect.value : 'javascript';
      defaultName = titleInput ? titleInput.value : '';
    } else if (targetContext === 'edit') {
      const langSelect = document.getElementById('edit-language-select');
      const titleInput = document.getElementById('edit-note-title');
      lang = langSelect ? langSelect.value : 'javascript';
      defaultName = titleInput ? titleInput.value : '';

      if (this.editCodeMirror) {
        code = this.editCodeMirror.getValue();
      } else {
        const editCodeInput = document.getElementById('edit-code-input');
        code = editCodeInput ? editCodeInput.value : '';
      }
    }

    if (!code || !code.trim()) {
      this.showToast('Code is empty! Write code before saving as a template.');
      return;
    }

    const name = prompt('Enter a name for your custom boilerplate template:', defaultName || `${lang.toUpperCase()} Boilerplate`);
    if (!name || !name.trim()) return;

    const newTmpl = {
      id: 'custom_tmpl_' + Date.now(),
      name: name.trim(),
      language: lang,
      icon: '⭐',
      code: code,
      createdAt: new Date().toISOString()
    };

    this.customTemplates.push(newTmpl);
    this.saveTemplatesToStorage();
    this.showToast(`Saved custom template "${newTmpl.name}"!`);
  }

  deleteCustomTemplate(tmplId) {
    const tmpl = this.customTemplates.find(t => t.id === tmplId);
    if (!tmpl) return;

    this.customTemplates = this.customTemplates.filter(t => t.id !== tmplId);
    this.saveTemplatesToStorage();
    this.showToast(`Deleted template "${tmpl.name}"`);
  }

  deleteCollection(collectionId) {
    const col = this.collections.find(c => c.id === collectionId);
    if (!col) return;

    if (confirm(`Are you sure you want to delete collection "${col.name}"? (Your code snippets will not be deleted)`)) {
      this.collections = this.collections.filter(c => c.id !== collectionId);
      this.saveCollectionsToStorage();
      this.showToast(`Deleted collection "${col.name}"`);
      this.renderSidebarCollections();
      this.setView('notes');
    }
  }

  exportCollectionMarkdown(collectionId) {
    const collection = this.collections.find(c => c.id === collectionId);
    if (!collection) return;

    const notesInCol = (collection.noteIds || [])
      .map(id => this.notes.find(n => n.id === id))
      .filter(Boolean);

    let mdContent = `# ${collection.icon || '📚'} ${collection.name}\n\n`;
    if (collection.description) {
      mdContent += `> ${collection.description}\n\n`;
    }

    mdContent += `*Generated by [Code Bookshelf](https://code-bookshelf.vercel.app) on ${new Date().toLocaleDateString()} • Total Snippets: ${notesInCol.length}*\n\n`;

    if (notesInCol.length > 0) {
      mdContent += `## 📋 Table of Contents\n\n`;
      notesInCol.forEach((note, idx) => {
        const title = note.title || `Snippet #${idx + 1}`;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        mdContent += `${idx + 1}. [${title}](#${slug})\n`;
      });
      mdContent += `\n---\n\n`;

      notesInCol.forEach((note, idx) => {
        const title = note.title || `Snippet #${idx + 1}`;
        mdContent += `### ${idx + 1}. ${title}\n\n`;
        
        if (note.isCode && note.code) {
          const lang = note.codeLanguage || 'text';
          mdContent += `\`\`\`${lang}\n${note.code}\n\`\`\`\n\n`;
        }

        if (note.body) {
          mdContent += `${note.body}\n\n`;
        }

        if (note.isChecklist && note.checklistItems && note.checklistItems.length) {
          note.checklistItems.forEach(item => {
            mdContent += `- [${item.completed ? 'x' : ' '}] ${item.text}\n`;
          });
          mdContent += `\n`;
        }

        if (note.labels && note.labels.length) {
          mdContent += `**Tags:** ${note.labels.map(l => `\`#${l}\``).join(' ')}\n\n`;
        }

        mdContent += `---\n\n`;
      });
    } else {
      mdContent += `*No snippets in this collection yet.*\n`;
    }

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = (collection.name || 'collection').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast(`Exported "${collection.name}" to Markdown file!`);
  }

  exportCollectionPDF(collectionId) {
    const collection = this.collections.find(c => c.id === collectionId);
    if (!collection) return;

    const notesInCol = (collection.noteIds || [])
      .map(id => this.notes.find(n => n.id === id))
      .filter(Boolean);

    if (notesInCol.length === 0) {
      this.showToast('Collection is empty! Add snippets before exporting PDF.');
      return;
    }

    this.showToast('Generating PDF Cheat Sheet... Please wait.');

    const pdfContainer = document.createElement('div');
    pdfContainer.className = 'pdf-export-document';
    pdfContainer.style.padding = '24px';
    pdfContainer.style.fontFamily = "'Roboto', 'Google Sans', sans-serif";
    pdfContainer.style.color = '#202124';
    pdfContainer.style.backgroundColor = '#ffffff';

    let pdfHtml = `
      <div style="border-bottom: 2px solid #1A73E8; padding-bottom: 12px; margin-bottom: 20px;">
        <h1 style="font-size: 24px; color: #1A73E8; margin: 0 0 6px 0;">${collection.icon || '📚'} ${this.escapeHtml(collection.name)}</h1>
        ${collection.description ? `<p style="font-size: 14px; color: #5f6368; margin: 0 0 8px 0;">${this.escapeHtml(collection.description)}</p>` : ''}
        <div style="font-size: 12px; color: #80868b;">Code Bookshelf Cheat Sheet • ${notesInCol.length} Snippets • Generated on ${new Date().toLocaleDateString()}</div>
      </div>
    `;

    notesInCol.forEach((note, idx) => {
      const title = note.title || `Snippet #${idx + 1}`;
      pdfHtml += `
        <div style="margin-bottom: 20px; page-break-inside: avoid; border: 1px solid #dadce0; border-radius: 8px; overflow: hidden; background: #fafafa;">
          <div style="background: #f1f3f4; padding: 10px 14px; border-bottom: 1px solid #dadce0; display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 15px; color: #202124;">${idx + 1}. ${this.escapeHtml(title)}</strong>
            ${note.codeLanguage ? `<span style="background: #1A73E8; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${note.codeLanguage}</span>` : ''}
          </div>
          <div style="padding: 12px 14px;">
            ${note.isCode && note.code ? `
              <pre style="background: #282a36; color: #f8f8f2; padding: 12px; border-radius: 6px; font-family: 'Consolas', 'Fira Code', monospace; font-size: 12px; line-height: 1.5; overflow-x: auto; white-space: pre-wrap; margin: 0 0 10px 0;"><code>${this.escapeHtml(note.code)}</code></pre>
            ` : ''}
            ${note.body ? `<div style="font-size: 13px; color: #3c4043; line-height: 1.5; margin-bottom: 8px;">${this.escapeHtml(note.body)}</div>` : ''}
            ${note.labels && note.labels.length ? `<div style="font-size: 11px; color: #1a73e8;">Tags: ${note.labels.map(l => `#${this.escapeHtml(l)}`).join(' ')}</div>` : ''}
          </div>
        </div>
      `;
    });

    pdfContainer.innerHTML = pdfHtml;
    document.body.appendChild(pdfContainer);

    const fileName = `${(collection.name || 'cheat-sheet').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-cheatsheet.pdf`;

    if (typeof html2pdf !== 'undefined') {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(pdfContainer).save().then(() => {
        document.body.removeChild(pdfContainer);
        this.showToast('PDF Cheat Sheet downloaded successfully!');
      }).catch(err => {
        console.error('PDF export error:', err);
        document.body.removeChild(pdfContainer);
        this.showToast('Failed to export PDF.');
      });
    } else {
      window.print();
      document.body.removeChild(pdfContainer);
    }
  }

  toggleStar(id) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.isStarred = !note.isStarred;
      this.saveToStorage();
      this.render();
      this.showToast(note.isStarred ? 'Note added to Favorites ⭐' : 'Note removed from Favorites');
    }
  }

  updateModalStarButton(isStarred) {
    const starBtn = document.getElementById('edit-note-star-btn');
    if (starBtn) {
      starBtn.classList.toggle('starred', Boolean(isStarred));
      starBtn.style.color = isStarred ? '#fbbc04' : 'var(--text-secondary)';
      const path = starBtn.querySelector('path');
      if (path) {
        path.setAttribute('fill', isStarred ? '#fbbc04' : 'none');
      }
    }
  }

  /**
   * Edit Note Modal Handlers
   */
  initEditNoteModal() {
    const modal = document.getElementById('edit-note-modal');
    const saveBtn = document.getElementById('save-edit-note-btn');
    const pinBtn = document.getElementById('edit-note-pin-btn');
    const starBtn = document.getElementById('edit-note-star-btn');
    const modalRunBtn = document.getElementById('edit-modal-run-btn');
    const modalCopyBtn = document.getElementById('edit-modal-copy-btn');
    const modalDownloadBtn = document.getElementById('edit-modal-download-btn');

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveEditedNote();
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.saveEditedNote();
        }
      });
    }

    if (pinBtn) {
      pinBtn.addEventListener('click', () => {
        if (this.editingNoteId) {
          const note = this.notes.find(n => n.id === this.editingNoteId);
          if (note) {
            note.isPinned = !note.isPinned;
            pinBtn.classList.toggle('pinned', note.isPinned);
          }
        }
      });
    }

    if (starBtn) {
      starBtn.addEventListener('click', () => {
        if (this.editingNoteId) {
          const note = this.notes.find(n => n.id === this.editingNoteId);
          if (note) {
            note.isStarred = !note.isStarred;
            this.updateModalStarButton(note.isStarred);
            this.saveToStorage();
            this.render();
            this.showToast(note.isStarred ? 'Note added to Favorites ⭐' : 'Note removed from Favorites');
          }
        }
      });
    }

    if (modalCopyBtn) {
      modalCopyBtn.addEventListener('click', () => {
        const editCodeInput = document.getElementById('edit-code-input');
        if (editCodeInput && editCodeInput.value) {
          navigator.clipboard.writeText(editCodeInput.value).then(() => {
            this.showToast('Code copied to clipboard!');
          });
        }
      });
    }

    if (modalDownloadBtn) {
      modalDownloadBtn.addEventListener('click', () => {
        if (this.editingNoteId) {
          this.downloadCodeFile(this.editingNoteId);
        }
      });
    }

    const historyBtn = document.getElementById('edit-modal-history-btn');
    const historyDrawer = document.getElementById('edit-history-drawer');
    const closeHistoryBtn = document.getElementById('close-history-drawer-btn');

    if (historyBtn && historyDrawer) {
      historyBtn.addEventListener('click', () => {
        if (!this.editingNoteId) return;
        const note = this.notes.find(n => n.id === this.editingNoteId);
        if (!note) return;

        const isVisible = historyDrawer.style.display !== 'none';
        if (isVisible) {
          historyDrawer.style.display = 'none';
        } else {
          historyDrawer.style.display = 'block';
          this.renderVersionHistory(note);
        }
      });
    }

    if (closeHistoryBtn && historyDrawer) {
      closeHistoryBtn.addEventListener('click', () => {
        historyDrawer.style.display = 'none';
      });
    }

    // AI Code Assistant Handlers
    const aiExplainBtn = document.getElementById('edit-ai-explain-btn');
    const aiOptimizeBtn = document.getElementById('edit-ai-optimize-btn');
    const aiGenerateBtn = document.getElementById('edit-ai-generate-btn');
    const aiPromptInput = document.getElementById('edit-ai-prompt-input');
    const aiDrawer = document.getElementById('edit-ai-results-drawer');
    const aiDrawerTitle = document.getElementById('ai-drawer-title');
    const aiDrawerContent = document.getElementById('ai-drawer-content');
    const applyAiCodeBtn = document.getElementById('apply-ai-code-btn');
    const closeAiDrawerBtn = document.getElementById('close-ai-drawer-btn');

    let pendingAiCode = null;

    const openAiDrawer = (title, contentHtml, codeToApply = null) => {
      if (!aiDrawer) return;
      if (aiDrawerTitle) aiDrawerTitle.textContent = title;
      if (aiDrawerContent) aiDrawerContent.innerHTML = contentHtml;
      aiDrawer.style.display = 'block';

      if (codeToApply && applyAiCodeBtn) {
        pendingAiCode = codeToApply;
        applyAiCodeBtn.style.display = 'inline-block';
      } else if (applyAiCodeBtn) {
        pendingAiCode = null;
        applyAiCodeBtn.style.display = 'none';
      }
    };

    if (closeAiDrawerBtn && aiDrawer) {
      closeAiDrawerBtn.addEventListener('click', () => {
        aiDrawer.style.display = 'none';
      });
    }

    if (applyAiCodeBtn) {
      applyAiCodeBtn.addEventListener('click', () => {
        if (pendingAiCode) {
          const editCodeInput = document.getElementById('edit-code-input');
          if (editCodeInput) {
            editCodeInput.value = pendingAiCode;
            if (editCodeInput._cm) {
              editCodeInput._cm.setValue(pendingAiCode);
            }
          }
          this.showToast('Applied AI code to snippet!');
          if (aiDrawer) aiDrawer.style.display = 'none';
        }
      });
    }

    if (aiExplainBtn) {
      aiExplainBtn.addEventListener('click', async () => {
        const editCodeInput = document.getElementById('edit-code-input');
        const langSelect = document.getElementById('edit-language-select');
        const code = editCodeInput ? editCodeInput.value.trim() : '';
        const lang = langSelect ? langSelect.value : 'javascript';

        if (!code) {
          this.showToast('Please write or paste code first!');
          return;
        }

        openAiDrawer('💡 AI Line-by-Line Code Explanation', '<span class="compiling-spinner"></span> Analyzing snippet with AI...');

        try {
          const explanation = await window.aiAssistant.explainCode(code, lang);
          openAiDrawer('💡 AI Line-by-Line Code Explanation', this.formatMarkdownAndMath(explanation));
        } catch (err) {
          openAiDrawer('💡 AI Explanation Failed', `<span style="color: var(--error-red);">AI request failed: ${this.escapeHtml(err.message)}</span>`);
        }
      });
    }

    if (aiOptimizeBtn) {
      aiOptimizeBtn.addEventListener('click', async () => {
        const editCodeInput = document.getElementById('edit-code-input');
        const langSelect = document.getElementById('edit-language-select');
        const code = editCodeInput ? editCodeInput.value.trim() : '';
        const lang = langSelect ? langSelect.value : 'javascript';

        if (!code) {
          this.showToast('Please write or paste code first!');
          return;
        }

        openAiDrawer('⚡ AI Code Refactor & Optimization', '<span class="compiling-spinner"></span> Optimizing and refactoring snippet...');

        try {
          const result = await window.aiAssistant.optimizeCode(code, lang);
          const refactoredCode = window.aiAssistant.parseCodeBlock(result);
          openAiDrawer('⚡ AI Code Refactor & Optimization', this.formatMarkdownAndMath(result), refactoredCode);
        } catch (err) {
          openAiDrawer('⚡ AI Optimization Failed', `<span style="color: var(--error-red);">AI request failed: ${this.escapeHtml(err.message)}</span>`);
        }
      });
    }

    const runAiGenerate = async () => {
      const promptText = aiPromptInput ? aiPromptInput.value.trim() : '';
      const langSelect = document.getElementById('edit-language-select');
      const lang = langSelect ? langSelect.value : 'javascript';

      if (!promptText) {
        this.showToast('Please enter an AI prompt!');
        return;
      }

      openAiDrawer('✨ AI Code Generator', '<span class="compiling-spinner"></span> Generating code snippet from prompt...');

      try {
        const result = await window.aiAssistant.generateSnippet(promptText, lang);
        const generatedCode = window.aiAssistant.parseCodeBlock(result);
        openAiDrawer('✨ AI Code Generator', this.formatMarkdownAndMath(result), generatedCode);
      } catch (err) {
        openAiDrawer('✨ AI Generation Failed', `<span style="color: var(--error-red);">AI request failed: ${this.escapeHtml(err.message)}</span>`);
      }
    };

    if (aiGenerateBtn) aiGenerateBtn.addEventListener('click', runAiGenerate);
    if (aiPromptInput) {
      aiPromptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          runAiGenerate();
        }
      });
    }

    if (modalRunBtn) {
      modalRunBtn.addEventListener('click', async () => {
        if (!this.editingNoteId || !window.codeCompiler) return;
        const note = this.notes.find(n => n.id === this.editingNoteId);
        if (!note) return;

        const langSelect = document.getElementById('edit-language-select');
        const codeInput = document.getElementById('edit-code-input');
        const stdinInput = document.getElementById('edit-stdin-input');

        const lang = langSelect ? langSelect.value : note.codeLanguage;
        const code = codeInput ? codeInput.value : note.code;
        const stdin = stdinInput ? stdinInput.value : (note.stdin || '');

        modalRunBtn.disabled = true;
        modalRunBtn.innerHTML = '<span class="compiling-spinner"></span> Running...';

        try {
          const res = await window.codeCompiler.execute(lang, code, stdin);
          note.lastOutput = res.output;
          note.lastOutputIsError = Boolean(res.isError);
          note.lastOutputIsHtml = Boolean(res.isHtml);
          note.executionTime = res.executionTime || null;
          this.logActivity(1);
          this.saveToStorage();
          this.renderModalOutput(note);
        } catch (err) {
          note.lastOutput = 'Execution failed: ' + err.message;
          note.lastOutputIsError = true;
          this.saveToStorage();
          this.renderModalOutput(note);
        } finally {
          modalRunBtn.disabled = false;
          modalRunBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align: middle; margin-right: 4px;"><path fill="currentColor" d="M8 5v14l11-7z"/></svg> Run Code';
        }
      });
    }
  }

  setupCodeMirror(textareaElem, langKey) {
    if (!textareaElem || typeof CodeMirror === 'undefined') return null;
    if (textareaElem._cm) {
      try {
        textareaElem._cm.toTextArea();
      } catch (e) {}
    }
    const mode = window.codeCompiler ? window.codeCompiler.getCodeMirrorMode(langKey) : 'javascript';
    const isDark = document.body.classList.contains('dark-theme');
    const cm = CodeMirror.fromTextArea(textareaElem, {
      lineNumbers: true,
      mode: mode,
      theme: isDark ? 'dracula' : 'default',
      lineWrapping: true,
      tabSize: 2,
      indentWithTabs: false
    });
    cm.on('change', () => {
      textareaElem.value = cm.getValue();
    });
    textareaElem._cm = cm;
    setTimeout(() => cm.refresh(), 100);
    return cm;
  }

  openEditNoteModal(note) {
    this.editingNoteId = note.id;
    const modal = document.getElementById('edit-note-modal');
    const box = document.getElementById('edit-note-box');
    const titleInput = document.getElementById('edit-note-title');
    const bodyInput = document.getElementById('edit-note-body');
    const pinBtn = document.getElementById('edit-note-pin-btn');
    const chipsElem = document.getElementById('edit-note-chips');
    const imgElem = document.getElementById('edit-note-image');

    const editCodeContainer = document.getElementById('edit-code-container');
    const editLanguageSelect = document.getElementById('edit-language-select');
    const editCodeInput = document.getElementById('edit-code-input');
    const editStdinInput = document.getElementById('edit-stdin-input');
    const historyDrawer = document.getElementById('edit-history-drawer');
    const aiDrawer = document.getElementById('edit-ai-results-drawer');

    if (!modal || !titleInput || !bodyInput) return;

    if (historyDrawer) historyDrawer.style.display = 'none';
    if (aiDrawer) aiDrawer.style.display = 'none';

    this.updateModalStarButton(note.isStarred);

    titleInput.value = note.title || '';
    bodyInput.value = note.body || '';

    if (note.isCode) {
      if (bodyInput) bodyInput.style.display = 'none';
      if (editCodeContainer) editCodeContainer.style.display = 'flex';
      if (editLanguageSelect) editLanguageSelect.value = note.codeLanguage || 'javascript';
      if (editCodeInput) {
        editCodeInput.value = note.code || '';
        this.setupCodeMirror(editCodeInput, note.codeLanguage || 'javascript');
      }
      if (editStdinInput) editStdinInput.value = note.stdin || '';
      this.renderModalOutput(note);
    } else {
      if (bodyInput) bodyInput.style.display = 'block';
      if (editCodeContainer) editCodeContainer.style.display = 'none';
    }

    if (pinBtn) pinBtn.classList.toggle('pinned', note.isPinned);
    if (box) box.className = 'modal-box color-' + (note.color || 'default');

    let chipsHtml = '';
    if (note.reminder) {
      chipsHtml += `<span class="chip-badge"><svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align: middle; margin-right: 4px; fill: currentColor;"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"></path></svg>${this.escapeHtml(note.reminder)}</span>`;
    }
    if (note.labels) {
      note.labels.forEach(l => {
        chipsHtml += `<span class="chip-badge"><svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align: middle; margin-right: 4px; fill: currentColor;"><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84l3.96-5.58a.99.99 0 0 0 0-1.16l-3.96-5.58z"></path></svg>${this.escapeHtml(l)}</span>`;
      });
    }
    if (chipsElem) chipsElem.innerHTML = chipsHtml;

    if (imgElem) {
      imgElem.innerHTML = note.attachedImage ? `<img src="${note.attachedImage}" class="note-image-preview">` : '';
    }

    modal.classList.add('active');
  }

  computeDiff(oldText, newText) {
    if (typeof Diff !== 'undefined' && Diff.diffLines) {
      return Diff.diffLines(oldText, newText);
    }
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const diff = [];
    let i = 0, j = 0;
    while (i < oldLines.length || j < newLines.length) {
      if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
        diff.push({ value: oldLines[i] + '\n', count: 1 });
        i++;
        j++;
      } else if (j < newLines.length && (!oldLines.slice(i).includes(newLines[j]))) {
        diff.push({ value: newLines[j] + '\n', added: true, count: 1 });
        j++;
      } else if (i < oldLines.length) {
        diff.push({ value: oldLines[i] + '\n', removed: true, count: 1 });
        i++;
      }
    }
    return diff;
  }

  renderVersionHistory(note) {
    const container = document.getElementById('history-items-list');
    if (!container) return;

    if (!note.revisions || note.revisions.length === 0) {
      container.innerHTML = `
        <div style="font-size: 11px; color: var(--text-secondary); text-align: center; padding: 12px 0;">
          No previous code versions saved yet.<br>Snapshots are recorded automatically whenever you edit and save code snippets.
        </div>
      `;
      return;
    }

    container.innerHTML = note.revisions.map((rev, idx) => `
      <div class="history-item-card" style="display: flex; flex-direction: column; gap: 6px; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--bg-primary);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
          <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">📅 ${this.escapeHtml(rev.formattedDate || rev.timestamp)}</span>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button class="compare-diff-btn" data-rev-index="${idx}" style="background: var(--bg-search); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 500; cursor: pointer;">
              🔍 Compare Diff
            </button>
            <button class="restore-version-btn" data-rev-index="${idx}" style="background: var(--primary-yellow); color: #202124; border: none; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600; cursor: pointer;">
              Restore Version
            </button>
          </div>
        </div>
        <pre style="font-family: monospace; font-size: 11px; color: var(--text-primary); background: var(--bg-search); padding: 6px; border-radius: 4px; max-height: 60px; overflow-y: auto; white-space: pre-wrap; margin: 0;">${this.escapeHtml(rev.code)}</pre>
        
        <div class="version-diff-container" id="version-diff-${idx}" style="display: none; margin-top: 4px;"></div>
      </div>
    `).join('');

    container.querySelectorAll('.restore-version-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-rev-index'), 10);
        const rev = note.revisions[idx];
        if (rev) {
          const editCodeInput = document.getElementById('edit-code-input');
          if (editCodeInput) {
            editCodeInput.value = rev.code;
            if (editCodeInput._cm) {
              editCodeInput._cm.setValue(rev.code);
            }
          }
          this.showToast(`Restored snippet version from ${rev.formattedDate || 'history'}`);
        }
      });
    });

    container.querySelectorAll('.compare-diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-rev-index'), 10);
        const rev = note.revisions[idx];
        const diffBox = document.getElementById(`version-diff-${idx}`);
        if (!rev || !diffBox) return;

        if (diffBox.style.display !== 'none') {
          diffBox.style.display = 'none';
          btn.textContent = '🔍 Compare Diff';
          return;
        }

        const editCodeInput = document.getElementById('edit-code-input');
        const currentCode = editCodeInput ? editCodeInput.value : (note.code || '');

        btn.textContent = '✕ Close Diff';
        this.renderDiffView(diffBox, rev.code, currentCode, rev.formattedDate || 'Past Revision', 'inline');
      });
    });
  }

  renderDiffView(container, oldCode, newCode, revLabel, mode = 'inline') {
    const diff = this.computeDiff(oldCode, newCode);
    container.style.display = 'block';

    let diffContentHtml = '';

    if (mode === 'split') {
      const oldLinesHtml = [];
      const newLinesHtml = [];

      diff.forEach(part => {
        const lines = part.value.split('\n');
        if (lines[lines.length - 1] === '') lines.pop();

        if (part.added) {
          lines.forEach(l => {
            newLinesHtml.push(`<div style="background: rgba(46, 160, 67, 0.25); color: #7ee787; padding: 1px 4px;">+ ${this.escapeHtml(l)}</div>`);
          });
        } else if (part.removed) {
          lines.forEach(l => {
            oldLinesHtml.push(`<div style="background: rgba(248, 81, 73, 0.25); color: #ff7b72; padding: 1px 4px;">- ${this.escapeHtml(l)}</div>`);
          });
        } else {
          lines.forEach(l => {
            oldLinesHtml.push(`<div style="color: var(--text-secondary); opacity: 0.8; padding: 1px 4px;">  ${this.escapeHtml(l)}</div>`);
            newLinesHtml.push(`<div style="color: var(--text-secondary); opacity: 0.8; padding: 1px 4px;">  ${this.escapeHtml(l)}</div>`);
          });
        }
      });

      diffContentHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-family: monospace; font-size: 11px;">
          <div style="border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;">
            <div style="font-size: 10px; font-weight: 600; color: #ff7b72; padding: 4px 6px; background: rgba(248, 81, 73, 0.1); border-bottom: 1px solid var(--border-color);">- ${this.escapeHtml(revLabel)}</div>
            <pre style="margin: 0; padding: 4px; background: var(--bg-search); white-space: pre-wrap; max-height: 150px; overflow-y: auto;">${oldLinesHtml.join('')}</pre>
          </div>
          <div style="border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;">
            <div style="font-size: 10px; font-weight: 600; color: #7ee787; padding: 4px 6px; background: rgba(46, 160, 67, 0.1); border-bottom: 1px solid var(--border-color);">+ Current Editor</div>
            <pre style="margin: 0; padding: 4px; background: var(--bg-search); white-space: pre-wrap; max-height: 150px; overflow-y: auto;">${newLinesHtml.join('')}</pre>
          </div>
        </div>
      `;
    } else {
      const inlineRows = [];
      diff.forEach(part => {
        const lines = part.value.split('\n');
        if (lines[lines.length - 1] === '') lines.pop();

        if (part.added) {
          lines.forEach(l => {
            inlineRows.push(`<div style="background: rgba(46, 160, 67, 0.25); color: #7ee787; padding: 1px 6px;">+ ${this.escapeHtml(l)}</div>`);
          });
        } else if (part.removed) {
          lines.forEach(l => {
            inlineRows.push(`<div style="background: rgba(248, 81, 73, 0.25); color: #ff7b72; padding: 1px 6px;">- ${this.escapeHtml(l)}</div>`);
          });
        } else {
          lines.forEach(l => {
            inlineRows.push(`<div style="color: var(--text-secondary); opacity: 0.8; padding: 1px 6px;">  ${this.escapeHtml(l)}</div>`);
          });
        }
      });

      diffContentHtml = `
        <pre style="font-family: monospace; font-size: 11px; margin: 0; padding: 6px; border-radius: 4px; background: var(--bg-search); white-space: pre-wrap; max-height: 160px; overflow-y: auto; border: 1px solid var(--border-color);">${inlineRows.join('')}</pre>
      `;
    }

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 6px; font-weight: 600; color: var(--text-primary);">
        <span>Diff: <span style="color: #ff7b72;">- ${this.escapeHtml(revLabel)}</span> vs <span style="color: #7ee787;">+ Current Editor</span></span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button class="diff-toggle-mode-btn" data-mode="inline" style="font-size: 10px; padding: 2px 6px; border-radius: 3px; border: 1px solid var(--border-color); background: ${mode === 'inline' ? 'var(--primary-yellow)' : 'var(--bg-primary)'}; color: ${mode === 'inline' ? '#202124' : 'var(--text-primary)'}; cursor: pointer; font-weight: ${mode === 'inline' ? '600' : 'normal'};">Inline</button>
          <button class="diff-toggle-mode-btn" data-mode="split" style="font-size: 10px; padding: 2px 6px; border-radius: 3px; border: 1px solid var(--border-color); background: ${mode === 'split' ? 'var(--primary-yellow)' : 'var(--bg-primary)'}; color: ${mode === 'split' ? '#202124' : 'var(--text-primary)'}; cursor: pointer; font-weight: ${mode === 'split' ? '600' : 'normal'};">Side-by-Side</button>
        </div>
      </div>
      ${diffContentHtml}
    `;

    container.querySelectorAll('.diff-toggle-mode-btn').forEach(mBtn => {
      mBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newMode = mBtn.getAttribute('data-mode');
        this.renderDiffView(container, oldCode, newCode, revLabel, newMode);
      });
    });
  }

  renderModalOutput(note) {
    const container = document.getElementById('edit-modal-output-container');
    if (!container) return;

    if (note.lastOutput !== null && note.lastOutput !== undefined) {
      if (note.lastOutputIsHtml) {
        container.innerHTML = `
          <div class="code-terminal-output">
            <div class="code-terminal-header">
              <span>Live Preview</span>
              <button class="chip-remove-btn" id="modal-clear-output-btn">✕</button>
            </div>
            <iframe class="code-preview-iframe" srcdoc="${this.escapeHtml(note.lastOutput)}"></iframe>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="code-terminal-output ${note.lastOutputIsError ? 'is-error' : ''}">
            <div class="code-terminal-header">
              <span>Output ${note.executionTime ? `(${note.executionTime})` : ''}</span>
              <div class="code-header-right-actions">
                ${note.lastOutputIsError ? `
                  <button class="code-action-icon-btn" id="modal-ai-fix-btn" title="Fix bug with AI" style="background: rgba(234, 67, 53, 0.15); color: #ea4335; border: 1px solid rgba(234, 67, 53, 0.3); border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 3px;">
                    🐛 Fix with AI
                  </button>
                ` : ''}
                <button class="code-action-icon-btn" id="modal-copy-output-btn" title="Copy output">
                  <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                </button>
                <button class="chip-remove-btn" id="modal-clear-output-btn">✕</button>
              </div>
            </div>
            <div class="code-terminal-body">${this.escapeHtml(note.lastOutput)}</div>
          </div>
        `;
      }

      const aiFixBtn = document.getElementById('modal-ai-fix-btn');
      if (aiFixBtn) {
        aiFixBtn.addEventListener('click', async () => {
          const aiDrawer = document.getElementById('edit-ai-results-drawer');
          const aiDrawerTitle = document.getElementById('ai-drawer-title');
          const aiDrawerContent = document.getElementById('ai-drawer-content');
          const applyAiCodeBtn = document.getElementById('apply-ai-code-btn');

          if (aiDrawer && aiDrawerTitle && aiDrawerContent) {
            aiDrawerTitle.textContent = '🐛 AI Bug Fix & Diagnosis';
            aiDrawerContent.innerHTML = '<span class="compiling-spinner"></span> Diagnosing execution bug and generating fix...';
            aiDrawer.style.display = 'block';
            if (applyAiCodeBtn) applyAiCodeBtn.style.display = 'none';

            try {
              const result = await window.aiAssistant.fixBug(note.code, note.codeLanguage, note.lastOutput, note.stdin || '');
              const fixedCode = window.aiAssistant.parseCodeBlock(result);
              aiDrawerContent.innerHTML = this.formatMarkdownAndMath(result);
              if (fixedCode && applyAiCodeBtn) {
                applyAiCodeBtn.style.display = 'inline-block';
                const onApply = () => {
                  const editCodeInput = document.getElementById('edit-code-input');
                  if (editCodeInput) {
                    editCodeInput.value = fixedCode;
                    if (editCodeInput._cm) editCodeInput._cm.setValue(fixedCode);
                  }
                  this.showToast('Applied AI bug fix!');
                  aiDrawer.style.display = 'none';
                  applyAiCodeBtn.removeEventListener('click', onApply);
                };
                applyAiCodeBtn.addEventListener('click', onApply);
              }
            } catch (err) {
              aiDrawerContent.innerHTML = `<span style="color: var(--error-red);">AI request failed: ${this.escapeHtml(err.message)}</span>`;
            }
          }
        });
      }

      const clearBtn = document.getElementById('modal-clear-output-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          note.lastOutput = null;
          note.lastOutputIsError = false;
          note.lastOutputIsHtml = false;
          note.executionTime = null;
          this.saveToStorage();
          container.innerHTML = '';
        });
      }

      const copyOutputBtn = document.getElementById('modal-copy-output-btn');
      if (copyOutputBtn) {
        copyOutputBtn.addEventListener('click', () => {
          if (note.lastOutput) {
            navigator.clipboard.writeText(note.lastOutput).then(() => {
              this.showToast('Output copied to clipboard!');
            });
          }
        });
      }
    } else {
      container.innerHTML = '';
    }
  }

  saveEditedNote() {
    const modal = document.getElementById('edit-note-modal');
    const titleInput = document.getElementById('edit-note-title');
    const bodyInput = document.getElementById('edit-note-body');
    const editLanguageSelect = document.getElementById('edit-language-select');
    const editCodeInput = document.getElementById('edit-code-input');
    const editStdinInput = document.getElementById('edit-stdin-input');

    if (this.editingNoteId) {
      const note = this.notes.find(n => n.id === this.editingNoteId);
      if (note) {
        note.title = titleInput ? titleInput.value.trim() : '';
        if (note.isCode) {
          const oldCode = note.code;
          const newCode = editCodeInput ? editCodeInput.value.trim() : '';
          const newLang = editLanguageSelect ? editLanguageSelect.value : 'javascript';
          const newStdin = editStdinInput ? editStdinInput.value : '';

          if (oldCode && oldCode !== newCode) {
            if (!note.revisions) note.revisions = [];
            const now = new Date();
            note.revisions.unshift({
              timestamp: now.toISOString(),
              formattedDate: now.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              code: oldCode,
              language: note.codeLanguage || 'javascript'
            });
            if (note.revisions.length > 20) {
              note.revisions.pop();
            }
          }

          note.codeLanguage = newLang;
          note.code = newCode;
          note.stdin = newStdin;
        } else {
          note.body = bodyInput ? bodyInput.value.trim() : '';
        }
        this.extractAndAssignHashtags(note);
        this.saveToStorage();
        this.render();
      }
    }

    this.editingNoteId = null;
    if (modal) modal.classList.remove('active');
  }

  /**
   * Drawing Canvas Modal Logic
   */
  initDrawingCanvas() {
    const modal = document.getElementById('drawing-modal');
    const canvas = document.getElementById('drawing-canvas');
    const clearBtn = document.getElementById('clear-canvas-btn');
    const saveBtn = document.getElementById('save-canvas-btn');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left,
        y: (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top
      };
    };

    const startDraw = (e) => {
      this.isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      const pos = getPos(e);
      ctx.strokeStyle = this.drawingColor;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stopDraw = () => {
      this.isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);

    const colorBtns = modal ? modal.querySelectorAll('.drawing-color-btn') : [];
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.drawingColor = btn.getAttribute('data-color');
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.attachedImage = canvas.toDataURL();
        this.renderCreatorImagePreview();
        this.closeDrawingModal();

        const creator = document.getElementById('note-creator');
        if (creator) creator.classList.add('expanded');
      });
    }
  }

  openDrawingModal() {
    const modal = document.getElementById('drawing-modal');
    if (modal) modal.classList.add('active');
  }

  closeDrawingModal() {
    const modal = document.getElementById('drawing-modal');
    if (modal) modal.classList.remove('active');
  }

  renderCreatorImagePreview() {
    const imgContainer = document.getElementById('creator-image-container');
    if (!imgContainer) return;

    if (this.attachedImage) {
      imgContainer.innerHTML = `<img src="${this.attachedImage}" class="note-image-preview" alt="Drawing Attachment">`;
    } else {
      imgContainer.innerHTML = '';
    }
  }

  initColorPicker() {
    const colorBtn = document.getElementById('creator-color-btn');
    const colorMenu = document.getElementById('color-picker-menu');

    if (!colorBtn || !colorMenu) return;

    colorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      colorMenu.classList.toggle('active');
    });

    const circles = colorMenu.querySelectorAll('.color-circle');
    circles.forEach(circle => {
      circle.addEventListener('click', (e) => {
        e.stopPropagation();
        circles.forEach(c => c.classList.remove('selected'));
        circle.classList.add('selected');
        
        this.selectedColor = circle.getAttribute('data-color');
        this.updateCreatorBackground(this.selectedColor);
        colorMenu.classList.remove('active');
      });
    });
  }

  updateCreatorBackground(colorName) {
    const creator = document.getElementById('note-creator');
    if (!creator) return;
    creator.className = 'note-creator expanded ' + (colorName !== 'default' ? `color-${colorName}` : '');
  }

  createNoteFromForm() {
    const titleInput = document.getElementById('note-title-input');
    const bodyInput = document.getElementById('note-body-input');
    const codeInput = document.getElementById('creator-code-input');
    const stdinInput = document.getElementById('creator-stdin-input');
    const languageSelect = document.getElementById('creator-language-select');

    const title = titleInput ? titleInput.value.trim() : '';
    const body = bodyInput ? bodyInput.value.trim() : '';
    const code = codeInput ? codeInput.value.trim() : '';
    const stdin = stdinInput ? stdinInput.value : '';
    const language = languageSelect ? languageSelect.value : 'javascript';

    const hasChecklist = this.isChecklistMode && this.checklistItems.length > 0;
    const hasCode = this.isCodeMode && Boolean(code);

    if (!title && !body && !hasChecklist && !hasCode && !this.attachedImage) return;

    const newNote = {
      id: 'note_' + Date.now(),
      title: title,
      body: body,
      isChecklist: this.isChecklistMode,
      checklistItems: this.isChecklistMode ? [...this.checklistItems] : [],
      isCode: this.isCodeMode,
      codeLanguage: language,
      code: code,
      stdin: stdin,
      lastOutput: null,
      lastOutputIsError: false,
      lastOutputIsHtml: false,
      executionTime: null,
      attachedImage: this.attachedImage,
      reminder: this.selectedReminder,
      labels: [...this.selectedLabels],
      color: this.selectedColor,
      isPinned: this.isPinned,
      isArchived: false,
      isBinned: false,
      createdAt: Date.now()
    };

    this.extractAndAssignHashtags(newNote);
    this.notes.unshift(newNote);
    this.logActivity(1);
    this.saveToStorage();
    this.render();
  }

  resetCreatorForm() {
    const creator = document.getElementById('note-creator');
    const titleInput = document.getElementById('note-title-input');
    const bodyInput = document.getElementById('note-body-input');
    const codeInput = document.getElementById('creator-code-input');
    const stdinInput = document.getElementById('creator-stdin-input');
    const languageSelect = document.getElementById('creator-language-select');
    const creatorPinBtn = document.getElementById('creator-pin-btn');
    
    const colorMenu = document.getElementById('color-picker-menu');
    const reminderPopover = document.getElementById('reminder-popover');
    const labelPopover = document.getElementById('label-popover');

    if (titleInput) titleInput.value = '';
    if (bodyInput) bodyInput.value = '';
    if (codeInput) codeInput.value = '';
    if (stdinInput) stdinInput.value = '';
    if (languageSelect) languageSelect.value = 'javascript';
    
    this.selectedColor = 'default';
    this.isPinned = false;
    this.isChecklistMode = false;
    this.checklistItems = [];
    this.isCodeMode = false;
    this.codeLanguage = 'javascript';
    this.codeContent = '';
    this.attachedImage = null;
    this.selectedReminder = null;
    this.selectedLabels = [];

    this.enableCodeMode(false);
    this.enableChecklistMode(false);
    this.renderCreatorChecklist();
    this.renderCreatorImagePreview();
    this.renderCreatorChips();
    
    if (creatorPinBtn) creatorPinBtn.classList.remove('pinned');
    if (colorMenu) colorMenu.classList.remove('active');
    if (reminderPopover) reminderPopover.classList.remove('active');
    if (labelPopover) labelPopover.classList.remove('active');
    if (creator) creator.className = 'note-creator';
  }

  initSearchListener() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }
  }

  setView(viewName) {
    this.currentView = viewName;
    this.render();
  }

  togglePin(id) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.isPinned = !note.isPinned;
      this.saveToStorage();
      this.render();
    }
  }

  archiveNote(id) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.isArchived = !note.isArchived;
      this.saveToStorage();
      this.render();
    }
  }

  binNote(id) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.isBinned = !note.isBinned;
      this.saveToStorage();
      this.render();
    }
  }

  deleteForever(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.saveToStorage();
    this.render();
  }

  changeNoteColor(id, color) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.color = color;
      this.saveToStorage();
      this.render();
    }
  }

  /**
   * Reorder Notes via Drag and Drop
   */
  reorderNotes(draggedId, targetId) {
    if (draggedId === targetId) return;

    const fromIdx = this.notes.findIndex(n => n.id === draggedId);
    const toIdx = this.notes.findIndex(n => n.id === targetId);

    if (fromIdx !== -1 && toIdx !== -1) {
      const [draggedNote] = this.notes.splice(fromIdx, 1);
      this.notes.splice(toIdx, 0, draggedNote);
      this.saveToStorage();
      this.render();
    }
  }

  render() {
    const mainContainer = document.getElementById('notes-workspace');
    if (!mainContainer) return;

    const creatorWrapper = document.getElementById('note-creator-wrapper');

    if (this.currentView === 'analytics') {
      if (creatorWrapper) creatorWrapper.style.display = 'none';
      mainContainer.innerHTML = this.renderAnalyticsDashboard();
      return;
    }

    let collectionBannerHtml = '';
    if (this.currentView.startsWith('collection_')) {
      const colId = this.currentView.replace('collection_', '');
      const col = this.collections.find(c => c.id === colId);
      if (col) {
        const noteCount = (col.noteIds || []).filter(id => this.notes.some(n => n.id === id && !n.isArchived && !n.isBinned)).length;
        collectionBannerHtml = `
          <div class="collection-header-banner">
            <div class="collection-header-info">
              <div class="collection-header-icon">${col.icon || '📚'}</div>
              <div>
                <h2 class="collection-header-title">${this.escapeHtml(col.name)}</h2>
                <div class="collection-header-desc">${this.escapeHtml(col.description || 'Structured Notebook Collection')}</div>
                <span class="collection-header-meta">📋 ${noteCount} Snippet${noteCount === 1 ? '' : 's'}</span>
              </div>
            </div>
            <div class="collection-header-actions">
              <button class="collection-btn-export-md" data-export-md="${col.id}" title="Download Markdown README.md for GitHub">
                📄 Export Markdown (.md)
              </button>
              <button class="collection-btn-export-pdf" data-export-pdf="${col.id}" title="Download formatted PDF Cheat Sheet">
                📕 Export PDF Cheat Sheet
              </button>
              <button class="creator-btn-close" data-manage-col-snippets="${col.id}">
                ➕ Manage Snippets
              </button>
              <button class="icon-btn" data-edit-col="${col.id}" title="Edit Collection">
                ✏️
              </button>
              <button class="icon-btn" data-delete-col="${col.id}" title="Delete Collection">
                🗑️
              </button>
            </div>
          </div>
        `;
      }
    }

    let filtered = this.notes.filter(n => {
      if (this.currentView === 'archive') return n.isArchived && !n.isBinned;
      if (this.currentView === 'bin') return n.isBinned;
      if (this.currentView === 'reminders') return !n.isArchived && !n.isBinned && n.reminder;
      if (this.currentView === 'favorites') return !n.isArchived && !n.isBinned && n.isStarred;
      if (this.currentView.startsWith('label_')) {
        const targetLabel = this.currentView.replace('label_', '');
        return !n.isArchived && !n.isBinned && n.labels && n.labels.includes(targetLabel);
      }
      if (this.currentView.startsWith('collection_')) {
        const colId = this.currentView.replace('collection_', '');
        const col = this.collections.find(c => c.id === colId);
        if (!col) return false;
        return !n.isArchived && !n.isBinned && (col.noteIds || []).includes(n.id);
      }
      return !n.isArchived && !n.isBinned;
    });

    if (this.isStarredFilter) {
      filtered = filtered.filter(n => n.isStarred);
    }

    if (this.selectedLanguageFilter && this.selectedLanguageFilter !== 'all') {
      filtered = filtered.filter(n => n.isCode && n.codeLanguage === this.selectedLanguageFilter);
    }

    if (this.selectedTypeFilter && this.selectedTypeFilter !== 'all') {
      if (this.selectedTypeFilter === 'code') {
        filtered = filtered.filter(n => n.isCode);
      } else if (this.selectedTypeFilter === 'checklist') {
        filtered = filtered.filter(n => n.isChecklist);
      } else if (this.selectedTypeFilter === 'text') {
        filtered = filtered.filter(n => !n.isCode && !n.isChecklist);
      }
    }

    if (this.selectedTagFilters && this.selectedTagFilters.length > 0) {
      filtered = filtered.filter(n => {
        if (!n.labels || !Array.isArray(n.labels)) return false;
        return this.selectedTagFilters.every(t => n.labels.includes(t));
      });
    }

    if (this.searchQuery) {
      const tokens = this.searchQuery.split(/\s+/).filter(Boolean);
      const tagTokens = tokens.filter(t => t.startsWith('#')).map(t => t.replace(/^#/, '').toLowerCase());
      const textTokens = tokens.filter(t => !t.startsWith('#')).map(t => t.toLowerCase());

      filtered = filtered.filter(n => {
        if (tagTokens.length > 0) {
          const noteLabels = (n.labels || []).map(l => l.toLowerCase());
          const matchAllTags = tagTokens.every(t => noteLabels.some(l => l.includes(t)));
          if (!matchAllTags) return false;
        }

        if (textTokens.length > 0) {
          const matchText = textTokens.every(q => 
            (n.title && n.title.toLowerCase().includes(q)) || 
            (n.body && n.body.toLowerCase().includes(q)) ||
            (n.code && n.code.toLowerCase().includes(q)) ||
            (n.codeLanguage && n.codeLanguage.toLowerCase().includes(q)) ||
            (n.checklistItems && n.checklistItems.some(i => i.text.toLowerCase().includes(q)))
          );
          if (!matchText) return false;
        }

        return true;
      });
    }

    if (creatorWrapper) {
      creatorWrapper.style.display = (this.currentView === 'archive' || this.currentView === 'bin') ? 'none' : 'flex';
    }

    if (filtered.length === 0) {
      mainContainer.innerHTML = collectionBannerHtml + `
        <div class="empty-notes-msg">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8V9zm0 3h8v2h-8v-2zm0-6h8v2h-8V6z"></path>
          </svg>
          <p>${this.getEmptyMessage()}</p>
        </div>
      `;
      this.attachCollectionBannerListeners(mainContainer);
      return;
    }

    const starredNotes = filtered.filter(n => n.isStarred);
    const pinnedNotes = filtered.filter(n => n.isPinned && !n.isStarred);
    const otherNotes = filtered.filter(n => !n.isPinned && !n.isStarred);

    let html = '';

    if (starredNotes.length > 0 && this.currentView === 'notes') {
      html += `
        <div class="notes-section">
          <div class="section-heading">⭐ FAVORITES</div>
          <div class="notes-grid">
            ${starredNotes.map(n => this.renderCardHtml(n)).join('')}
          </div>
        </div>
      `;
    }

    if (pinnedNotes.length > 0 && this.currentView === 'notes') {
      html += `
        <div class="notes-section">
          <div class="section-heading">📌 PINNED</div>
          <div class="notes-grid">
            ${pinnedNotes.map(n => this.renderCardHtml(n)).join('')}
          </div>
        </div>
      `;
    }

    if (otherNotes.length > 0 || (starredNotes.length === 0 && pinnedNotes.length === 0)) {
      html += `
        <div class="notes-section">
          ${((starredNotes.length > 0 || pinnedNotes.length > 0) && this.currentView === 'notes') ? '<div class="section-heading">OTHERS</div>' : ''}
          <div class="notes-grid">
            ${((starredNotes.length > 0 || pinnedNotes.length > 0) && this.currentView === 'notes' ? otherNotes : filtered).map(n => this.renderCardHtml(n)).join('')}
          </div>
        </div>
      `;
    }

    mainContainer.innerHTML = collectionBannerHtml + html;
    this.attachCollectionBannerListeners(mainContainer);
    this.attachCardEventListeners();
  }

  attachCollectionBannerListeners(container) {
    container.querySelectorAll('[data-export-md]').forEach(btn => {
      btn.addEventListener('click', () => this.exportCollectionMarkdown(btn.getAttribute('data-export-md')));
    });

    container.querySelectorAll('[data-export-pdf]').forEach(btn => {
      btn.addEventListener('click', () => this.exportCollectionPDF(btn.getAttribute('data-export-pdf')));
    });

    container.querySelectorAll('[data-manage-col-snippets]').forEach(btn => {
      btn.addEventListener('click', () => this.openManageSnippetsModal(btn.getAttribute('data-manage-col-snippets')));
    });

    container.querySelectorAll('[data-edit-col]').forEach(btn => {
      btn.addEventListener('click', () => this.openCollectionModal(btn.getAttribute('data-edit-col')));
    });

    container.querySelectorAll('[data-delete-col]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteCollection(btn.getAttribute('data-delete-col')));
    });
  }

  getEmptyMessage() {
    if (this.searchQuery) return `No notes match "${this.searchQuery}"`;
    if (this.currentView === 'archive') return 'No archived notes';
    if (this.currentView === 'bin') return 'No notes in Bin';
    if (this.currentView === 'favorites') return 'No favorited notes yet. Click the ⭐ star icon on any note card to add it to Favorites!';
    if (this.currentView === 'reminders') return 'Notes with upcoming reminders will appear here';
    if (this.currentView.startsWith('label_')) return `No notes with label "${this.currentView.replace('label_', '')}"`;
    if (this.currentView.startsWith('collection_')) return 'No snippets in this collection yet. Click "➕ Manage Snippets" above to add code snippets!';
    return 'Notes you add appear here';
  }

  renderCardHtml(note) {
    const isBinView = this.currentView === 'bin';

    const badgeMap = {
      javascript: 'JS',
      python: 'PY',
      java: 'JAVA',
      c: 'C',
      cpp: 'C++',
      sql: 'SQL',
      rust: 'RS',
      go: 'GO',
      html: 'HTML'
    };

    let contentHtml = '';
    if (note.isCode && note.code) {
      const badgeText = badgeMap[note.codeLanguage] || (note.codeLanguage ? note.codeLanguage.toUpperCase() : 'CODE');
      let outputDrawerHtml = '';
      if (note.lastOutput !== null && note.lastOutput !== undefined) {
        if (note.lastOutputIsHtml) {
          outputDrawerHtml = `
            <div class="code-terminal-output">
              <div class="code-terminal-header">
                <span>
                  <svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align: middle; margin-right: 4px;"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  Live Preview
                </span>
                <button class="chip-remove-btn" data-clear-output="${note.id}">✕</button>
              </div>
              <iframe class="code-preview-iframe" srcdoc="${this.escapeHtml(note.lastOutput)}"></iframe>
            </div>
          `;
        } else {
          outputDrawerHtml = `
            <div class="code-terminal-output ${note.lastOutputIsError ? 'is-error' : ''}">
              <div class="code-terminal-header">
                <span>
                  <svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align: middle; margin-right: 4px;"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>
                  Output ${note.executionTime ? `(${note.executionTime})` : ''}
                </span>
                <div class="code-header-right-actions">
                  <button class="code-action-icon-btn" data-copy-output="${note.id}" title="Copy output">
                    <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                  </button>
                  <button class="chip-remove-btn" data-clear-output="${note.id}">✕</button>
                </div>
              </div>
              <div class="code-terminal-body">${this.escapeHtml(note.lastOutput)}</div>
            </div>
          `;
        }
      }

      const lineCount = note.code ? note.code.split('\n').length : 0;
      const isTruncated = lineCount > 4;

      contentHtml = `
        <div class="code-card-block ${isTruncated ? 'has-more' : ''}">
          <div class="code-card-header">
            <span class="code-language-badge">${badgeText}</span>
            ${!isBinView ? `
              <div class="code-card-actions">
                <button class="code-action-icon-btn" data-share-code="${note.id}" title="Share link">
                  <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                </button>
                <button class="code-action-icon-btn" data-copy-code="${note.id}" title="Copy code">
                  <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                </button>
                <button class="code-run-btn" data-run-code="${note.id}">
                  <svg viewBox="0 0 24 24" width="12" height="12" style="vertical-align: middle; margin-right: 3px;"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                  Run
                </button>
              </div>
            ` : ''}
          </div>
          <div class="code-card-pre-wrapper ${isTruncated ? 'is-truncated' : ''}">
            <pre class="code-card-pre">${this.formatCodeHighlight(note.code, note.codeLanguage)}</pre>
          </div>
          ${isTruncated ? `<div class="code-expand-hint">Click to expand note (${lineCount} lines)</div>` : ''}
        </div>
        ${outputDrawerHtml}
      `;
    } else if (note.isChecklist && note.checklistItems && note.checklistItems.length > 0) {
      contentHtml = `<div class="checklist-container">
        ${note.checklistItems.map((item, iIdx) => `
          <div class="checklist-row">
            <input type="checkbox" class="checklist-checkbox card-checklist-checkbox" ${item.completed ? 'checked' : ''} data-note-id="${note.id}" data-item-idx="${iIdx}">
            <span class="checklist-input ${item.completed ? 'checked' : ''}">${this.escapeHtml(item.text)}</span>
          </div>
        `).join('')}
      </div>`;
    } else if (note.body) {
      contentHtml = this.formatMarkdownAndMath(note.body);
    }

    let chipsHtml = '';
    if (note.reminder) {
      chipsHtml += `
        <span class="chip-badge">
          <svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align: middle; margin-right: 4px;"><path fill="currentColor" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
          ${this.escapeHtml(note.reminder)}
          <button class="chip-remove-btn" data-remove-card-reminder="${note.id}">✕</button>
        </span>
      `;
    }
    if (note.labels && note.labels.length > 0) {
      note.labels.forEach((label, lIdx) => {
        chipsHtml += `
          <span class="chip-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align: middle; margin-right: 4px;"><path fill="currentColor" d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L21 12l-3.37-6.16z"/></svg>
            ${this.escapeHtml(label)}
            <button class="chip-remove-btn" data-remove-card-label="${note.id}" data-label-index="${lIdx}">✕</button>
          </span>
        `;
      });
    }

    return `
      <div class="note-card color-${note.color || 'default'}" data-id="${note.id}" draggable="true">
        <div class="note-card-header">
          ${note.title ? `<div class="note-card-title">${this.escapeHtml(note.title)}</div>` : '<div></div>'}
          ${!isBinView ? `
            <div style="display: flex; align-items: center; gap: 2px;">
              <div class="tooltip-container" data-tooltip="${note.isStarred ? 'Remove from favorites' : 'Add to favorites'}">
                <button class="icon-btn star-btn ${note.isStarred ? 'starred' : ''}" data-action="star" aria-label="Favorite note" style="color: ${note.isStarred ? '#fbbc04' : 'var(--text-secondary)'};">
                  <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
                    <path fill="${note.isStarred ? '#fbbc04' : 'none'}" stroke="currentColor" stroke-width="2" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                </button>
              </div>
              <div class="tooltip-container" data-tooltip="${note.isPinned ? 'Unpin note' : 'Pin note'}">
                <button class="icon-btn pin-btn ${note.isPinned ? 'pinned' : ''}" data-action="pin" aria-label="Pin note">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M17 4v7l2 3v2h-6v5l-1 1-1-1v-5H5v-2l2-3V4c0-.55.45-1 1-1h8c.55 0 1 .45 1 1z"></path>
                  </svg>
                </button>
              </div>
            </div>
          ` : ''}
        </div>
        
        ${contentHtml}
        ${note.attachedImage ? `<img src="${note.attachedImage}" class="note-image-preview" alt="Drawing Note">` : ''}
        ${chipsHtml ? `<div class="note-chips-row">${chipsHtml}</div>` : ''}

        <div class="note-card-toolbar">
          ${!isBinView ? `
            <div class="tooltip-container" data-tooltip="Background options">
              <button class="icon-btn card-color-btn" data-action="color" aria-label="Background options">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.22 19.57 10.57 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"></path>
                </svg>
              </button>
              <div class="card-color-picker-menu" data-card-color-menu="${note.id}">
                <div class="color-circle" data-change-color="default" style="background-color: var(--bg-primary);"></div>
                <div class="color-circle" data-change-color="red" style="background-color: #f28b82;"></div>
                <div class="color-circle" data-change-color="orange" style="background-color: #fbbc04;"></div>
                <div class="color-circle" data-change-color="yellow" style="background-color: #fff475;"></div>
                <div class="color-circle" data-change-color="green" style="background-color: #ccff90;"></div>
                <div class="color-circle" data-change-color="teal" style="background-color: #a7ffeb;"></div>
                <div class="color-circle" data-change-color="blue" style="background-color: #cbf0f8;"></div>
                <div class="color-circle" data-change-color="darkblue" style="background-color: #aecbfa;"></div>
                <div class="color-circle" data-change-color="purple" style="background-color: #d7aefb;"></div>
                <div class="color-circle" data-change-color="pink" style="background-color: #fdaff5;"></div>
                <div class="color-circle" data-change-color="brown" style="background-color: #e6c9a8;"></div>
                <div class="color-circle" data-change-color="grey" style="background-color: #e8eaed;"></div>
              </div>
            </div>
            <div class="tooltip-container" data-tooltip="Add to collection" style="position: relative;">
              <button class="icon-btn card-collection-btn" data-action="collection" aria-label="Add to collection">
                <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
                  <path fill="currentColor" d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM12 5.5l1.45 2.94 3.25.47-2.35 2.29.55 3.24L12 12.91l-2.9 1.52.55-3.24-2.35-2.29 3.25-.47L12 5.5z"/>
                </svg>
              </button>
              <div class="card-collection-picker-menu" data-card-collection-menu="${note.id}">
                ${this.collections.length === 0 ? '<div style="font-size: 11px; color: var(--text-secondary); padding: 4px;">No collections created</div>' : this.collections.map(col => {
                  const inCol = (col.noteIds || []).includes(note.id);
                  return `
                    <label class="collection-picker-item">
                      <input type="checkbox" class="card-collection-checkbox" data-col-id="${col.id}" data-note-id="${note.id}" ${inCol ? 'checked' : ''} style="cursor: pointer;">
                      <span>${col.icon || '📚'} ${this.escapeHtml(col.name)}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
            <div class="tooltip-container" data-tooltip="Duplicate note">
              <button class="icon-btn" data-action="duplicate" aria-label="Duplicate note">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
                </svg>
              </button>
            </div>
            <div class="tooltip-container" data-tooltip="Archive">
              <button class="icon-btn" data-action="archive" aria-label="Archive">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.83 1H5.41l.83-1zM5 19V7h14v12H5zm6-2h2v-4h2.5L12 9.5 8.5 13H11v4z"></path>
                </svg>
              </button>
            </div>
            <div class="tooltip-container" data-tooltip="Delete">
              <button class="icon-btn" data-action="bin" aria-label="Delete">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M15 4V3H9v1H4v2h16V4h-5zm1 4H8v12h8V8zM6 7v13c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6z"></path>
                </svg>
              </button>
            </div>
          ` : `
            <div class="tooltip-container" data-tooltip="Restore">
              <button class="icon-btn" data-action="bin" aria-label="Restore">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M14 14v-4h-4v4H7l5 5 5-5h-3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                </svg>
              </button>
            </div>
            <div class="tooltip-container" data-tooltip="Delete forever">
              <button class="icon-btn" data-action="delete-forever" aria-label="Delete forever">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                </svg>
              </button>
            </div>
          `}
        </div>
      </div>
    `;
  }

  attachCardEventListeners() {
    const cards = document.querySelectorAll('.note-card');
    cards.forEach(card => {
      const id = card.getAttribute('data-id');
      const note = this.notes.find(n => n.id === id);

      // Open Edit Note Modal on Card Click
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]') || 
            e.target.closest('[data-run-code]') ||
            e.target.closest('[data-copy-code]') ||
            e.target.closest('[data-download-code]') ||
            e.target.closest('[data-copy-output]') ||
            e.target.closest('[data-clear-output]') ||
            e.target.closest('[data-stdin-note]') ||
            e.target.closest('.chip-remove-btn') || 
            e.target.closest('.card-checklist-checkbox') ||
            e.target.closest('.card-color-picker-menu') ||
            e.target.closest('.card-collection-picker-menu')) return;

        if (note && this.currentView !== 'bin') {
          this.openEditNoteModal(note);
        }
      });

      // Card Collection Picker Event Listeners
      const colBtn = card.querySelector('.card-collection-btn');
      const colMenu = card.querySelector(`[data-card-collection-menu="${id}"]`);
      if (colBtn && colMenu) {
        colBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.card-collection-picker-menu.show').forEach(m => {
            if (m !== colMenu) m.classList.remove('show');
          });
          colMenu.classList.toggle('show');
        });

        colMenu.querySelectorAll('.card-collection-checkbox').forEach(chk => {
          chk.addEventListener('change', (e) => {
            e.stopPropagation();
            const colId = chk.getAttribute('data-col-id');
            const noteId = chk.getAttribute('data-note-id');
            const col = this.collections.find(c => c.id === colId);
            if (col) {
              if (!col.noteIds) col.noteIds = [];
              if (chk.checked) {
                if (!col.noteIds.includes(noteId)) col.noteIds.push(noteId);
                this.showToast(`Added to "${col.name}"`);
              } else {
                col.noteIds = col.noteIds.filter(i => i !== noteId);
                this.showToast(`Removed from "${col.name}"`);
              }
              col.updatedAt = new Date().toISOString();
              this.saveCollectionsToStorage();
              this.renderSidebarCollections();
              if (this.currentView === 'collection_' + colId) {
                this.render();
              }
            }
          });
        });
      }

      // STDIN Input Handler
      card.querySelectorAll('[data-stdin-note]').forEach(inp => {
        inp.addEventListener('input', (e) => {
          e.stopPropagation();
          const targetNote = this.notes.find(n => n.id === id);
          if (targetNote) {
            targetNote.stdin = e.target.value;
            this.saveToStorage();
          }
        });
        inp.addEventListener('click', (e) => e.stopPropagation());
      });

      // Code Execution Handler
      card.querySelectorAll('[data-run-code]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const targetNote = this.notes.find(n => n.id === id);
          if (!targetNote || !window.codeCompiler) return;

          btn.disabled = true;
          btn.innerHTML = '<span class="compiling-spinner"></span> Compiling...';

          try {
            const res = await window.codeCompiler.execute(targetNote.codeLanguage, targetNote.code, targetNote.stdin || '');
            targetNote.lastOutput = res.output;
            targetNote.lastOutputIsError = Boolean(res.isError);
            targetNote.lastOutputIsHtml = Boolean(res.isHtml);
            targetNote.executionTime = res.executionTime || null;
            this.logActivity(1);
            this.saveToStorage();
            this.render();
          } catch (err) {
            targetNote.lastOutput = 'Execution failed: ' + err.message;
            targetNote.lastOutputIsError = true;
            this.saveToStorage();
            this.render();
          }
        });
      });

      // Copy Code Handler
      card.querySelectorAll('[data-copy-code]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.copyCodeToClipboard(id);
        });
      });

      // Share Code Link Handler
      card.querySelectorAll('[data-share-code]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.generateShareableLink(id);
        });
      });

      // Download Code File Handler
      card.querySelectorAll('[data-download-code]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.downloadCodeFile(id);
        });
      });

      // Copy Output Handler
      card.querySelectorAll('[data-copy-output]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.copyOutputToClipboard(id);
        });
      });

      // Clear Output Handler
      card.querySelectorAll('[data-clear-output]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetNote = this.notes.find(n => n.id === id);
          if (targetNote) {
            targetNote.lastOutput = null;
            targetNote.lastOutputIsError = false;
            targetNote.lastOutputIsHtml = false;
            targetNote.executionTime = null;
            this.saveToStorage();
            this.render();
          }
        });
      });

      // HTML5 Drag and Drop Handlers
      card.addEventListener('dragstart', (e) => {
        this.draggedNoteId = id;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('drag-remove');
        card.classList.remove('dragging');
        document.querySelectorAll('.note-card.drag-over').forEach(c => c.classList.remove('drag-over'));
        this.draggedNoteId = null;
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (this.draggedNoteId && this.draggedNoteId !== id) {
          card.classList.add('drag-over');
        }
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        if (this.draggedNoteId && this.draggedNoteId !== id) {
          this.reorderNotes(this.draggedNoteId, id);
        }
      });

      // Card-level Action Buttons
      card.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.getAttribute('data-action');
          if (action === 'star') this.toggleStar(id);
          if (action === 'pin') this.togglePin(id);
          if (action === 'duplicate') this.duplicateNote(id);
          if (action === 'archive') this.archiveNote(id);
          if (action === 'bin') this.binNote(id);
          if (action === 'delete-forever') this.deleteForever(id);
          if (action === 'color') {
            const menu = card.querySelector('.card-color-picker-menu');
            if (menu) menu.classList.toggle('active');
          }
        });
      });

      // Card Color Picker Circles
      card.querySelectorAll('[data-change-color]').forEach(circle => {
        circle.addEventListener('click', (e) => {
          e.stopPropagation();
          const newColor = circle.getAttribute('data-change-color');
          this.changeNoteColor(id, newColor);
        });
      });

      // Card Interactive Checklist Checkboxes
      card.querySelectorAll('.card-checklist-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          e.stopPropagation();
          const noteId = cb.getAttribute('data-note-id');
          const itemIdx = cb.getAttribute('data-item-idx');
          const targetNote = this.notes.find(n => n.id === noteId);

          if (targetNote && targetNote.checklistItems && targetNote.checklistItems[itemIdx]) {
            targetNote.checklistItems[itemIdx].completed = cb.checked;
            this.saveToStorage();
            this.render();
          }
        });
      });

      // Chip Remove Handlers
      card.querySelectorAll('[data-remove-card-reminder]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (note) {
            note.reminder = null;
            this.saveToStorage();
            this.render();
          }
        });
      });

      card.querySelectorAll('[data-remove-card-label]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const lIdx = btn.getAttribute('data-label-index');
          if (note && note.labels) {
            note.labels.splice(lIdx, 1);
            this.saveToStorage();
            this.render();
          }
        });
      });
    });
  }

  initCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    const input = document.getElementById('command-palette-input');
    const resultsContainer = document.getElementById('command-palette-results');
    if (!modal || !input || !resultsContainer) return;

    this.paletteSelectedIndex = 0;
    this.paletteFilteredItems = [];

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeCommandPalette();
      }
    });

    input.addEventListener('input', () => {
      this.paletteSelectedIndex = 0;
      this.renderCommandPaletteResults(input.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.paletteFilteredItems.length > 0) {
          this.paletteSelectedIndex = (this.paletteSelectedIndex + 1) % this.paletteFilteredItems.length;
          this.updatePaletteSelection();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.paletteFilteredItems.length > 0) {
          this.paletteSelectedIndex = (this.paletteSelectedIndex - 1 + this.paletteFilteredItems.length) % this.paletteFilteredItems.length;
          this.updatePaletteSelection();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.paletteFilteredItems.length > 0 && this.paletteFilteredItems[this.paletteSelectedIndex]) {
          this.executePaletteAction(this.paletteFilteredItems[this.paletteSelectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeCommandPalette();
      }
    });
  }

  openCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    const input = document.getElementById('command-palette-input');
    if (!modal || !input) return;

    input.value = '';
    this.paletteSelectedIndex = 0;
    modal.classList.add('active');
    setTimeout(() => input.focus(), 50);
    this.renderCommandPaletteResults('');
  }

  closeCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (modal) modal.classList.remove('active');
  }

  renderCommandPaletteResults(query = '') {
    const resultsContainer = document.getElementById('command-palette-results');
    if (!resultsContainer) return;

    const q = (query || '').toLowerCase().trim();

    const defaultActions = [
      { id: 'act_new_code', type: 'action', title: 'Create New Code Note', hint: 'Action', icon: '<path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>' },
      { id: 'act_new_checklist', type: 'action', title: 'Create Checklist Note', hint: 'Action', icon: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>' },
      { id: 'act_toggle_theme', type: 'action', title: 'Toggle Light / Dark Theme', hint: 'Action', icon: '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>' },
      { id: 'act_export_json', type: 'action', title: 'Export All Notes to JSON', hint: 'Action', icon: '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>' },
      { id: 'act_open_settings', type: 'action', title: 'Open Settings Modal', hint: 'Action', icon: '<path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>' }
    ];

    const labelActions = this.labels.map(l => ({
      id: `nav_label_${l}`,
      type: 'label',
      title: `Jump to #${l}`,
      labelName: l,
      hint: 'Label',
      icon: '<path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L21 12l-3.37-6.16z"/>'
    }));

    const collectionActions = (this.collections || []).map(c => ({
      id: `nav_col_${c.id}`,
      type: 'collection',
      colId: c.id,
      title: `Collection: ${c.name}`,
      hint: 'Playlist',
      icon: '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>'
    }));

    const templateActions = [...(this.presetTemplates || []), ...(this.customTemplates || [])].map(t => ({
      id: `tmpl_${t.id}`,
      type: 'template',
      tmplId: t.id,
      title: `Insert Boilerplate: ${t.name}`,
      hint: `Boilerplate (${t.language.toUpperCase()})`,
      icon: '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>'
    }));

    const noteItems = this.notes
      .filter(n => !n.isBinned)
      .map(n => ({
        id: `note_${n.id}`,
        type: 'note',
        noteId: n.id,
        title: n.title || (n.code ? `${n.codeLanguage.toUpperCase()} Code Snippet` : 'Untitled Note'),
        hint: n.isCode ? 'Code Note' : (n.isChecklist ? 'Checklist' : 'Text Note'),
        icon: n.isCode ? '<path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>' : '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>'
      }));

    let allItems = [...defaultActions, ...labelActions, ...collectionActions, ...templateActions, ...noteItems];

    if (q) {
      allItems = allItems.filter(item => item.title.toLowerCase().includes(q));
    }

    this.paletteFilteredItems = allItems;

    if (allItems.length === 0) {
      resultsContainer.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-secondary);">No matching commands or notes found</div>`;
      return;
    }

    resultsContainer.innerHTML = allItems.map((item, idx) => `
      <div class="command-palette-item ${idx === this.paletteSelectedIndex ? 'selected' : ''}" data-palette-idx="${idx}">
        <div class="command-palette-item-left">
          <svg viewBox="0 0 24 24" class="command-palette-item-icon">${item.icon}</svg>
          <span>${this.escapeHtml(item.title)}</span>
        </div>
        <span class="command-palette-item-hint">${this.escapeHtml(item.hint)}</span>
      </div>
    `).join('');

    resultsContainer.querySelectorAll('[data-palette-idx]').forEach(elem => {
      elem.addEventListener('click', () => {
        const idx = parseInt(elem.getAttribute('data-palette-idx'), 10);
        if (this.paletteFilteredItems[idx]) {
          this.executePaletteAction(this.paletteFilteredItems[idx]);
        }
      });
    });
  }

  updatePaletteSelection() {
    const items = document.querySelectorAll('#command-palette-results .command-palette-item');
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === this.paletteSelectedIndex);
      if (idx === this.paletteSelectedIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  executePaletteAction(item) {
    this.closeCommandPalette();
    if (!item) return;

    if (item.type === 'action') {
      if (item.id === 'act_new_code') {
        const creator = document.getElementById('note-creator');
        if (creator) creator.classList.add('expanded');
        this.enableCodeMode(true);
      } else if (item.id === 'act_new_checklist') {
        const creator = document.getElementById('note-creator');
        if (creator) creator.classList.add('expanded');
        this.enableChecklistMode(true);
      } else if (item.id === 'act_toggle_theme') {
        if (window.keepNav) window.keepNav.toggleDarkTheme();
      } else if (item.id === 'act_export_json') {
        this.exportNotesJson();
      } else if (item.id === 'act_open_settings') {
        this.openSettingsModal();
      }
    } else if (item.type === 'label') {
      this.setView(`label_${item.labelName}`);
    } else if (item.type === 'collection') {
      this.setView(`collection_${item.colId}`);
    } else if (item.type === 'template') {
      const creator = document.getElementById('note-creator');
      if (creator) creator.classList.add('expanded');
      this.enableCodeMode(true);
      this.applyTemplate(item.tmplId, 'creator');
    } else if (item.type === 'note') {
      const targetNote = this.notes.find(n => n.id === item.noteId);
      if (targetNote) {
        this.openEditNoteModal(targetNote);
      }
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.notesManager = new NotesManager();
document.addEventListener('DOMContentLoaded', () => {
  window.notesManager.init();
});
