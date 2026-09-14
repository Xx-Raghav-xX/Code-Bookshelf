/**
 * Code Bookshelf - PWA Manager & Service Worker Registration
 * Handles PWA installation prompt ("Install App") and Service Worker lifecycle.
 */

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.installBtn = null;
    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
  }

  /**
   * Register Service Worker
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }
  }

  /**
   * Capture beforeinstallprompt and display native Install button
   */
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('[PWA] beforeinstallprompt event captured');

      this.renderInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] Code Bookshelf app installed successfully!');
      this.deferredPrompt = null;
      if (this.installBtn) {
        this.installBtn.style.display = 'none';
      }
    });
  }

  /**
   * Render Install App button in header or sidebar
   */
  renderInstallButton() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight || document.getElementById('pwa-install-btn')) return;

    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'tooltip-container';
    btnWrapper.setAttribute('data-tooltip', 'Install App');

    btnWrapper.innerHTML = `
      <button class="icon-btn" id="pwa-install-btn" aria-label="Install App" style="color: var(--primary-color);">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
      </button>
    `;

    // Insert before auth container or at the start of header-right
    headerRight.insertBefore(btnWrapper, headerRight.firstChild);
    this.installBtn = btnWrapper;

    const btn = document.getElementById('pwa-install-btn');
    if (btn) {
      btn.addEventListener('click', () => this.triggerInstall());
    }
  }

  /**
   * Trigger native browser install prompt dialog
   */
  triggerInstall() {
    if (!this.deferredPrompt) {
      alert('PWA installation is either not supported by this browser or already installed.');
      return;
    }

    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
      this.deferredPrompt = null;
    });
  }
}

// Global PWA Manager instance
window.pwaManager = new PWAManager();
