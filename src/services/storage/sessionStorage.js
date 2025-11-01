class SessionStorageService {
  constructor() {
    this.prefix = 'procurement_session_';
    this.encryptionKey = 'procurement_session_key'; // In production, use environment variable
    this.initialized = false;
    this.sessionId = this._generateSessionId();
    
    this.init();
  }

  // Initialize session storage service
  init = () => {
    if (this.initialized) return true;

    try {
      // Test sessionStorage availability
      const testKey = this._getKey('storage_test');
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      this.initialized = true;
      
      // Initialize session tracking
      this._initializeSession();
      
      // Set up storage listener
      this._setupStorageListener();
      
      return true;
    } catch (error) {
      console.error('SessionStorageService - Initialization failed:', error);
      this.initialized = false;
      return false;
    }
  };

  // Get item from sessionStorage
  get = (key, defaultValue = null, options = {}) => {
    if (!this.initialized) {
      console.warn('SessionStorageService not initialized');
      return defaultValue;
    }

    try {
      const storageKey = this._getKey(key);
      let value = sessionStorage.getItem(storageKey);

      if (value === null) {
        return defaultValue;
      }

      // Handle encrypted data
      if (options.encrypted) {
        value = this._decrypt(value);
      }

      // Parse JSON if needed
      if (options.parseJSON !== false) {
        try {
          value = JSON.parse(value);
        } catch (parseError) {
          // If parsing fails, return as string
          console.warn(`SessionStorageService - Failed to parse JSON for key ${key}:`, parseError);
        }
      }

      // Update access tracking
      this._updateAccessTracking(key);

      return value;
    } catch (error) {
      console.error(`SessionStorageService - Get error for key ${key}:`, error);
      return defaultValue;
    }
  };

  // Set item in sessionStorage
  set = (key, value, options = {}) => {
    if (!this.initialized) {
      console.warn('SessionStorageService not initialized');
      return false;
    }

    try {
      const storageKey = this._getKey(key);
      let processedValue = value;

      // Stringify if not string and JSON encoding is enabled
      if (options.stringify !== false && typeof processedValue !== 'string') {
        processedValue = JSON.stringify(processedValue);
      }

      // Encrypt if required
      if (options.encrypted) {
        processedValue = this._encrypt(processedValue);
      }

      sessionStorage.setItem(storageKey, processedValue);
      
      // Update creation/update tracking
      this._updateCreationTracking(key);
      
      // Emit storage event
      this._emitStorageEvent(key, value, 'set');
      
      return true;
    } catch (error) {
      console.error(`SessionStorageService - Set error for key ${key}:`, error);
      return false;
    }
  };

  // Remove item from sessionStorage
  remove = (key) => {
    if (!this.initialized) {
      console.warn('SessionStorageService not initialized');
      return false;
    }

    try {
      const storageKey = this._getKey(key);
      sessionStorage.removeItem(storageKey);

      // Remove tracking data
      this._removeTrackingData(key);

      // Emit storage event
      this._emitStorageEvent(key, null, 'remove');
      
      return true;
    } catch (error) {
      console.error(`SessionStorageService - Remove error for key ${key}:`, error);
      return false;
    }
  };

  // Clear all session items with prefix
  clear = (pattern = null) => {
    if (!this.initialized) {
      console.warn('SessionStorageService not initialized');
      return false;
    }

    try {
      const keysToRemove = [];

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        
        if (key.startsWith(this.prefix)) {
          if (pattern) {
            const regex = new RegExp(pattern);
            if (regex.test(key)) {
              keysToRemove.push(key);
            }
          } else {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
      });

      // Re-initialize session tracking (keep session ID)
      this._initializeSessionTracking();
      
      // Emit storage event
      this._emitStorageEvent('*', null, 'clear');
      
      return true;
    } catch (error) {
      console.error('SessionStorageService - Clear error:', error);
      return false;
    }
  };

  // Clear entire session (including session ID)
  clearSession = () => {
    if (!this.initialized) return false;

    try {
      // Generate new session ID
      this.sessionId = this._generateSessionId();
      
      // Clear all session data
      this.clear();
      
      // Re-initialize session
      this._initializeSession();
      
      console.log('SessionStorageService - Session cleared, new session ID:', this.sessionId);
      return true;
    } catch (error) {
      console.error('SessionStorageService - ClearSession error:', error);
      return false;
    }
  };

  // Check if key exists
  has = (key) => {
    if (!this.initialized) return false;

    try {
      const storageKey = this._getKey(key);
      return sessionStorage.getItem(storageKey) !== null;
    } catch (error) {
      console.error(`SessionStorageService - Has error for key ${key}:`, error);
      return false;
    }
  };

  // Get all keys with prefix
  keys = (pattern = null) => {
    if (!this.initialized) return [];

    try {
      const keys = [];

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        
        if (key.startsWith(this.prefix)) {
          const cleanKey = key.replace(this.prefix, '');
          
          if (pattern) {
            const regex = new RegExp(pattern);
            if (regex.test(cleanKey)) {
              keys.push(cleanKey);
            }
          } else {
            keys.push(cleanKey);
          }
        }
      }

      return keys;
    } catch (error) {
      console.error('SessionStorageService - Keys error:', error);
      return [];
    }
  };

  // Get multiple items at once
  getMultiple = (keys, defaultValue = null) => {
    if (!this.initialized) return {};

    try {
      const result = {};
      
      keys.forEach(key => {
        result[key] = this.get(key, defaultValue);
      });

      return result;
    } catch (error) {
      console.error('SessionStorageService - GetMultiple error:', error);
      return {};
    }
  };

  // Set multiple items at once
  setMultiple = (items, options = {}) => {
    if (!this.initialized) return false;

    try {
      Object.keys(items).forEach(key => {
        this.set(key, items[key], options);
      });

      return true;
    } catch (error) {
      console.error('SessionStorageService - SetMultiple error:', error);
      return false;
    }
  };

  // Remove multiple items at once
  removeMultiple = (keys) => {
    if (!this.initialized) return false;

    try {
      keys.forEach(key => {
        this.remove(key);
      });

      return true;
    } catch (error) {
      console.error('SessionStorageService - RemoveMultiple error:', error);
      return false;
    }
  };

  // Session management methods
  getSessionId = () => {
    return this.sessionId;
  };

  getSessionInfo = () => {
    if (!this.initialized) return null;

    try {
      const sessionStart = this.get('_session_start', null, { parseJSON: true });
      const sessionData = this.get('_session_data', {}, { parseJSON: true });

      return {
        sessionId: this.sessionId,
        sessionStart: sessionStart || Date.now(),
        itemCount: this.keys().length,
        data: sessionData
      };
    } catch (error) {
      console.error('SessionStorageService - GetSessionInfo error:', error);
      return null;
    }
  };

  updateSessionData = (data) => {
    if (!this.initialized) return false;

    try {
      const currentData = this.get('_session_data', {}, { parseJSON: true });
      const updatedData = { ...currentData, ...data };
      
      return this.set('_session_data', updatedData, { stringify: true });
    } catch (error) {
      console.error('SessionStorageService - UpdateSessionData error:', error);
      return false;
    }
  };

  // Tab-specific session management
  getTabId = () => {
    let tabId = this.get('_tab_id');
    
    if (!tabId) {
      tabId = this._generateTabId();
      this.set('_tab_id', tabId);
    }
    
    return tabId;
  };

  isCurrentTab = () => {
    const currentTabId = this.get('_current_tab_id');
    return !currentTabId || currentTabId === this.getTabId();
  };

  claimTab = () => {
    this.set('_current_tab_id', this.getTabId());
    return true;
  };

  // Temporary data methods (auto-removed on tab close)
  setTemp = (key, value, options = {}) => {
    return this.set(key, value, { ...options, temporary: true });
  };

  // Security methods
  setSecure = (key, value) => {
    return this.set(key, value, { encrypted: true });
  };

  getSecure = (key, defaultValue = null) => {
    return this.get(key, defaultValue, { encrypted: true });
  };

  // Subscribe to session storage changes
  subscribe = (callback) => {
    if (!this.initialized) return () => {};

    const listener = (event) => {
      if (event.storageArea === sessionStorage && event.key?.startsWith(this.prefix)) {
        const cleanKey = event.key.replace(this.prefix, '');
        callback({
          key: cleanKey,
          oldValue: event.oldValue,
          newValue: event.newValue,
          type: event.newValue === null ? 'remove' : 'set',
          timestamp: Date.now(),
          sessionId: this.sessionId
        });
      }
    };

    window.addEventListener('storage', listener);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('storage', listener);
    };
  };

  // Private methods
  _getKey = (key) => {
    return `${this.prefix}${key}`;
  };

  _generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  _generateTabId = () => {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  _initializeSession = () => {
    // Initialize session tracking data
    this._initializeSessionTracking();
    
    // Set session start time if not already set
    if (!this.has('_session_start')) {
      this.set('_session_start', Date.now(), { stringify: true });
    }
    
    // Initialize session data if not already set
    if (!this.has('_session_data')) {
      this.set('_session_data', {}, { stringify: true });
    }
    
    // Claim this tab
    this.claimTab();
  };

  _initializeSessionTracking = () => {
    // Initialize access tracking
    this.set('_access_tracking', {}, { stringify: true });
  };

  _updateAccessTracking = (key) => {
    try {
      const tracking = this.get('_access_tracking', {}, { parseJSON: true });
      tracking[key] = {
        lastAccessed: Date.now(),
        accessCount: (tracking[key]?.accessCount || 0) + 1
      };
      
      this.set('_access_tracking', tracking, { stringify: true });
    } catch (error) {
      console.error('SessionStorageService - UpdateAccessTracking error:', error);
    }
  };

  _updateCreationTracking = (key) => {
    try {
      const tracking = this.get('_access_tracking', {}, { parseJSON: true });
      
      if (!tracking[key]) {
        tracking[key] = {
          createdAt: Date.now(),
          lastAccessed: Date.now(),
          accessCount: 1
        };
      } else {
        tracking[key].lastAccessed = Date.now();
      }
      
      this.set('_access_tracking', tracking, { stringify: true });
    } catch (error) {
      console.error('SessionStorageService - UpdateCreationTracking error:', error);
    }
  };

  _removeTrackingData = (key) => {
    try {
      const tracking = this.get('_access_tracking', {}, { parseJSON: true });
      delete tracking[key];
      this.set('_access_tracking', tracking, { stringify: true });
    } catch (error) {
      console.error('SessionStorageService - RemoveTrackingData error:', error);
    }
  };

  _encrypt = (data) => {
    // Basic encryption - in production, use a proper encryption library
    try {
      return btoa(unescape(encodeURIComponent(data + this.encryptionKey)));
    } catch (error) {
      console.error('SessionStorageService - Encryption error:', error);
      return data;
    }
  };

  _decrypt = (data) => {
    // Basic decryption - in production, use a proper encryption library
    try {
      const decrypted = decodeURIComponent(escape(atob(data)));
      return decrypted.replace(this.encryptionKey, '');
    } catch (error) {
      console.error('SessionStorageService - Decryption error:', error);
      return data;
    }
  };

  _setupStorageListener = () => {
    // Custom storage event emitter for same-tab changes
    const originalSetItem = sessionStorage.setItem;
    const originalRemoveItem = sessionStorage.removeItem;
    const originalClear = sessionStorage.clear;


    sessionStorage.setItem = function(key, value) {
      const event = new Event('storage');
      event.key = key;
      event.oldValue = sessionStorage.getItem(key);
      event.newValue = value;
      event.storageArea = sessionStorage;
      
      originalSetItem.call(this, key, value);
      window.dispatchEvent(event);
    };

    sessionStorage.removeItem = function(key) {
      const event = new Event('storage');
      event.key = key;
      event.oldValue = sessionStorage.getItem(key);
      event.newValue = null;
      event.storageArea = sessionStorage;
      
      originalRemoveItem.call(this, key);
      window.dispatchEvent(event);
    };

    sessionStorage.clear = function() {
      const event = new Event('storage');
      event.key = null;
      event.oldValue = null;
      event.newValue = null;
      event.storageArea = sessionStorage;
      
      originalClear.call(this);
      window.dispatchEvent(event);
    };
  };

  _emitStorageEvent = (key, value, type) => {
    // Emit custom event for storage changes
    const event = new CustomEvent('sessionStorageChange', {
      detail: {
        key,
        value,
        type,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        tabId: this.getTabId()
      }
    });
    
    window.dispatchEvent(event);
  };
}

// Create singleton instance
export const sessionStorageService = new SessionStorageService();
export default sessionStorageService;