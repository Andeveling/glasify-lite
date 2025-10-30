/**
 * Wizard form state management hook
 * Uses React Hook Form for multi-step form state
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDebounce } from "@/hooks/use-debounce-value";
import { wizardFormSchema } from "../_schemas/wizard-form.schema";
import type { WizardFormData } from "../_utils/wizard-form.utils";
import { getWizardDefaults } from "../_utils/wizard-form.utils";
import { useWizardPersistence } from "./use-wizard-persistence";

const AUTO_SAVE_DEBOUNCE_MS = 500;

type UseWizardFormProps = {
  modelId: string;
  initialData?: Partial<WizardFormData>;
};

/**
 * Custom hook for wizard form state management
 * Integrates React Hook Form with Zod validation schema
 * Auto-saves form state to localStorage with debouncing
 *
 * @param modelId - ID of the model being configured
 * @param initialData - Optional initial form data (for persistence restoration)
 * @returns React Hook Form instance with wizard-specific defaults
 */
export function useWizardForm({ modelId, initialData }: UseWizardFormProps) {
  const { save, load, isAvailable } = useWizardPersistence(modelId);

  // Load persisted data on mount (if available)
  const persistedData = isAvailable ? load() : null;

  const form = useForm<WizardFormData>({
    resolver: zodResolver(wizardFormSchema),
    defaultValues: {
      ...getWizardDefaults(modelId),
      ...persistedData, // Persisted data takes priority
      ...initialData, // Props override persisted data
    },
    mode: "onChange", // Validate on change for instant feedback
  });

  // Watch form changes for auto-save
  const formData = form.watch();
  const debouncedFormData = useDebounce(formData, AUTO_SAVE_DEBOUNCE_MS);

  // Auto-save to localStorage on debounced changes
  useEffect(() => {
    if (isAvailable && debouncedFormData) {
      save(debouncedFormData);
    }
  }, [debouncedFormData, save, isAvailable]);

  return form;
}
