/**
 * Wizard persistence hook
 * Manages localStorage for wizard form state
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import type { WizardFormData } from "../_utils/wizard-form.utils";

const LOCALSTORAGE_KEY_PREFIX = "glasify-wizard";

type PersistenceHook = {
  save: (data: WizardFormData) => void;
  load: () => WizardFormData | null;
  clear: () => void;
  isAvailable: boolean;
};

/**
 * Check if localStorage is available
 * Handles cases where localStorage is disabled or unavailable
 */
function checkLocalStorageAvailability(): boolean {
  try {
    const test = "__storage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Custom hook for wizard form persistence
 * Auto-saves wizard state to localStorage
 *
 * @param modelId - Model ID to scope the localStorage key
 * @returns Persistence methods (save, load, clear) and availability flag
 */
export function useWizardPersistence(modelId: string): PersistenceHook {
  const [isAvailable, setIsAvailable] = useState(false);

  // Check localStorage availability on mount
  useEffect(() => {
    setIsAvailable(checkLocalStorageAvailability());
  }, []);

  const storageKey = `${LOCALSTORAGE_KEY_PREFIX}-${modelId}`;

  /**
   * Save wizard data to localStorage
   * Gracefully handles errors (quota exceeded, security errors)
   */
  const save = useCallback(
    (data: WizardFormData) => {
      if (!isAvailable) {
        return;
      }

      try {
        const serialized = JSON.stringify(data);
        window.localStorage.setItem(storageKey, serialized);
      } catch (error) {
        // Handle QuotaExceededError or SecurityError
        if (
          error instanceof Error &&
          (error.name === "QuotaExceededError" ||
            error.name === "SecurityError")
        ) {
          // Silently disable persistence if localStorage is unavailable
          setIsAvailable(false);
        }
        // Silent fail for other errors (wizard continues without persistence)
      }
    },
    [isAvailable, storageKey]
  );

  /**
   * Load wizard data from localStorage
   * Returns null if no data found or if parsing fails
   */
  const load = useCallback((): WizardFormData | null => {
    if (!isAvailable) {
      return null;
    }

    try {
      const serialized = window.localStorage.getItem(storageKey);
      if (!serialized) {
        return null;
      }

      const parsed = JSON.parse(serialized) as WizardFormData;
      return parsed;
    } catch {
      // Silent fail - clear corrupted data and return null
      window.localStorage.removeItem(storageKey);
      return null;
    }
  }, [isAvailable, storageKey]);

  /**
   * Clear wizard data from localStorage
   * Called after successful budget addition
   */
  const clear = useCallback(() => {
    if (!isAvailable) {
      return;
    }

    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Silent fail - wizard continues regardless
    }
  }, [isAvailable, storageKey]);

  return {
    save,
    load,
    clear,
    isAvailable,
  };
}
