import { useState, useEffect, useCallback } from 'react';

// Custom hook for localStorage with state synchronization
export const useLocalStorage = (key, initialValue) => {
  // Get stored value from localStorage or use initial value
  const getStoredValue = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(getStoredValue);

  // Update localStorage when state changes
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Dispatch custom event for cross-tab synchronization
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(valueToStore)
      }));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for changes in other tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key && event.newValue !== null) {
        try {
          const newValue = JSON.parse(event.newValue);
          if (JSON.stringify(storedValue) !== JSON.stringify(newValue)) {
            setStoredValue(newValue);
          }
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, storedValue]);

  // Refresh from localStorage (useful for manual sync)
  const refresh = useCallback(() => {
    setStoredValue(getStoredValue());
  }, [getStoredValue]);

  // Remove item from localStorage
  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      // Dispatch custom event for cross-tab synchronization
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: null
      }));
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Clear all localStorage (use with caution)
  const clearAll = useCallback(() => {
    try {
      window.localStorage.clear();
      setStoredValue(initialValue);
      
      // Dispatch custom event for cross-tab synchronization
      window.dispatchEvent(new StorageEvent('storage'));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [initialValue]);

  // Get all keys with a specific prefix
  const getKeysWithPrefix = useCallback((prefix) => {
    try {
      const keys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const storageKey = window.localStorage.key(i);
        if (storageKey && storageKey.startsWith(prefix)) {
          keys.push(storageKey);
        }
      }
      return keys;
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }, []);

  // Get multiple items by keys
  const getMultiple = useCallback((keys) => {
    try {
      const result = {};
      keys.forEach(key => {
        const value = window.localStorage.getItem(key);
        if (value !== null) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });
      return result;
    } catch (error) {
      console.error('Error getting multiple localStorage items:', error);
      return {};
    }
  }, []);

  // Set multiple items
  const setMultiple = useCallback((items) => {
    try {
      Object.entries(items).forEach(([key, value]) => {
        window.localStorage.setItem(key, JSON.stringify(value));
      });
      
      // Update state for the current key if it's in the items
      if (items[key] !== undefined) {
        setStoredValue(items[key]);
      }
      
      // Dispatch custom event for cross-tab synchronization
      window.dispatchEvent(new StorageEvent('storage'));
    } catch (error) {
      console.error('Error setting multiple localStorage items:', error);
    }
  }, [key]);

  return {
    value: storedValue,
    setValue,
    refresh,
    remove,
    clearAll,
    getKeysWithPrefix,
    getMultiple,
    setMultiple
  };
};

// Specialized hook for user preferences
export const useUserPreferences = () => {
  const { value: preferences, setValue: setPreferences } = useLocalStorage('userPreferences', {
    theme: 'light',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    itemsPerPage: 25,
    autoRefresh: true,
    notifications: {
      email: true,
      push: true,
      sound: true
    }
  });

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setPreferences]);

  const updateNestedPreference = useCallback((path, value) => {
    setPreferences(prev => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const nested = keys.reduce((obj, key) => obj[key] || {}, prev);
      nested[lastKey] = value;
      return { ...prev };
    });
  }, [setPreferences]);

  return {
    preferences,
    setPreferences,
    updatePreference,
    updateNestedPreference
  };
};

// Specialized hook for form drafts
export const useFormDraft = (formKey, initialDraft = {}) => {
  const { value: draft, setValue: setDraft } = useLocalStorage(`formDraft_${formKey}`, initialDraft);

  const updateDraft = useCallback((updates) => {
    setDraft(prev => ({
      ...prev,
      ...updates
    }));
  }, [setDraft]);

  const clearDraft = useCallback(() => {
    setDraft(initialDraft);
  }, [setDraft, initialDraft]);

  const hasUnsavedChanges = useCallback((currentData) => {
    return JSON.stringify(currentData) !== JSON.stringify(draft);
  }, [draft]);

  return {
    draft,
    setDraft,
    updateDraft,
    clearDraft,
    hasUnsavedChanges
  };
};

// Specialized hook for recent items
export const useRecentItems = (storageKey, maxItems = 10) => {
  const { value: recentItems, setValue: setRecentItems } = useLocalStorage(`recent_${storageKey}`, []);

  const addItem = useCallback((item) => {
    setRecentItems(prev => {
      // Remove if already exists
      const filtered = prev.filter(existingItem => 
        JSON.stringify(existingItem) !== JSON.stringify(item)
      );
      
      // Add to beginning and limit size
      return [item, ...filtered].slice(0, maxItems);
    });
  }, [setRecentItems, maxItems]);

  const removeItem = useCallback((item) => {
    setRecentItems(prev => 
      prev.filter(existingItem => 
        JSON.stringify(existingItem) !== JSON.stringify(item)
      )
    );
  }, [setRecentItems]);

  const clearAll = useCallback(() => {
    setRecentItems([]);
  }, [setRecentItems]);

  return {
    recentItems,
    addItem,
    removeItem,
    clearAll
  };
};

// Specialized hook for cache management
export const useCache = (cacheKey, defaultTTL = 3600000) => { // 1 hour default
  const { value: cache, setValue: setCache } = useLocalStorage(`cache_${cacheKey}`, {
    data: null,
    timestamp: null,
    ttl: defaultTTL
  });

  const setCachedData = useCallback((data, ttl = defaultTTL) => {
    setCache({
      data,
      timestamp: Date.now(),
      ttl
    });
  }, [setCache, defaultTTL]);

  const getCachedData = useCallback(() => {
    if (!cache.data || !cache.timestamp) {
      return null;
    }

    const isExpired = Date.now() - cache.timestamp > cache.ttl;
    if (isExpired) {
      setCache({ data: null, timestamp: null, ttl: defaultTTL });
      return null;
    }

    return cache.data;
  }, [cache, setCache, defaultTTL]);

  const isCached = useCallback(() => {
    const data = getCachedData();
    return data !== null;
  }, [getCachedData]);

  const clearCache = useCallback(() => {
    setCache({ data: null, timestamp: null, ttl: defaultTTL });
  }, [setCache, defaultTTL]);

  return {
    getCachedData,
    setCachedData,
    isCached,
    clearCache,
    cacheInfo: {
      timestamp: cache.timestamp,
      ttl: cache.ttl,
      isExpired: cache.timestamp ? Date.now() - cache.timestamp > cache.ttl : true
    }
  };
};