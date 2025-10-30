/**
 * Wizard Stepper Navigation
 * Visual progress indicator and step navigation
 */

"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = {
  number: number;
  label: string;
  description: string;
};

type WizardStepperProps = {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClickAction?: (step: number) => void;
};

/**
 * Get button classes based on step state
 */
function getStepButtonClasses(
  isCurrent: boolean,
  isCompleted: boolean,
  isPastOrCurrent: boolean
): string {
  const baseClasses = "min-h-[44px] min-w-[44px] rounded-full transition-all";

  if (isCurrent) {
    return cn(
      baseClasses,
      "border-2 border-primary bg-primary text-primary-foreground"
    );
  }

  if (isCompleted) {
    return cn(
      baseClasses,
      "bg-primary text-primary-foreground hover:bg-primary/90"
    );
  }

  if (isPastOrCurrent) {
    return cn(
      baseClasses,
      "border-2 border-primary bg-background text-primary hover:bg-primary/10"
    );
  }

  return cn(
    baseClasses,
    "cursor-not-allowed border-2 border-muted bg-background text-muted-foreground"
  );
}

/**
 * WizardStepper Component
 * Horizontal stepper with visual progress indication
 */
export function WizardStepper({
  steps,
  currentStep,
  completedSteps,
  onStepClickAction,
}: WizardStepperProps) {
  return (
    <nav aria-label="Progreso del formulario">
      <ol className="flex items-center justify-between gap-2 md:gap-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = currentStep === step.number;
          const isPastOrCurrent = step.number <= currentStep;
          const isClickable =
            isPastOrCurrent && onStepClickAction && !isCurrent;
          const isLastStep = index === steps.length - 1;

          return (
            <li
              className="flex flex-1 items-center gap-2 md:gap-4"
              key={step.number}
            >
              <div className="flex items-center gap-2">
                <Button
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${step.label}: ${step.description}`}
                  className={getStepButtonClasses(
                    isCurrent,
                    isCompleted,
                    isPastOrCurrent
                  )}
                  disabled={!isClickable}
                  onClick={() => onStepClickAction?.(step.number)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="font-medium text-base">{step.number}</span>
                  )}
                </Button>
                <div className="hidden min-w-0 flex-col md:flex">
                  <span
                    className={cn(
                      "truncate font-medium text-sm",
                      isCurrent && "text-foreground",
                      !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="truncate text-muted-foreground text-xs">
                    {step.description}
                  </span>
                </div>
              </div>

              {/* Separator Line */}
              {!isLastStep && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "h-0.5 flex-1",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile Step Label */}
      <div className="mt-4 text-center md:hidden">
        <p className="font-medium text-sm">
          {steps.find((s) => s.number === currentStep)?.label}
        </p>
        <p className="text-muted-foreground text-xs">
          Paso {currentStep} de {steps.length}
        </p>
      </div>
    </nav>
  );
}
