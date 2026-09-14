/**
 * Code Bookshelf - Google OAuth & User Authentication Engine
 * Manages Google Identity Services (GSI), JWT token decoding, user sessions,
 * and user-scoped storage synchronization.
 */

class GoogleAuthEngine {
  constructor() {
    this.STORAGE_KEY_USER = 'code_bookshelf_user';
    this.STORAGE_KEY_CLIENT_ID = 'code_bookshelf_google_client_id';

    // Default or stored Google Client ID
    this.clientId = localStorage.getItem(this.STORAGE_KEY_CLIENT_ID) || '';
    this.currentUser = this.loadStoredUser();

    // DOM Elements
    this.profileContainer = null;
    this.profilePopover = null;

    this.init();
  }

  /**
   * Load stored user session from localStorage if present
   */
  loadStoredUser() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.warn('Failed to parse stored user session:', err);
      return null;
    }
  }

  /**
   * Initialize Google Auth and setup UI elements
   */
  init() {
    const start = () => {
      this.setupUI();
      this.initGoogleIdentity();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  }

  /**
   * Set or update Google OAuth Client ID
   */
  setClientId(newClientId) {
    this.clientId = newClientId.trim();
    if (this.clientId) {
      localStorage.setItem(this.STORAGE_KEY_CLIENT_ID, this.clientId);
    } else {
      localStorage.removeItem(this.STORAGE_KEY_CLIENT_ID);
    }
    this.initGoogleIdentity();
    this.renderUI();
  }

  /**
   * Initialize Google Identity Services SDK
   */
  initGoogleIdentity() {
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
      // Retry if GSI script is still loading
      setTimeout(() => this.initGoogleIdentity(), 500);
      return;
    }

    if (!this.clientId) {
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response) => this.handleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });
    } catch (err) {
      console.error('Error initializing Google Identity Services:', err);
    }
  }

  /**
   * Handle credential response from Google OAuth popup / button
   */
  handleCredentialResponse(response) {
    if (!response || !response.credential) {
      console.error('Invalid credential response from Google');
      return;
    }

    const payload = this.decodeJwtToken(response.credential);
    if (!payload) {
      alert('Failed to process Google sign-in credentials.');
      return;
    }

    const user = {
      id: payload.sub,
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      picture: payload.picture || '',
      authProvider: 'google',
      loginTime: new Date().toISOString()
    };

    this.setUserSession(user);
  }

  /**
   * Safely decode JWT ID Token payload
   */
  decodeJwtToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Failed to decode JWT token:', err);
      return null;
    }
  }

  /**
   * Save user session and trigger auth change event
   */
  setUserSession(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(this.STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.STORAGE_KEY_USER);
    }

    this.renderUI();

    // Dispatch global event for notes.js and app.js to sync state
    window.dispatchEvent(
      new CustomEvent('auth:change', {
        detail: { user: this.currentUser }
      })
    );
  }

  /**
   * Setup Auth UI container in the header
   */
  setupUI() {
    let authContainer = document.getElementById('auth-container');
    if (!authContainer) {
      const headerRight = document.querySelector('.header-right');
      if (!headerRight) return;

      authContainer = document.createElement('div');
      authContainer.id = 'auth-container';
      authContainer.className = 'auth-container';
      headerRight.appendChild(authContainer);
    }

    this.profileContainer = authContainer;
    this.renderUI();
  }

  /**
   * Render User Avatar / Sign-In button state
   */
  renderUI() {
    if (!this.profileContainer) return;

    if (this.currentUser) {
      // Logged In State
      const initial = (this.currentUser.name || 'U').charAt(0).toUpperCase();
      const avatarHtml = this.currentUser.picture
        ? `<img src="${this.currentUser.picture}" alt="${this.currentUser.name}" class="user-avatar-img" />`
        : `<div class="user-avatar-initial">${initial}</div>`;

      this.profileContainer.innerHTML = `
        <div class="tooltip-container" data-tooltip="${this.currentUser.name} (${this.currentUser.email})">
          <button class="user-profile-btn" id="user-profile-btn" aria-label="User profile">
            ${avatarHtml}
          </button>
        </div>
        
        <!-- User Profile Dropdown Menu -->
        <div class="popover-menu user-profile-popover" id="user-profile-popover" style="display: none;">
          <div class="profile-popover-header">
            ${avatarHtml}
            <div class="profile-info">
              <div class="profile-name">${this.currentUser.name}</div>
              <div class="profile-email">${this.currentUser.email}</div>
              <span class="auth-provider-badge">Google Verified</span>
            </div>
          </div>
          <hr class="popover-divider" />
          <button class="popover-item" id="config-client-id-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v2h2v-2h2v-4H12.65zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
            </svg>
            Google Client ID Settings
          </button>
          <button class="popover-item popover-item-danger" id="logout-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Sign Out
          </button>
        </div>
      `;

      this.attachLoggedInEvents();
    } else {
      // Logged Out State
      this.profileContainer.innerHTML = `
        <div class="auth-btn-wrapper">
          <div id="g_id_signin_button"></div>
          <button class="btn-google-signin" id="custom-google-btn">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign in</span>
          </button>
        </div>

        <div class="popover-menu user-profile-popover" id="client-id-modal" style="display: none; width: 280px; padding: 16px;">
          <div class="popover-title" style="margin-bottom: 8px;">Google OAuth Settings</div>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
            Enter your Google OAuth Client ID created from Google Cloud Console.
          </p>
          <input type="text" id="input-client-id" class="search-input" placeholder="xxxxxxxx.apps.googleusercontent.com" value="${this.clientId}" style="width: 100%; margin-bottom: 12px; font-size: 12px;" />
          <div style="display: flex; gap: 8px;">
            <button class="creator-btn-close" id="save-client-id-btn" style="flex: 1; text-align: center; justify-content: center; background-color: var(--primary-color); color: #fff;">Save ID</button>
            <button class="creator-btn-close" id="close-client-id-btn" style="flex: 1; text-align: center; justify-content: center; background-color: var(--hover-bg); color: var(--text-primary);">Cancel</button>
          </div>
        </div>
      `;

      this.attachLoggedOutEvents();
    }
  }

  /**
   * Attach event handlers for Logged In popover
   */
  attachLoggedInEvents() {
    const profileBtn = document.getElementById('user-profile-btn');
    const popover = document.getElementById('user-profile-popover');
    const logoutBtn = document.getElementById('logout-btn');
    const configBtn = document.getElementById('config-client-id-btn');

    if (profileBtn && popover) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = popover.style.display === 'block';
        popover.style.display = isOpen ? 'none' : 'block';
      });

      document.addEventListener('click', (e) => {
        if (!popover.contains(e.target) && e.target !== profileBtn) {
          popover.style.display = 'none';
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }

    if (configBtn) {
      configBtn.addEventListener('click', () => {
        this.promptClientIdInput();
      });
    }
  }

  /**
   * Attach event handlers for Logged Out button
   */
  attachLoggedOutEvents() {
    const customBtn = document.getElementById('custom-google-btn');
    const modal = document.getElementById('client-id-modal');
    const saveBtn = document.getElementById('save-client-id-btn');
    const closeBtn = document.getElementById('close-client-id-btn');
    const inputClientId = document.getElementById('input-client-id');

    // Try rendering Google GSI button if Client ID exists
    if (this.clientId && typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      try {
        const btnContainer = document.getElementById('g_id_signin_button');
        if (btnContainer) {
          google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'medium',
            shape: 'pill',
            text: 'signin_with'
          });
          if (customBtn) customBtn.style.display = 'none';
        }
      } catch (err) {
        console.warn('Failed to render GSI button:', err);
      }
    }

    if (customBtn) {
      customBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this.clientId) {
          this.promptClientIdInput();
        } else if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
          google.accounts.id.prompt();
        } else {
          this.promptClientIdInput();
        }
      });
    }

    if (saveBtn && inputClientId) {
      saveBtn.addEventListener('click', () => {
        const val = inputClientId.value.trim();
        this.setClientId(val);
        if (modal) modal.style.display = 'none';
        if (val) {
          alert('Google Client ID saved successfully! Click "Sign in" to log in.');
        }
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
  }

  /**
   * Prompt user to configure Google Client ID
   */
  promptClientIdInput() {
    const modal = document.getElementById('client-id-modal');
    if (modal) {
      modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    } else {
      const newId = prompt(
        'Enter your Google OAuth Client ID (from Google Cloud Console):',
        this.clientId
      );
      if (newId !== null) {
        this.setClientId(newId);
      }
    }
  }

  /**
   * Log out current user
   */
  logout() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      try {
        google.accounts.id.disableAutoSelect();
      } catch (err) {
        console.warn('GSI disableAutoSelect error:', err);
      }
    }
    this.setUserSession(null);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!this.currentUser;
  }

  /**
   * Get active User ID or empty string
   */
  getCurrentUserId() {
    return this.currentUser ? this.currentUser.id : '';
  }

  /**
   * Get current User object
   */
  getUser() {
    return this.currentUser;
  }
}

// Global instance
window.googleAuth = new GoogleAuthEngine();
