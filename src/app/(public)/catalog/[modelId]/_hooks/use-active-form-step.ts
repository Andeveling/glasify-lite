import { useEffect, useState } from "react";
import type { FormStepId } from "../_components/form/form-steps-config";

// ============================================================================
// Constants
// ============================================================================

// Visibility checkpoint values
const THRESHOLD_START = 0;
const THRESHOLD_LOW = 0.2;
const THRESHOLD_MEDIUM = 0.5;
const THRESHOLD_HIGH = 0.8;
const THRESHOLD_FULL = 1;

// Intersection thresholds: Check visibility at 0%, 20%, 50%, 80%, 100%
const INTERSECTION_THRESHOLDS = [
  THRESHOLD_START,
  THRESHOLD_LOW,
  THRESHOLD_MEDIUM,
  THRESHOLD_HIGH,
  THRESHOLD_FULL,
];

// Minimum visibility ratio to consider section "active" (20%)
const VISIBILITY_THRESHOLD = 0.2;

// Root margin: Account for sticky headers and footer space
// Top: -80px (skip navbar + progress indicator)
// Bottom: -40% (require more than half visible)
const ROOT_MARGIN = "-80px 0px -40% 0px";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Find the step with highest intersection ratio
 */
function findMostVisibleStep(ratios: Map<FormStepId, number>): {
  step: FormStepId;
  ratio: number;
} {
  let maxRatio = 0;
  let mostVisibleStep: FormStepId = "dimensions";

  for (const [stepId, ratio] of ratios.entries()) {
    if (ratio > maxRatio) {
      maxRatio = ratio;
      mostVisibleStep = stepId;
    }
  }

  return { step: mostVisibleStep, ratio: maxRatio };
}

/**
 * Setup Intersection Observer for form sections
 */
function createSectionObserver(
  onIntersection: (stepId: FormStepId, ratio: number) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: ROOT_MARGIN,
    threshold: INTERSECTION_THRESHOLDS,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const stepId = entry.target.getAttribute(
        "data-step-id"
      ) as FormStepId | null;

      if (stepId) {
        onIntersection(stepId, entry.intersectionRatio);
      }
    }
  }, observerOptions);
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Custom hook for tracking active form step using Intersection Observer
 *
 * Detects which form section is currently most visible in the viewport,
 * providing more accurate step tracking than scroll percentage alone.
 *
 * @param sectionRefs - Record of refs for each form section
 * @param options - Intersection Observer options
 * @returns Current active step ID
 *
 * @example
 * const sectionRefs = {
 *   dimensions: useRef<HTMLDivElement>(null),
 *   glassType: useRef<HTMLDivElement>(null),
 *   color: useRef<HTMLDivElement>(null),
 *   services: useRef<HTMLDivElement>(null),
 * };
 *
 * const activeStep = useActiveFormStep(sectionRefs);
 */
export function useActiveFormStep(
  sectionRefs: Record<FormStepId, React.RefObject<HTMLDivElement | null>>,
  options?: IntersectionObserverInit
) {
  const [activeStep, setActiveStep] = useState<FormStepId>("dimensions");

  useEffect(() => {
    // Track intersection ratios for all sections
    const intersectionRatios = new Map<FormStepId, number>();

    // Create observer with callback to update ratios
    const observer = createSectionObserver((stepId, ratio) => {
      intersectionRatios.set(stepId, ratio);

      // Find most visible section
      const { step: mostVisibleStep, ratio: maxRatio } =
        findMostVisibleStep(intersectionRatios);

      // Update active step only if significantly visible
      if (maxRatio > VISIBILITY_THRESHOLD) {
        setActiveStep(mostVisibleStep);
      }
    }, options);

    // Observe all sections
    const observedElements: HTMLDivElement[] = [];

    for (const [stepId, ref] of Object.entries(sectionRefs)) {
      const element = ref.current;

      if (element) {
        // Set data attribute for identification
        element.setAttribute("data-step-id", stepId);
        observer.observe(element);
        observedElements.push(element);
        // Initialize with 0 ratio
        intersectionRatios.set(stepId as FormStepId, 0);
      }
    }

    // Cleanup
    return () => {
      for (const element of observedElements) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [sectionRefs, options]);

  return activeStep;
}
