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
          const isClickable = isCompleted && onStepClickAction;
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
                  className={cn(
                    "h-8 w-8 rounded-full md:h-10 md:w-10",
                    isCurrent &&
                      "border-2 border-primary bg-primary text-primary-foreground",
                    isCompleted &&
                      !isCurrent &&
                      "bg-primary text-primary-foreground",
                    !(isCompleted || isCurrent) &&
                      "border-2 border-muted bg-background text-muted-foreground"
                  )}
                  disabled={!isClickable}
                  onClick={() => onStepClickAction?.(step.number)}
                  size="icon"
                  variant="ghost"
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <span className="font-medium text-sm md:text-base">
                      {step.number}
                    </span>
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
