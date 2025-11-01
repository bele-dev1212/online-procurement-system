class LocalStorageService {
  constructor() {
    this.prefix = 'procurement_';
    this.encryptionKey = 'procurement_storage_key'; // In production, use environment variable
    this.initialized = false;
    this.quota = {
      maxSize: 5 * 1024 * 1024, // 5MB
      warningThreshold: 0.8 // 80%
    };
    
    this.init();
  }

  // Initialize storage service
  init = () => {
    if (this.initialized) return true;

    try {
      // Test localStorage availability
      const testKey = this._getKey('storage_test');
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.initialized = true;
      
      // Set up storage change listener
      this._setupStorageListener();
      
      // Check storage quota
      this._checkStorageQuota();
      
      return true;
    } catch (error) {
      console.error('LocalStorageService - Initialization failed:', error);
      this.initialized = false;
      return false;
    }
  };

  // Get item from localStorage
  get = (key, defaultValue = null, options = {}) => {
    if (!this.initialized) {
      console.warn('LocalStorageService not initialized');
      return defaultValue;
    }

    try {
      const storageKey = this._getKey(key);
      let value = localStorage.getItem(storageKey);

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
          console.warn(`LocalStorageService - Failed to parse JSON for key ${key}:`, parseError);
        }
      }

      // Check expiry for TTL items
      if (options.withExpiry) {
        const expiryKey = this._getExpiryKey(key);
        const expiry = localStorage.getItem(expiryKey);
        
        if (expiry && Date.now() > parseInt(expiry, 10)) {
          this.remove(key);
          this.remove(expiryKey);
          return defaultValue;
        }
      }

      return value;
    } catch (error) {
      console.error(`LocalStorageService - Get error for key ${key}:`, error);
      return defaultValue;
    }
  };

  // Set item in localStorage
  set = (key, value, options = {}) => {
    if (!this.initialized) {
      console.warn('LocalStorageService not initialized');
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

      // Set TTL if provided
      if (options.ttl) {
        const expiryKey = this._getExpiryKey(key);
        const expiryTime = Date.now() + options.ttl;
        localStorage.setItem(expiryKey, expiryTime.toString());
      }

      localStorage.setItem(storageKey, processedValue);
      
      // Emit storage event
      this._emitStorageEvent(key, value, 'set');
      
      // Update storage stats
      this._updateStorageStats();
      
      return true;
    } catch (error) {
      console.error(`LocalStorageService - Set error for key ${key}:`, error);
      
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        this._handleQuotaExceeded();
      }
      
      return false;
    }
  };

  // Remove item from localStorage
  remove = (key) => {
    if (!this.initialized) {
      console.warn('LocalStorageService not initialized');
      return false;
    }

    try {
      const storageKey = this._getKey(key);
      localStorage.removeItem(storageKey);

      // Remove associated expiry key
      const expiryKey = this._getExpiryKey(key);
      localStorage.removeItem(expiryKey);

      // Remove metadata
      const metadataKey = this._getMetadataKey(key);
      localStorage.removeItem(metadataKey);

      // Emit storage event
      this._emitStorageEvent(key, null, 'remove');
      
      // Update storage stats
      this._updateStorageStats();
      
      return true;
    } catch (error) {
      console.error(`LocalStorageService - Remove error for key ${key}:`, error);
      return false;
    }
  };

  // Clear all items with prefix
  clear = (pattern = null) => {
    if (!this.initialized) {
      console.warn('LocalStorageService not initialized');
      return false;
    }

    try {
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
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
        localStorage.removeItem(key);
      });

      // Emit storage event
      this._emitStorageEvent('*', null, 'clear');
      
      // Reset storage stats
      this._resetStorageStats();
      
      return true;
    } catch (error) {
      console.error('LocalStorageService - Clear error:', error);
      return false;
    }
  };

  // Check if key exists
  has = (key) => {
    if (!this.initialized) return false;

    try {
      const storageKey = this._getKey(key);
      return localStorage.getItem(storageKey) !== null;
    } catch (error) {
      console.error(`LocalStorageService - Has error for key ${key}:`, error);
      return false;
    }
  };

  // Get all keys with prefix
  keys = (pattern = null) => {
    if (!this.initialized) return [];

    try {
      const keys = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
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
      console.error('LocalStorageService - Keys error:', error);
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
      console.error('LocalStorageService - GetMultiple error:', error);
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
      console.error('LocalStorageService - SetMultiple error:', error);
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
      console.error('LocalStorageService - RemoveMultiple error:', error);
      return false;
    }
  };

  // Get item with metadata
  getWithMetadata = (key, defaultValue = null) => {
    if (!this.initialized) return { value: defaultValue, metadata: null };

    try {
      const value = this.get(key, defaultValue);
      const metadata = this.get(this._getMetadataKey(key), null, { parseJSON: true });

      return {
        value,
        metadata: metadata || {
          createdAt: null,
          updatedAt: null,
          size: 0,
          ttl: null
        }
      };
    } catch (error) {
      console.error(`LocalStorageService - GetWithMetadata error for key ${key}:`, error);
      return { value: defaultValue, metadata: null };
    }
  };

  // Set item with metadata
  setWithMetadata = (key, value, metadata = {}) => {
    if (!this.initialized) return false;

    try {
      const now = Date.now();
      const defaultMetadata = {
        createdAt: now,
        updatedAt: now,
        size: this._getItemSize(value),
        accessCount: 0,
        ...metadata
      };

      // Set the value
      const success = this.set(key, value);

      if (success) {
        // Set metadata
        const metadataKey = this._getMetadataKey(key);
        this.set(metadataKey, defaultMetadata, { stringify: true });
      }

      return success;
    } catch (error) {
      console.error(`LocalStorageService - SetWithMetadata error for key ${key}:`, error);
      return false;
    }
  };

  // Update metadata for existing item
  updateMetadata = (key, metadataUpdates) => {
    if (!this.initialized) return false;

    try {
      const metadataKey = this._getMetadataKey(key);
      const currentMetadata = this.get(metadataKey, {}, { parseJSON: true });
      
      const updatedMetadata = {
        ...currentMetadata,
        ...metadataUpdates,
        updatedAt: Date.now(),
        accessCount: (currentMetadata.accessCount || 0) + 1
      };

      return this.set(metadataKey, updatedMetadata, { stringify: true });
    } catch (error) {
      console.error(`LocalStorageService - UpdateMetadata error for key ${key}:`, error);
      return false;
    }
  };

  // Clean up expired items
  cleanupExpired = () => {
    if (!this.initialized) return 0;

    try {
      let removedCount = 0;
      const now = Date.now();

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith(`${this.prefix}expiry_`)) {
          const expiry = localStorage.getItem(key);
          
          if (expiry && now > parseInt(expiry, 10)) {
            // Extract the original key from expiry key
            const originalKey = key.replace(`${this.prefix}expiry_`, '');
            
            // Remove both the item and its expiry key
            this.remove(originalKey);
            removedCount++;
          }
        }
      }

      console.log(`LocalStorageService - Cleaned up ${removedCount} expired items`);
      return removedCount;
    } catch (error) {
      console.error('LocalStorageService - CleanupExpired error:', error);
      return 0;
    }
  };

  // Get storage statistics
  getStats = () => {
    if (!this.initialized) return null;

    try {
      let totalSize = 0;
      let itemCount = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          totalSize += key.length + (value ? value.length : 0);
          itemCount++;
        }
      }

      const usagePercentage = (totalSize / this.quota.maxSize) * 100;
      const isNearQuota = usagePercentage >= (this.quota.warningThreshold * 100);

      return {
        totalSize,
        itemCount,
        usagePercentage: Math.round(usagePercentage * 100) / 100,
        isNearQuota,
        maxSize: this.quota.maxSize,
        availableSize: this.quota.maxSize - totalSize
      };
    } catch (error) {
      console.error('LocalStorageService - GetStats error:', error);
      return null;
    }
  };

  // Export all data (for backup)
  exportData = (pattern = null) => {
    if (!this.initialized) return null;

    try {
      const exportData = {};
      const keys = this.keys(pattern);

      keys.forEach(key => {
        const itemWithMetadata = this.getWithMetadata(key);
        exportData[key] = itemWithMetadata;
      });

      return {
        timestamp: Date.now(),
        version: '1.0',
        data: exportData
      };
    } catch (error) {
      console.error('LocalStorageService - ExportData error:', error);
      return null;
    }
  };

  // Import data (from backup)
  importData = (importData, options = { overwrite: true }) => {
    if (!this.initialized) return false;

    try {
      const { data } = importData;

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid import data format');
      }

      Object.keys(data).forEach(key => {
        const { value, metadata } = data[key];

        if (options.overwrite || !this.has(key)) {
          this.setWithMetadata(key, value, metadata);
        }
      });

      return true;
    } catch (error) {
      console.error('LocalStorageService - ImportData error:', error);
      return false;
    }
  };

  // Subscribe to storage changes
  subscribe = (callback) => {
    if (!this.initialized) return () => {};

    const listener = (event) => {
      if (event.storageArea === localStorage && event.key?.startsWith(this.prefix)) {
        const cleanKey = event.key.replace(this.prefix, '');
        callback({
          key: cleanKey,
          oldValue: event.oldValue,
          newValue: event.newValue,
          type: event.newValue === null ? 'remove' : 'set',
          timestamp: Date.now()
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

  _getExpiryKey = (key) => {
    return `${this.prefix}expiry_${key}`;
  };

  _getMetadataKey = (key) => {
    return `${this.prefix}meta_${key}`;
  };

  _encrypt = (data) => {
    // Basic encryption - in production, use a proper encryption library
    try {
      return btoa(unescape(encodeURIComponent(data + this.encryptionKey)));
    } catch (error) {
      console.error('LocalStorageService - Encryption error:', error);
      return data;
    }
  };

  _decrypt = (data) => {
    // Basic decryption - in production, use a proper encryption library
    try {
      const decrypted = decodeURIComponent(escape(atob(data)));
      return decrypted.replace(this.encryptionKey, '');
    } catch (error) {
      console.error('LocalStorageService - Decryption error:', error);
      return data;
    }
  };

  _getItemSize = (value) => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      return new Blob([stringValue]).size;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return 0;
    }
  };

  _setupStorageListener = () => {
    // Custom storage event emitter for same-tab changes
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;


    localStorage.setItem = function(key, value) {
      const event = new Event('storage');
      event.key = key;
      event.oldValue = localStorage.getItem(key);
      event.newValue = value;
      event.storageArea = localStorage;
      
      originalSetItem.call(this, key, value);
      window.dispatchEvent(event);
    };

    localStorage.removeItem = function(key) {
      const event = new Event('storage');
      event.key = key;
      event.oldValue = localStorage.getItem(key);
      event.newValue = null;
      event.storageArea = localStorage;
      
      originalRemoveItem.call(this, key);
      window.dispatchEvent(event);
    };

    localStorage.clear = function() {
      const event = new Event('storage');
      event.key = null;
      event.oldValue = null;
      event.newValue = null;
      event.storageArea = localStorage;
      
      originalClear.call(this);
      window.dispatchEvent(event);
    };
  };

  _emitStorageEvent = (key, value, type) => {
    // Emit custom event for storage changes
    const event = new CustomEvent('localStorageChange', {
      detail: {
        key,
        value,
        type,
        timestamp: Date.now(),
        prefix: this.prefix
      }
    });
    
    window.dispatchEvent(event);
  };

  _checkStorageQuota = () => {
    const stats = this.getStats();
    
    if (stats && stats.isNearQuota) {
      console.warn(`LocalStorageService - Storage near quota: ${stats.usagePercentage}% used`);
      
      // Emit quota warning event
      const event = new CustomEvent('localStorageQuotaWarning', {
        detail: stats
      });
      
      window.dispatchEvent(event);
    }
  };

  _handleQuotaExceeded = () => {
    console.error('LocalStorageService - Storage quota exceeded');
    
    // Try to cleanup expired items first
    this.cleanupExpired();
    
    // Emit quota exceeded event
    const event = new CustomEvent('localStorageQuotaExceeded', {
      detail: this.getStats()
    });
    
    window.dispatchEvent(event);
  };

  _updateStorageStats = () => {
    // Update storage stats in background
    setTimeout(() => {
      this._checkStorageQuota();
    }, 0);
  };

  _resetStorageStats = () => {
    // Reset any internal stats tracking
  };
}

// Create singleton instance
export const localStorageService = new LocalStorageService();
export default localStorageService;