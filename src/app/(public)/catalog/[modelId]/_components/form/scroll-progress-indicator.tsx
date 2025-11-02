"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useActiveFormStep } from "../../_hooks/use-active-form-step";
import {
	FORM_STEPS,
	type FormStepId,
	getStepProgress,
} from "./form-steps-config";

// ============================================================================
// Constants
// ============================================================================

const SCROLL_STEP_THRESHOLD = 0.25; // Each step represents 25% of scroll
const STEP_MULTIPLIER_SECOND = 2;
const STEP_MULTIPLIER_THIRD = 3;
const ACTIVE_STEP_SCALE = 1.1;
const INACTIVE_STEP_SCALE = 1;
const ACTIVE_STEP_OPACITY = 1;
const INACTIVE_STEP_OPACITY = 0.5;
const SPRING_STIFFNESS = 100;
const SPRING_DAMPING = 30;
const SPRING_REST_DELTA = 0.001;
const ANIMATION_DURATION = 0.2;

// ============================================================================
// Types
// ============================================================================

type ScrollProgressIndicatorProps = {
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
 * ScrollProgressIndicator - Tracks scroll position and displays current form step
 *
 * Uses motion/react's useScroll to track which section is currently in view
 * Displays progress bar and step indicators
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles scroll tracking and visual indication
 * - Open/Closed: Extensible via FORM_STEPS configuration
 * - Dependency Inversion: Depends on FormStepId abstraction, not concrete sections
 */
export function ScrollProgressIndicator({
	className,
	containerRef,
	sectionRefs,
}: ScrollProgressIndicatorProps) {
	// Use Intersection Observer for accurate step detection
	const activeStep = useActiveFormStep(sectionRefs);

	const progressBarRef = useRef<HTMLDivElement>(null);

	// Track window scroll progress for overall progress bar
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	});

	// Smooth the scroll progress with spring animation
	const scaleX = useSpring(scrollYProgress, {
		damping: SPRING_DAMPING,
		restDelta: SPRING_REST_DELTA,
		stiffness: SPRING_STIFFNESS,
	});

	// Transform scroll progress to colors (visual feedback)
	const progressColor = useTransform(
		scrollYProgress,
		[
			0,
			SCROLL_STEP_THRESHOLD,
			SCROLL_STEP_THRESHOLD * STEP_MULTIPLIER_SECOND,
			SCROLL_STEP_THRESHOLD * STEP_MULTIPLIER_THIRD,
			1,
		],
		[
			"hsl(var(--primary))",
			"hsl(210, 100%, 50%)",
			"hsl(180, 100%, 40%)",
			"hsl(120, 100%, 35%)",
			"hsl(90, 100%, 40%)",
		],
	);

	// Get current step index for progress calculation
	const currentStepIndex =
		FORM_STEPS.findIndex((step) => step.id === activeStep) + 1;
	const progressPercentage = getStepProgress(currentStepIndex);

	return (
		<Card
			className={cn(
				"sticky top-20 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
				className,
			)}
		>
			<div className="px-4 py-3 sm:px-6">
				{/* Progress bar */}
				<div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
					<motion.div
						className="h-full origin-left"
						ref={progressBarRef}
						style={{
							backgroundColor: progressColor,
							scaleX,
						}}
					/>
				</div>

				{/* Steps indicator */}
				<div className="flex items-center justify-between gap-2">
					{FORM_STEPS.map((step, index) => {
						const isActive = step.id === activeStep;
						const isCompleted = index < currentStepIndex - 1;
						const isPending = !(isActive || isCompleted);

						return (
							<div
								className="flex flex-1 flex-col items-center gap-1"
								key={step.id}
							>
								{/* Step icon/number */}
								<motion.div
									animate={{
										opacity:
											isActive || isCompleted
												? ACTIVE_STEP_OPACITY
												: INACTIVE_STEP_OPACITY,
										scale: isActive ? ACTIVE_STEP_SCALE : INACTIVE_STEP_SCALE,
									}}
									className={cn(
										"flex size-8 items-center justify-center rounded-full border-2 font-semibold text-sm transition-colors sm:size-10",
										isActive &&
											"border-primary bg-primary text-primary-foreground",
										isCompleted && "border-green-500 bg-green-500 text-white",
										isPending && "border-muted-foreground/30 bg-muted",
									)}
									transition={{ duration: ANIMATION_DURATION }}
								>
									{isCompleted ? "✓" : step.icon}
								</motion.div>

								{/* Step label (hidden on mobile) */}
								<span
									className={cn(
										"hidden text-center font-medium text-xs sm:block",
										isActive && "text-primary",
										!isActive && "text-muted-foreground",
									)}
								>
									{step.label}
								</span>
							</div>
						);
					})}
				</div>

				{/* Active step info (mobile-friendly) */}
				<div className="mt-3 flex items-center justify-between border-t pt-2">
					<div className="flex items-center gap-2">
						<Badge
							variant={activeStep === "dimensions" ? "default" : "secondary"}
						>
							Paso {currentStepIndex} de {FORM_STEPS.length}
						</Badge>
						<span className="font-medium text-sm">
							{FORM_STEPS.find((s) => s.id === activeStep)?.label}
						</span>
					</div>
					<span className="text-muted-foreground text-xs">
						{progressPercentage}% completado
					</span>
				</div>
			</div>
		</Card>
	);
}
