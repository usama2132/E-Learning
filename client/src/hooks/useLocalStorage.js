import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}" from storage event:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Hook for storing objects with validation
export const useLocalStorageObject = (key, initialValue, validator = null) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);

  const setValidatedValue = useCallback((newValue) => {
    if (validator && !validator(newValue)) {
      console.warn(`Invalid value for localStorage key "${key}":`, newValue);
      return;
    }
    setValue(newValue);
  }, [setValue, validator, key]);

  return [value, setValidatedValue, removeValue];
};

// Hook for storing arrays with utility methods
export const useLocalStorageArray = (key, initialValue = []) => {
  const [array, setArray, removeArray] = useLocalStorage(key, initialValue);

  const addItem = useCallback((item) => {
    setArray(prev => [...prev, item]);
  }, [setArray]);

  const removeItem = useCallback((index) => {
    setArray(prev => prev.filter((_, i) => i !== index));
  }, [setArray]);

  const updateItem = useCallback((index, newItem) => {
    setArray(prev => prev.map((item, i) => i === index ? newItem : item));
  }, [setArray]);

  const clearArray = useCallback(() => {
    setArray([]);
  }, [setArray]);

  const findItem = useCallback((predicate) => {
    return array.find(predicate);
  }, [array]);

  const hasItem = useCallback((item) => {
    return array.includes(item);
  }, [array]);

  return {
    array,
    setArray,
    addItem,
    removeItem,
    updateItem,
    clearArray,
    removeArray,
    findItem,
    hasItem,
    length: array.length
  };
};

export default useLocalStorage;