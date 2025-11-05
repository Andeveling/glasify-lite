"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useActiveFormStep } from "../../_hooks/use-active-form-step";
import { type FormStepId, getAvailableSteps } from "./form-steps-config";

// ============================================================================
// Constants
// ============================================================================

const SPRING_STIFFNESS = 100;
const SPRING_DAMPING = 30;
const SPRING_REST_DELTA = 0.001;
const DOT_SIZE = 10; // Size of step indicator dots in pixels
const DOT_ACTIVE_SIZE = 14; // Active dot size
const DOT_ACTIVE_SCALE = 1.8; // Scale multiplier for active dot
const DOT_HOVER_SCALE = 2; // Scale on hover
const DOT_INACTIVE_OPACITY = 2; // Opacity for pending dots
const DOT_ACTIVE_OPACITY = 1.2; // Opacity for active/completed dots
const ANIMATION_DURATION = 0.3;
const PROGRESS_COLOR_STEP_1 = 0.33;
const PROGRESS_COLOR_STEP_2 = 0.66;

// ============================================================================
// Types
// ============================================================================

type VerticalScrollProgressProps = {
  className?: string;
  /** Container ref (form wrapper) */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Section refs for Intersection Observer tracking */
  sectionRefs: Record<FormStepId, React.RefObject<HTMLDivElement | null>>;
  /** Callback to notify parent of active step changes */
  onActiveStepChange?: (stepId: FormStepId) => void;
  /** Feature flags to determine which steps to show */
  hasColors?: boolean;
  hasServices?: boolean;
};

// ============================================================================
// Component
// ============================================================================

/**
 * VerticalScrollProgress - Minimal vertical progress bar between preview and form
 *
 * Inspired by: https://examples.motion.dev/react/scroll-linked-with-spring
 *
 * Design Philosophy:
 * - Subtle and non-invasive
 * - Vertical orientation (fits between columns)
 * - Smooth spring animations
 * - Color gradient based on progress
 * - Small step dots for current section
 */
export function VerticalScrollProgress({
  className,
  containerRef,
  sectionRefs,
  onActiveStepChange,
  hasColors = false,
  hasServices = false,
}: VerticalScrollProgressProps) {
  // Filter steps based on feature availability
  const availableSteps = useMemo(
    () => getAvailableSteps({ hasColors, hasServices }),
    [hasColors, hasServices]
  );

  // Use Intersection Observer for accurate step detection
  const activeStep = useActiveFormStep(sectionRefs);

  // Notify parent when active step changes
  useEffect(() => {
    if (onActiveStepChange) {
      onActiveStepChange(activeStep);
    }
  }, [activeStep, onActiveStepChange]);

  // Track scroll progress within the form container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Transform scroll progress to colors (visual feedback) using hex colors
  const progressColor = useTransform(
    scrollYProgress,
    [0, PROGRESS_COLOR_STEP_1, PROGRESS_COLOR_STEP_2, 1],
    [
      "#a855f7", // Primary purple
      "#0ea5e9", // Cyan
      "#10b981", // Emerald
      "#ef4444", // Red
    ]
  );

  // Get current step index
  const currentStepIndex = availableSteps.findIndex(
    (step) => step.id === activeStep
  );

  // Calculate discrete progress based on completed steps (as percentage 0-100)
  const discreteProgress = (currentStepIndex + 1) / availableSteps.length;
  const discreteHeight = useSpring(discreteProgress, {
    damping: SPRING_DAMPING,
    restDelta: SPRING_REST_DELTA,
    stiffness: SPRING_STIFFNESS,
  });

  // console.log("Discrete Height:", discreteHeight);

  return (
    <div
      className={cn(
        "sticky top-18 hidden h-[calc(100vh-12rem)] w-8 flex-col items-center py-8 md:flex",
        className
      )}
    >
      {/* Background track - More visible for loading effect */}
      <div className="relative h-full w-2 overflow-hidden rounded-full bg-muted/50 shadow-inner">
        {/* Animated progress bar - Fills discretely by steps */}
        <motion.div
          className="absolute inset-x-0 bottom-0 w-full rounded-full shadow-lg transition-colors"
          style={{
            backgroundColor: progressColor,
            height: discreteHeight,
          }}
        />
      </div>

      {/* Step indicators */}
      <div className="absolute inset-y-0 flex flex-col items-center justify-around py-8">
        {availableSteps.map((step, index) => {
          const isActive = step.id === activeStep;
          const isCompleted = index < currentStepIndex;
          const isPending = !(isActive || isCompleted);

          return (
            <motion.div
              animate={{
                scale: isActive ? DOT_ACTIVE_SCALE : 1,
                opacity:
                  isActive || isCompleted
                    ? DOT_ACTIVE_OPACITY
                    : DOT_INACTIVE_OPACITY,
              }}
              className={cn(
                "size-10 rounded-full border-2 transition-colors",
                isActive &&
                  "border-primary bg-primary shadow-lg shadow-primary/50",
                isCompleted && "border-success bg-success",
                isPending && "border-muted-foreground/30 bg-background"
              )}
              key={step.id}
              style={{
                height: isActive ? DOT_ACTIVE_SIZE : DOT_SIZE,
                width: isActive ? DOT_ACTIVE_SIZE : DOT_SIZE,
              }}
              transition={{ duration: ANIMATION_DURATION }}
              whileHover={{ scale: DOT_HOVER_SCALE }}
            >
              {/* Tooltip on hover */}
              <span className="sr-only">{step.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Tooltip container (visible on hover) */}
      <div className="-right-16 -translate-y-1/2 pointer-events-none absolute top-1/2">
        <motion.div
          animate={{ opacity: 0 }}
          className="whitespace-nowrap rounded-md bg-popover px-3 py-1.5 font-medium text-popover-foreground text-xs shadow-md"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          {availableSteps.find((s) => s.id === activeStep)?.label}
        </motion.div>
      </div>
    </div>
  );
}
