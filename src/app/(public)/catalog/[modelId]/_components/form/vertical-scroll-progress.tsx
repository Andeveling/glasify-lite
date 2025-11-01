"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { useActiveFormStep } from "../../_hooks/use-active-form-step";
import { FORM_STEPS, type FormStepId } from "./form-steps-config";

// ============================================================================
// Constants
// ============================================================================

const SPRING_STIFFNESS = 100;
const SPRING_DAMPING = 30;
const SPRING_REST_DELTA = 0.001;
const DOT_SIZE = 8; // Size of step indicator dots in pixels
const DOT_ACTIVE_SIZE = 12; // Active dot size
const DOT_ACTIVE_SCALE = 1.5; // Scale multiplier for active dot
const DOT_HOVER_SCALE = 1.8; // Scale on hover
const DOT_INACTIVE_OPACITY = 0.3; // Opacity for pending dots
const DOT_ACTIVE_OPACITY = 1; // Opacity for active/completed dots
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
}: VerticalScrollProgressProps) {
  // Use Intersection Observer for accurate step detection
  const activeStep = useActiveFormStep(sectionRefs);

  // Track scroll progress within the form container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth the scroll progress with spring animation
  const scaleY = useSpring(scrollYProgress, {
    damping: SPRING_DAMPING,
    restDelta: SPRING_REST_DELTA,
    stiffness: SPRING_STIFFNESS,
  });

  // Transform scroll progress to colors (visual feedback)
  const progressColor = useTransform(
    scrollYProgress,
    [0, PROGRESS_COLOR_STEP_1, PROGRESS_COLOR_STEP_2, 1],
    [
      "hsl(var(--primary))",
      "hsl(210, 100%, 50%)",
      "hsl(180, 100%, 40%)",
      "hsl(120, 100%, 35%)",
    ]
  );

  // Get current step index
  const currentStepIndex = FORM_STEPS.findIndex(
    (step) => step.id === activeStep
  );

  return (
    <div
      className={cn(
        "sticky top-18 hidden h-[calc(100vh-12rem)] w-8 flex-col items-center py-8 md:flex",
        className
      )}
    >
      {/* Background track */}
      <div className="relative h-full w-1 overflow-hidden rounded-full bg-muted/30">
        {/* Animated progress bar */}
        <motion.div
          className="absolute inset-x-0 top-0 w-full origin-top rounded-full"
          style={{
            backgroundColor: progressColor,
            scaleY,
          }}
        />
      </div>

      {/* Step indicators */}
      <div className="absolute inset-y-0 flex flex-col items-center justify-around py-8">
        {FORM_STEPS.map((step, index) => {
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
                "rounded-full border-2 transition-colors",
                isActive &&
                  "border-primary bg-primary shadow-lg shadow-primary/50",
                isCompleted && "border-green-500 bg-green-500",
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
          {FORM_STEPS.find((s) => s.id === activeStep)?.label}
        </motion.div>
      </div>
    </div>
  );
}
