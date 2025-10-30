/**
 * Quote Wizard Container
 * Main orchestrator component integrating all wizard steps and logic
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  MM_TO_SQM,
  PLACEHOLDER_PRICE_PER_SQM,
  STEP_DIMENSIONS,
  STEP_GLASS,
  STEP_LOCATION,
  STEP_SERVICES,
  WIZARD_TOTAL_STEPS,
} from "../../_constants/wizard-config.constants";
import { useAddToBudget } from "../../_hooks/use-add-to-budget";
import { useWizardForm } from "../../_hooks/use-wizard-form";
import { useWizardNavigation } from "../../_hooks/use-wizard-navigation";
import { DimensionsStep } from "./steps/dimensions-step";
import { GlassStep } from "./steps/glass-step";
import { LocationStep } from "./steps/location-step";
import { ServicesStep } from "./steps/services-step";
import { SummaryStep } from "./steps/summary-step";
import { WizardActions } from "./wizard-actions";
import { WizardStepper } from "./wizard-stepper";

// Step configuration
const STEPS = [
  { number: 1, label: "Ubicación", description: "Dónde irá la ventana" },
  { number: 2, label: "Dimensiones", description: "Ancho y alto" },
  { number: 3, label: "Vidrio", description: "Tipo de solución" },
  { number: 4, label: "Servicios", description: "Opciones adicionales" },
];

type GlassSolution = {
  id: string;
  name: string;
  description: string | null;
  category: string;
};

type Service = {
  id: string;
  name: string;
  description: string | null;
  pricePerSqm: number;
};

type QuoteWizardProps = {
  modelId: string;
  glassSolutions: GlassSolution[];
  services: Service[];
  onSuccessAction?: () => void;
};

/**
 * QuoteWizard Component
 * Full wizard experience for adding items to budget
 */
export function QuoteWizard({
  modelId,
  glassSolutions,
  services,
  onSuccessAction,
}: QuoteWizardProps) {
  const [calculatedPrice, setCalculatedPrice] = useState<number | undefined>();

  // Form management
  const form = useWizardForm({ modelId });

  // Navigation logic
  const { currentStep, goToNextStep, goToPreviousStep, goToStep, canGoNext } =
    useWizardNavigation({
      form,
    });

  // Mutation hook
  const { addItem, isLoading: isSubmitting } = useAddToBudget({
    successAction: onSuccessAction,
  });

  // Handle price calculation callback from dimensions step
  const handlePriceCalculation = (width: number, height: number) => {
    // TODO: Implement actual price calculation via tRPC
    // For now, just set a placeholder
    const area = (width * height) / MM_TO_SQM; // m²
    setCalculatedPrice(area * PLACEHOLDER_PRICE_PER_SQM); // Placeholder calculation
  };

  // Handle wizard submission
  const handleSubmit = () => {
    const formData = form.getValues();
    const glassTypeId = formData.glassSolutionId;

    if (!glassTypeId) {
      toast.error("Error", {
        description: "Debes seleccionar un tipo de vidrio",
      });
      return;
    }

    addItem(formData, glassTypeId);
  };

  // Determine completed steps (all steps before current one)
  const completedSteps = Array.from(
    { length: currentStep - 1 },
    (_, i) => i + 1
  );

  // Get selected glass solution and services for summary
  const selectedGlassSolution = glassSolutions.find(
    (gs) => gs.id === form.watch("glassSolutionId")
  );
  const selectedServices = services.filter((s) =>
    form.watch("selectedServices")?.includes(s.id)
  );

  const isLastStep = currentStep === WIZARD_TOTAL_STEPS + 1; // +1 for summary step

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Stepper Navigation */}
      <WizardStepper
        completedSteps={completedSteps}
        currentStep={currentStep}
        onStepClickAction={goToStep}
        steps={STEPS}
      />

      {/* Wizard Content */}
      <Card>
        <CardContent className="min-h-[400px] p-6">
          {currentStep === STEP_LOCATION && <LocationStep form={form} />}
          {currentStep === STEP_DIMENSIONS && (
            <DimensionsStep
              form={form}
              onPriceCalculationAction={handlePriceCalculation}
            />
          )}
          {currentStep === STEP_GLASS && (
            <GlassStep availableSolutions={glassSolutions} form={form} />
          )}
          {currentStep === STEP_SERVICES && (
            <ServicesStep availableServices={services} form={form} />
          )}
          {currentStep === WIZARD_TOTAL_STEPS + 1 && (
            <SummaryStep
              calculatedPrice={calculatedPrice}
              form={form}
              glassSolution={selectedGlassSolution}
              selectedServices={selectedServices}
            />
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <WizardActions
        canGoNext={canGoNext}
        currentStep={currentStep} // +1 for summary
        isLastStep={isLastStep}
        isSubmitting={isSubmitting}
        onNextAction={goToNextStep}
        onPreviousAction={goToPreviousStep}
        onSubmitAction={handleSubmit}
        totalSteps={WIZARD_TOTAL_STEPS + 1}
      />
    </div>
  );
}
