/**
 * Google Keep Clone - Navigation & Header Global Component Logic
 */

class KeepNavigationComponent {
  constructor() {
    this.sidebar = null;
    this.menuToggleBtn = null;
    this.isCollapsed = false;
    this.isListView = false;
    this.isDarkTheme = false;
  }

  /**
   * Initializes event listeners for sidebar drawer, search bar, and header quick actions.
   */
  init() {
    this.sidebar = document.getElementById('keep-sidebar') || document.getElementById('sidebar-mount');
    this.menuToggleBtn = document.getElementById('menu-toggle-btn');

    // Sidebar Toggle
    if (this.menuToggleBtn) {
      this.menuToggleBtn.addEventListener('click', () => this.toggleSidebar());
    }

    // Initialize Sub-Systems
    this.initNavLinks();
    this.initSearchBar();
    this.initHeaderActions();
    this.restoreSavedTheme();
  }

  /**
   * Toggles sidebar drawer state between expanded and collapsed.
   */
  toggleSidebar() {
    const sidebarElem = document.getElementById('keep-sidebar') || document.getElementById('sidebar-mount');
    const mountElem = document.getElementById('sidebar-mount');

    this.isCollapsed = !this.isCollapsed;

    if (sidebarElem) sidebarElem.classList.toggle('collapsed', this.isCollapsed);
    if (mountElem) mountElem.classList.toggle('collapsed', this.isCollapsed);
  }

  /**
   * Sets up click handlers for sidebar nav selection.
   */
  initNavLinks() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        const section = item.getAttribute('data-nav');
        this.onSectionChange(section);
      });
    });
  }

  /**
   * Event handler when user switches navigation tab.
   * @param {string} section - Selected nav item identifier.
   */
  onSectionChange(section) {
    const titleElem = document.getElementById('active-section-title');
    if (titleElem) {
      const formattedTitle = section.charAt(0).toUpperCase() + section.slice(1);
      titleElem.textContent = formattedTitle === 'Labels' ? 'Edit Labels' : formattedTitle;
    }

    if (window.notesManager) {
      window.notesManager.setView(section);
    }
  }

  /**
   * Search Bar: Manages input typing, clear button visibility, and clear action.
   */
  initSearchBar() {
    const searchInput = document.getElementById('search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const searchFilterBtn = document.getElementById('search-filter-btn');

    if (!searchInput || !searchClearBtn) return;

    searchInput.addEventListener('input', () => {
      if (searchInput.value.trim().length > 0) {
        searchClearBtn.classList.add('visible');
      } else {
        searchClearBtn.classList.remove('visible');
      }
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.classList.remove('visible');
      searchInput.focus();

      if (window.notesManager) {
        window.notesManager.searchQuery = '';
        window.notesManager.render();
      }
    });

    if (searchFilterBtn) {
      searchFilterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const popover = document.getElementById('search-filter-popover');
        if (popover) {
          popover.classList.toggle('active');
        }
      });
    }
  }

  /**
   * Header Quick Actions: Refresh, Grid/List Toggle, Dark Theme Toggle, Settings.
   */
  initHeaderActions() {
    // 1. Refresh Button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('spinning');
        setTimeout(() => refreshBtn.classList.remove('spinning'), 600);
        if (window.notesManager) window.notesManager.render();
      });
    }

    // 2. Grid ↔ List View Toggle Button
    const viewToggleBtn = document.getElementById('view-toggle-btn');
    const viewToggleContainer = document.getElementById('view-toggle-container');
    const viewIconList = document.getElementById('view-icon-list');
    const viewIconGrid = document.getElementById('view-icon-grid');
    const contentArea = document.querySelector('.content-area');

    if (viewToggleBtn) {
      viewToggleBtn.addEventListener('click', () => {
        this.isListView = !this.isListView;
        
        if (this.isListView) {
          viewIconList.style.display = 'none';
          viewIconGrid.style.display = 'block';
          if (viewToggleContainer) viewToggleContainer.setAttribute('data-tooltip', 'Grid view');
          if (contentArea) contentArea.classList.add('list-view');
        } else {
          viewIconList.style.display = 'block';
          viewIconGrid.style.display = 'none';
          if (viewToggleContainer) viewToggleContainer.setAttribute('data-tooltip', 'List view');
          if (contentArea) contentArea.classList.remove('list-view');
        }
      });
    }

    // 3. Dark Theme Toggle Button
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        this.toggleDarkTheme();
      });
    }

    // 4. Settings Gear Button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        if (window.notesManager) {
          window.notesManager.openSettingsModal();
        }
      });
    }
  }

  /**
   * Toggles Dark Theme & saves preference in localStorage.
   */
  toggleDarkTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyTheme(this.isDarkTheme);
    localStorage.setItem('keep-theme', this.isDarkTheme ? 'dark' : 'light');
  }

  /**
   * Applies dark or light theme styling & updates icons + tooltips.
   * @param {boolean} isDark
   */
  applyTheme(isDark) {
    this.isDarkTheme = isDark;
    document.body.classList.toggle('dark-theme', isDark);

    const themeToggleContainer = document.getElementById('theme-toggle-container');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const settingsThemeCheckbox = document.getElementById('settings-theme-checkbox');

    if (settingsThemeCheckbox) {
      settingsThemeCheckbox.checked = isDark;
    }

    if (themeIconMoon && themeIconSun) {
      if (isDark) {
        themeIconMoon.style.display = 'none';
        themeIconSun.style.display = 'block';
        if (themeToggleContainer) themeToggleContainer.setAttribute('data-tooltip', 'Light theme');
      } else {
        themeIconMoon.style.display = 'block';
        themeIconSun.style.display = 'none';
        if (themeToggleContainer) themeToggleContainer.setAttribute('data-tooltip', 'Dark theme');
      }
    }
  }

  /**
   * Restores user theme preference from localStorage on page load.
   */
  restoreSavedTheme() {
    const savedTheme = localStorage.getItem('keep-theme');
    if (savedTheme === 'dark') {
      this.applyTheme(true);
    }
  }

  /**
   * Component Loader: Dynamically fetches and inserts header & sidebar HTML snippets.
   */
  static async loadComponents() {
    const headerContainer = document.getElementById('header-mount');
    const sidebarContainer = document.getElementById('sidebar-mount');

    try {
      if (headerContainer) {
        const headerRes = await fetch('html/header.html');
        if (headerRes.ok) {
          headerContainer.innerHTML = await headerRes.text();
        }
      }

      if (sidebarContainer) {
        const sidebarRes = await fetch('html/sidebar.html');
        if (sidebarRes.ok) {
          sidebarContainer.innerHTML = await sidebarRes.text();
        }
      }
    } catch (err) {
      console.log('Component dynamic fetch skipped or running offline, using DOM fallback.', err);
    }

    const keepNav = new KeepNavigationComponent();
    keepNav.init();
    return keepNav;
  }
}

// Auto initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  KeepNavigationComponent.loadComponents();
});
