/**
 * Wizard Actions Footer
 * Previous/Next/Submit navigation buttons
 */

"use client";

import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

type WizardActionsProps = {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onPreviousAction?: () => void;
  onNextAction?: () => void;
  onSubmitAction?: () => void;
};

/**
 * WizardActions Component
 * Navigation buttons for wizard (Previous, Next, Add to Budget)
 */
export function WizardActions({
  currentStep,
  totalSteps,
  canGoNext,
  isLastStep,
  isSubmitting,
  onPreviousAction,
  onNextAction,
  onSubmitAction,
}: WizardActionsProps) {
  const isFirstStep = currentStep === 1;

  return (
    <div className="flex items-center justify-between gap-4 border-t bg-background p-4">
      {/* Previous Button */}
      <Button
        className="min-h-[44px] min-w-[100px]"
        disabled={isFirstStep || isSubmitting}
        onClick={onPreviousAction}
        size="lg"
        type="button"
        variant="outline"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Anterior
      </Button>

      {/* Step Counter */}
      <div className="text-muted-foreground text-sm">
        Paso {currentStep} de {totalSteps}
      </div>

      {/* Next or Submit Button */}
      {isLastStep ? (
        <Button
          className="min-h-[44px] min-w-[160px]"
          disabled={!canGoNext || isSubmitting}
          onClick={onSubmitAction}
          size="lg"
          type="button"
        >
          {isSubmitting ? (
            <>Agregando...</>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Agregar al presupuesto
            </>
          )}
        </Button>
      ) : (
        <Button
          className="min-h-[44px] min-w-[100px]"
          disabled={!canGoNext || isSubmitting}
          onClick={onNextAction}
          size="lg"
          type="button"
        >
          Siguiente
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
