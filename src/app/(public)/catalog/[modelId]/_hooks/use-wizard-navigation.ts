/**
 * Wizard navigation hook
 * Manages step transitions and validation
 */

"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { WIZARD_TOTAL_STEPS } from "../_constants/wizard-config.constants";
import type { WizardFormData } from "../_utils/wizard-form.utils";

type UseWizardNavigationProps = {
  form: UseFormReturn<WizardFormData>;
  stepChangeAction?: (step: number) => void; // Callback for step changes (not a Server Action, just naming convention)
};

/**
 * Custom hook for wizard step navigation
 * Handles forward/backward navigation with validation
 *
 * @param form - React Hook Form instance
 * @param stepChangeAction - Optional callback when step changes
 * @returns Navigation methods and current step state
 */
export function useWizardNavigation({
  form,
  stepChangeAction,
}: UseWizardNavigationProps) {
  const [currentStep, setCurrentStep] = useState(1);

  /**
   * Move to next step with validation
   * Validates current step fields before advancing
   */
  const goToNextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid && currentStep < WIZARD_TOTAL_STEPS) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      form.setValue("currentStep", nextStep);
      stepChangeAction?.(nextStep);
    }
  };

  /**
   * Move to previous step without validation
   * Allows user to go back and correct previous inputs
   */
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      form.setValue("currentStep", prevStep);
      stepChangeAction?.(prevStep);
    }
  };

  /**
   * Jump to specific step
   * Only allows jumping to steps that are <= currentStep (no skipping ahead)
   *
   * @param stepNumber - Target step number (1-4)
   */
  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
      form.setValue("currentStep", stepNumber);
      stepChangeAction?.(stepNumber);
    }
  };

  /**
   * Check if next button should be enabled
   * Based on validation state of current step
   */
  const canGoNext = () => {
    const fieldsToCheck = getFieldsForStep(currentStep);
    const errors = form.formState.errors;

    // Check if any of the required fields for this step have errors
    return !fieldsToCheck.some((field) => errors[field]);
  };

  return {
    currentStep,
    canGoNext: canGoNext(),
    goToNextStep,
    goToPreviousStep,
    goToStep,
  };
}

/**
 * Get fields to validate for each step
 * Maps step number to field names
 */
function getFieldsForStep(step: number): Array<keyof WizardFormData> {
  const STEP_LOCATION = 1;
  const STEP_DIMENSIONS = 2;
  const STEP_GLASS = 3;
  const STEP_SERVICES = 4;

  switch (step) {
    case STEP_LOCATION:
      return ["roomLocation"];
    case STEP_DIMENSIONS:
      return ["width", "height"]; // colorId is optional
    case STEP_GLASS:
      return ["glassSolutionId"];
    case STEP_SERVICES:
      return []; // selectedServices is optional
    default:
      return [];
  }
}
