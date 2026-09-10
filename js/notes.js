/**
 * Google Keep Clone - Notes Management, Editing, Color Picking, Drag-Drop & Checklists
 */

class NotesManager {
  constructor() {
    this.notes = this.loadFromStorage();
    this.labels = this.loadLabelsFromStorage();
    
    // Layout & Filter State
    this.isListView = localStorage.getItem('keep-list-view') === 'true';
    this.selectedLanguageFilter = 'all';
    this.selectedTypeFilter = 'all';
    this.defaultCodeLanguage = localStorage.getItem('keep-default-lang') || 'javascript';

    // Note Creator State
    this.selectedColor = 'default';
    this.isPinned = false;
    this.selectedLabels = [];
    this.selectedReminder = null;

    this.currentView = 'notes'; // 'notes', 'reminders', 'archive', 'bin', or 'label_<name>'
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

    // Canvas State
    this.drawingColor = '#202124';
    this.isDrawing = false;

    // Command Palette State
    this.paletteSelectedIndex = 0;
    this.paletteFilteredItems = [];
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('keep-notes');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load notes:', e);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('keep-notes', JSON.stringify(this.notes));
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  }

  loadLabelsFromStorage() {
    try {
      const data = localStorage.getItem('keep-labels');
      return data ? JSON.parse(data) : ['Personal', 'Work', 'Ideas'];
    } catch (e) {
      return ['Personal', 'Work', 'Ideas'];
    }
  }

  saveLabelsToStorage() {
    try {
      localStorage.setItem('keep-labels', JSON.stringify(this.labels));
    } catch (e) {
      console.error('Failed to save labels:', e);
    }
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

    this.renderSidebarLabels();
    this.applyListViewState();
    this.render();
    this.checkUrlHashForSharedNote();
  }

  initSearchFilterPopover() {
    // 1. Toggle Filter Popover & Clear Action via Event Delegation
    document.addEventListener('click', (e) => {
      const filterBtn = e.target.closest('#search-filter-btn');
      if (filterBtn) {
        e.stopPropagation();
        const filterPopover = document.getElementById('search-filter-popover');
        if (filterPopover) {
          filterPopover.classList.toggle('active');
        }
        return;
      }

      const clearBtn = e.target.closest('#clear-filters-btn');
      if (clearBtn) {
        e.stopPropagation();
        this.selectedLanguageFilter = 'all';
        this.selectedTypeFilter = 'all';
        const langSelect = document.getElementById('filter-language-select');
        const typeSelect = document.getElementById('filter-type-select');
        if (langSelect) langSelect.value = 'all';
        if (typeSelect) typeSelect.value = 'all';
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

    // 2. Filter Dropdowns Change Delegation
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
    });
  }

  updateFilterButtonBadge() {
    const filterBtn = document.getElementById('search-filter-btn');
    if (filterBtn) {
      const hasFilter = this.selectedLanguageFilter !== 'all' || this.selectedTypeFilter !== 'all';
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

  /**
   * Edit Note Modal Handlers
   */
  initEditNoteModal() {
    const modal = document.getElementById('edit-note-modal');
    const saveBtn = document.getElementById('save-edit-note-btn');
    const pinBtn = document.getElementById('edit-note-pin-btn');
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

    if (!modal || !titleInput || !bodyInput) return;

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
          note.codeLanguage = editLanguageSelect ? editLanguageSelect.value : 'javascript';
          note.code = editCodeInput ? editCodeInput.value.trim() : '';
          note.stdin = editStdinInput ? editStdinInput.value : '';
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
    const languageSelect = document.getElementById('creator-language-select');

    const title = titleInput ? titleInput.value.trim() : '';
    const body = bodyInput ? bodyInput.value.trim() : '';
    const code = codeInput ? codeInput.value.trim() : '';
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
    this.saveToStorage();
    this.render();
  }

  resetCreatorForm() {
    const creator = document.getElementById('note-creator');
    const titleInput = document.getElementById('note-title-input');
    const bodyInput = document.getElementById('note-body-input');
    const codeInput = document.getElementById('creator-code-input');
    const languageSelect = document.getElementById('creator-language-select');
    const creatorPinBtn = document.getElementById('creator-pin-btn');
    
    const colorMenu = document.getElementById('color-picker-menu');
    const reminderPopover = document.getElementById('reminder-popover');
    const labelPopover = document.getElementById('label-popover');

    if (titleInput) titleInput.value = '';
    if (bodyInput) bodyInput.value = '';
    if (codeInput) codeInput.value = '';
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

    let filtered = this.notes.filter(n => {
      if (this.currentView === 'archive') return n.isArchived && !n.isBinned;
      if (this.currentView === 'bin') return n.isBinned;
      if (this.currentView === 'reminders') return !n.isArchived && !n.isBinned && n.reminder;
      if (this.currentView.startsWith('label_')) {
        const targetLabel = this.currentView.replace('label_', '');
        return !n.isArchived && !n.isBinned && n.labels && n.labels.includes(targetLabel);
      }
      return !n.isArchived && !n.isBinned;
    });

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

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        (n.title && n.title.toLowerCase().includes(q)) || 
        (n.body && n.body.toLowerCase().includes(q)) ||
        (n.code && n.code.toLowerCase().includes(q)) ||
        (n.codeLanguage && n.codeLanguage.toLowerCase().includes(q)) ||
        (n.labels && n.labels.some(l => l.toLowerCase().includes(q))) ||
        (n.checklistItems && n.checklistItems.some(i => i.text.toLowerCase().includes(q)))
      );
    }

    const creatorWrapper = document.getElementById('note-creator-wrapper');
    if (creatorWrapper) {
      creatorWrapper.style.display = (this.currentView === 'archive' || this.currentView === 'bin') ? 'none' : 'flex';
    }

    if (filtered.length === 0) {
      mainContainer.innerHTML = `
        <div class="empty-notes-msg">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8V9zm0 3h8v2h-8v-2zm0-6h8v2h-8V6z"></path>
          </svg>
          <p>${this.getEmptyMessage()}</p>
        </div>
      `;
      return;
    }

    const pinnedNotes = filtered.filter(n => n.isPinned);
    const otherNotes = filtered.filter(n => !n.isPinned);

    let html = '';

    if (pinnedNotes.length > 0 && this.currentView === 'notes') {
      html += `
        <div class="notes-section">
          <div class="section-heading">PINNED</div>
          <div class="notes-grid">
            ${pinnedNotes.map(n => this.renderCardHtml(n)).join('')}
          </div>
        </div>
      `;
    }

    if (otherNotes.length > 0 || pinnedNotes.length > 0) {
      html += `
        <div class="notes-section">
          ${(pinnedNotes.length > 0 && this.currentView === 'notes') ? '<div class="section-heading">OTHERS</div>' : ''}
          <div class="notes-grid">
            ${(pinnedNotes.length > 0 && this.currentView === 'notes' ? otherNotes : filtered).map(n => this.renderCardHtml(n)).join('')}
          </div>
        </div>
      `;
    }

    mainContainer.innerHTML = html;
    this.attachCardEventListeners();
  }

  getEmptyMessage() {
    if (this.searchQuery) return `No notes match "${this.searchQuery}"`;
    if (this.currentView === 'archive') return 'No archived notes';
    if (this.currentView === 'bin') return 'No notes in Bin';
    if (this.currentView === 'reminders') return 'Notes with upcoming reminders will appear here';
    if (this.currentView.startsWith('label_')) return `No notes with label "${this.currentView.replace('label_', '')}"`;
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
            <div class="tooltip-container" data-tooltip="${note.isPinned ? 'Unpin note' : 'Pin note'}">
              <button class="icon-btn pin-btn ${note.isPinned ? 'pinned' : ''}" data-action="pin" aria-label="Pin note">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M17 4v7l2 3v2h-6v5l-1 1-1-1v-5H5v-2l2-3V4c0-.55.45-1 1-1h8c.55 0 1 .45 1 1z"></path>
                </svg>
              </button>
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
            e.target.closest('.card-color-picker-menu')) return;

        if (note && this.currentView !== 'bin') {
          this.openEditNoteModal(note);
        }
      });

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

    let allItems = [...defaultActions, ...labelActions, ...noteItems];

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
