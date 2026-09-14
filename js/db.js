/**
 * Code Bookshelf - Cloud Database Engine (Firebase Firestore)
 * Handles real-time cross-device synchronization for user notes and labels.
 */

class CloudDatabaseEngine {
  constructor() {
    this.STORAGE_KEY_FIREBASE = 'code_bookshelf_firebase_config';

    this.config = this.loadStoredConfig();
    this.db = null;
    this.activeListenerUnsubscribe = null;
    this.isInitialized = false;

    this.init();
  }

  /**
   * Load Firebase Config from localStorage if saved by user
   */
  loadStoredConfig() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_FIREBASE);
      if (stored) return JSON.parse(stored);
    } catch (err) {
      console.warn('Failed to parse Firebase stored config:', err);
    }

    return {
      apiKey: "AIzaSyBq8_4hTKlXims5qD9SxbE8tMnf1spA2Uc",
      authDomain: "code-bookshelf-b3490.firebaseapp.com",
      projectId: "code-bookshelf-b3490",
      storageBucket: "code-bookshelf-b3490.firebasestorage.app",
      messagingSenderId: "475816016773",
      appId: "1:475816016773:web:ba13abf84b912e1b9162ec",
      measurementId: "G-FHF7TVQ8NG"
    };
  }

  /**
   * Save new Firebase Config and re-initialize
   */
  saveConfig(configObj) {
    if (configObj && configObj.apiKey && configObj.projectId) {
      localStorage.setItem(this.STORAGE_KEY_FIREBASE, JSON.stringify(configObj));
      this.config = configObj;
      this.init();
      return true;
    } else {
      localStorage.removeItem(this.STORAGE_KEY_FIREBASE);
      this.config = null;
      this.db = null;
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Initialize Firebase App & Firestore Database
   */
  init() {
    if (typeof firebase === 'undefined') {
      setTimeout(() => this.init(), 500);
      return;
    }

    if (!this.config || !this.config.apiKey || !this.config.projectId) {
      this.isInitialized = false;
      return;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(this.config);
      }
      this.db = firebase.firestore();
      this.isInitialized = true;
      console.log('Firebase Firestore Engine initialized successfully.');
    } catch (err) {
      console.error('Failed to initialize Firebase Firestore:', err);
      this.isInitialized = false;
    }
  }

  /**
   * Check if Cloud DB is initialized and ready
   */
  isReady() {
    return this.isInitialized && this.db !== null;
  }

  /**
   * Save or update a single note in Firestore
   */
  async saveNote(userId, note) {
    if (!this.isReady() || !userId || !note || !note.id) return;

    try {
      const noteRef = this.db.collection('users').doc(userId).collection('notes').doc(note.id);
      const payload = {
        ...note,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      await noteRef.set(payload, { merge: true });
    } catch (err) {
      console.error(`Error saving note ${note.id} to cloud:`, err);
    }
  }

  /**
   * Delete a note from Firestore
   */
  async deleteNote(userId, noteId) {
    if (!this.isReady() || !userId || !noteId) return;

    try {
      await this.db.collection('users').doc(userId).collection('notes').doc(noteId).delete();
    } catch (err) {
      console.error(`Error deleting note ${noteId} from cloud:`, err);
    }
  }

  /**
   * Save all user notes in batch (e.g. on full list sync)
   */
  async batchSaveNotes(userId, notes) {
    if (!this.isReady() || !userId || !Array.isArray(notes)) return;

    try {
      const batch = this.db.batch();
      const notesRef = this.db.collection('users').doc(userId).collection('notes');

      notes.forEach((note) => {
        if (note && note.id) {
          const docRef = notesRef.doc(note.id);
          batch.set(docRef, {
            ...note,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      });

      await batch.commit();
    } catch (err) {
      console.error('Error batch saving notes to cloud:', err);
    }
  }

  /**
   * Listen for real-time note updates for logged-in user
   */
  listenToUserNotes(userId, onUpdateCallback) {
    // Unsubscribe from any previous listener
    this.stopListening();

    if (!this.isReady() || !userId || typeof onUpdateCallback !== 'function') {
      return;
    }

    try {
      const notesRef = this.db.collection('users').doc(userId).collection('notes');
      
      this.activeListenerUnsubscribe = notesRef.onSnapshot(
        (snapshot) => {
          const cloudNotes = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Convert server timestamp to ISO string if needed
            if (data.updatedAt && data.updatedAt.toDate) {
              data.updatedAt = data.updatedAt.toDate().toISOString();
            }
            cloudNotes.push(data);
          });
          
          onUpdateCallback(cloudNotes);
        },
        (err) => {
          console.error('Firestore real-time snapshot listener error:', err);
        }
      );
    } catch (err) {
      console.error('Failed to attach real-time notes listener:', err);
    }
  }

  /**
   * Stop listening for real-time updates
   */
  stopListening() {
    if (this.activeListenerUnsubscribe) {
      this.activeListenerUnsubscribe();
      this.activeListenerUnsubscribe = null;
    }
  }
}

// Global instance
window.cloudDb = new CloudDatabaseEngine();
