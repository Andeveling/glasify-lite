/**
 * Wizard form state management hook
 * Uses React Hook Form for multi-step form state
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { wizardFormSchema } from "../_schemas/wizard-form.schema";
import type { WizardFormData } from "../_utils/wizard-form.utils";
import { getWizardDefaults } from "../_utils/wizard-form.utils";

type UseWizardFormProps = {
  modelId: string;
  initialData?: Partial<WizardFormData>;
};

/**
 * Custom hook for wizard form state management
 * Integrates React Hook Form with Zod validation schema
 *
 * @param modelId - ID of the model being configured
 * @param initialData - Optional initial form data (for persistence restoration)
 * @returns React Hook Form instance with wizard-specific defaults
 */
export function useWizardForm({ modelId, initialData }: UseWizardFormProps) {
  const form = useForm<WizardFormData>({
    resolver: zodResolver(wizardFormSchema),
    defaultValues: {
      ...getWizardDefaults(modelId),
      ...initialData,
    },
    mode: "onChange", // Validate on change for instant feedback
  });

  return form;
}
