/**
 * Wizard form persistence hook
 * Manages localStorage for wizard auto-save functionality
 */

"use client";

import { useCallback } from "react";

/**
 * Hook for managing wizard state persistence in localStorage
 * @param modelId - Model ID for scoping localStorage key
 * @returns Clear function to remove persisted state
 */
export function useWizardPersistence(modelId: string) {
  const STORAGE_KEY = `wizard-${modelId}`;

  /**
   * Clear persisted wizard state from localStorage
   * Called after successful budget item addition
   */
  const clear = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently fail - localStorage may be disabled
      // No logging needed for this non-critical operation
    }
  }, [STORAGE_KEY]);

  return { clear };
}
