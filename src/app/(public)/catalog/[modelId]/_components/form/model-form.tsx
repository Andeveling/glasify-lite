"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Palette } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FormSection } from "@/components/form-section";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useScrollIntoView } from "@/hooks/use-scroll-into-view";
import { cn } from "@/lib/utils";
import type {
  GlassSolutionOutput,
  GlassTypeOutput,
  ModelDetailOutput,
  ServiceOutput,
} from "@/server/api/routers/catalog";
import { useCartOperations } from "../../_hooks/use-cart-operations";
import { useColorSelection } from "../../_hooks/use-color-selection";
import { useGlassArea } from "../../_hooks/use-glass-area";
import { usePriceBreakdown } from "../../_hooks/use-price-breakdown";
import { usePriceCalculation } from "../../_hooks/use-price-calculation";
import { useScrollResetForm } from "../../_hooks/use-scroll-reset-form";
import { useSolutionInference } from "../../_hooks/use-solution-inference";
import { prepareCartItemInput } from "../../_utils/cart-item-mapper";
import {
  createQuoteFormSchema,
  type QuoteFormValues,
} from "../../_utils/validation";
import { ColorSelector } from "../color-selector";
import { StickyPriceHeader } from "../sticky-price-header";
import { ModelFormLayout } from "../model-form-layout";
import { AddedToCartActions } from "./added-to-cart-actions";
import type { FormStepId } from "./form-steps-config";
import { QuoteSummary } from "./quote-summary";
import { DimensionsSection } from "./sections/dimensions-section";
import { GlassTypeSelectorSection } from "./sections/glass-type-selector-section";
import { ServicesSelectorSection } from "./sections/services-selector-section";
import { VerticalScrollProgress } from "./vertical-scroll-progress";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get card className based on active form step
 */
function getCardClassName(
  activeStep: FormStepId,
  currentStep: FormStepId
): string {
  return cn(
    "p-4 transition-all duration-300 sm:p-6",
    activeStep === currentStep
      ? "shadow-lg shadow-primary/20 ring-2 ring-primary"
      : ""
  );
}

// ============================================================================
// Types
// ============================================================================

type ModelFormProps = {
  currency: string;
  glassTypes: GlassTypeOutput[];
  hasColors: boolean;
  model: ModelDetailOutput;
  services: ServiceOutput[];
  solutions: GlassSolutionOutput[];
};

// ============================================================================
// Component
// ============================================================================

export function ModelForm({
  currency,
  glassTypes,
  hasColors,
  model,
  services,
  solutions,
}: ModelFormProps) {
  const schema = useMemo(() => createQuoteFormSchema(model), [model]);

  // ✅ Hooks: Separated concerns (SRP)
  const { addToCart } = useCartOperations();
  const { handleColorChange, selectedColorId, colorSurchargePercentage } =
    useColorSelection();

  // ✅ Track if item was just added to cart
  const [justAddedToCart, setJustAddedToCart] = useState(false);

  // ✅ Track active form step for visual focus
  const [activeFormStep, setActiveFormStep] =
    useState<FormStepId>("dimensions");

  // ✅ Auto-scroll to success card when item is added
  const successCardRef = useScrollIntoView(justAddedToCart);

  // ✅ Ref for scroll progress tracking
  const formContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Refs for each form section (Intersection Observer)
  const dimensionsSectionRef = useRef<HTMLDivElement>(null);
  const colorSectionRef = useRef<HTMLDivElement>(null);
  const glassTypeSectionRef = useRef<HTMLDivElement>(null);
  const servicesSectionRef = useRef<HTMLDivElement>(null);

  const sectionRefs = useMemo(
    () => ({
      color: colorSectionRef,
      dimensions: dimensionsSectionRef,
      glassType: glassTypeSectionRef,
      services: servicesSectionRef,
    }),
    []
  );

  // ✅ UX Improvement: Pre-populate with minimum valid dimensions and first glass type
  const defaultValues = useMemo(
    () => ({
      additionalServices: [],
      colorId: undefined,
      glassType: glassTypes[0]?.id ?? "",
      height: model.minHeightMm,
      quantity: 1,
      solution: "",
      width: model.minWidthMm,
    }),
    [model.minWidthMm, model.minHeightMm, glassTypes]
  );

  const form = useForm<QuoteFormValues>({
    defaultValues,
    mode: "onChange",
    // @ts-expect-error - zodResolver with z.coerce has type inference issues
    resolver: zodResolver(schema),
  });

  // Watch form values for price calculation
  const width = useWatch({ control: form.control, name: "width" });
  const height = useWatch({ control: form.control, name: "height" });
  const glassType = useWatch({ control: form.control, name: "glassType" });
  const quantity = useWatch({ control: form.control, name: "quantity" });
  const additionalServices = useWatch({
    control: form.control,
    name: "additionalServices",
  });

  // ✅ Get selected glass type object
  const selectedGlassType = glassTypes.find((gt) => gt.id === glassType);

  // ✅ Calculate billable glass area using hook (SRP)
  const glassArea = useGlassArea({
    discounts: {
      heightMm: model.glassDiscountHeightMm,
      widthMm: model.glassDiscountWidthMm,
    },
    heightMm: Number(height) || 0,
    widthMm: Number(width) || 0,
  });

  // ✅ Infer solution from glass type
  const { inferredSolution } = useSolutionInference(
    selectedGlassType ?? null,
    solutions
  );

  // Calculate price in real-time with dimension validation
  const { breakdown, calculatedPrice, error, isCalculating } =
    usePriceCalculation({
      additionalServices,
      colorSurchargePercentage,
      glassTypeId: glassType,
      heightMm: Number(height) || 0,
      maxHeightMm: model.maxHeightMm,
      maxWidthMm: model.maxWidthMm,
      minHeightMm: model.minHeightMm,
      minWidthMm: model.minWidthMm,
      modelId: model.id,
      widthMm: Number(width) || 0,
    });

  // ✅ Build detailed price breakdown using hook (SRP)
  const priceBreakdown = usePriceBreakdown({
    breakdown,
    glassArea,
    model,
    selectedGlassType,
    services,
  });

  // ✅ Prepare cart item data using pure function (SRP)
  const cartItemInput = useMemo(
    () =>
      prepareCartItemInput({
        additionalServiceIds: additionalServices,
        calculatedPrice,
        colorId: selectedColorId,
        colorSurchargePercentage,
        glassTypeId: glassType,
        heightMm: Number(height) || 0,
        inferredSolution,
        model,
        quantity: Number(quantity) || 1,
        selectedGlassType,
        widthMm: Number(width) || 0,
      }),
    [
      additionalServices,
      calculatedPrice,
      selectedColorId,
      colorSurchargePercentage,
      glassType,
      height,
      inferredSolution,
      model,
      quantity,
      selectedGlassType,
      width,
    ]
  );

  // ✅ Form submit handler - Simplified using hook (SRP)
  const handleFormSubmit = () => {
    const success = addToCart(cartItemInput, model.name);

    if (success) {
      form.reset(defaultValues);
      setJustAddedToCart(true);
    }
  };

  // ✅ Handler to configure another item
  const handleConfigureAnother = () => {
    setJustAddedToCart(false);
    handleColorChange(undefined, 0);
    form.reset(defaultValues);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  // ✅ Wrapper to integrate color selection with form (Adapter pattern)
  const handleColorChangeWithForm = (
    colorId: string | undefined,
    surchargePercentage: number
  ) => {
    handleColorChange(colorId, surchargePercentage);
    form.setValue("colorId", colorId);
  };

  // ✅ UX Enhancement: Auto-reset form when user scrolls up after adding to cart
  useScrollResetForm({
    isFormSubmitted: justAddedToCart,
    onReset: handleConfigureAnother,
    scrollThreshold: 100,
    successCardRef,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        {/* Main form container for scroll tracking */}
        <div ref={formContainerRef}>
          <ModelFormLayout
            sidebar={
              <div className="w-full space-y-4">
                <StickyPriceHeader
                  basePrice={model.basePrice}
                  breakdown={priceBreakdown}
                  configSummary={{
                    glassTypeName: selectedGlassType?.name,
                    heightMm: Number(height) || undefined,
                    modelImageUrl: model.imageUrl || undefined,
                    modelName: model.name,
                    solutionName: inferredSolution?.nameEs,
                    widthMm: Number(width) || undefined,
                  }}
                  currency={currency}
                  currentPrice={calculatedPrice ?? model.basePrice}
                />
                <div className="hidden lg:block">
                  <QuoteSummary
                    basePrice={model.basePrice}
                    calculatedPrice={calculatedPrice}
                    error={error}
                    isCalculating={isCalculating}
                    justAddedToCart={justAddedToCart}
                  />
                </div>
              </div>
            }
            main={
              <>
                {/* Vertical scroll progress bar - Minimal and subtle */}
                <VerticalScrollProgress
                  containerRef={formContainerRef}
                  hasColors={hasColors}
                  hasServices={services.length > 0}
                  onActiveStepChange={setActiveFormStep}
                  sectionRefs={sectionRefs}
                />

                {/* Form sections */}
                <Card
                  className={getCardClassName(activeFormStep, "dimensions")}
                  ref={dimensionsSectionRef}
                >
                  <DimensionsSection
                    dimensions={{
                      maxHeight: model.maxHeightMm,
                      maxWidth: model.maxWidthMm,
                      minHeight: model.minHeightMm,
                      minWidth: model.minWidthMm,
                    }}
                  />
                </Card>
                {/* Color Selector - Only show if model has colors */}
                {hasColors && (
                  <Card
                    className={getCardClassName(activeFormStep, "color")}
                    ref={colorSectionRef}
                  >
                    <FormSection
                      icon={Palette}
                      legend="Seleccione un Color"
                    >
                      <ColorSelector
                        modelId={model.id}
                        onColorChange={handleColorChangeWithForm}
                      />
                    </FormSection>
                  </Card>
                )}
                {/* Glass Type Selector with performance bars */}
                <Card
                  className={getCardClassName(activeFormStep, "glassType")}
                  ref={glassTypeSectionRef}
                >
                  <GlassTypeSelectorSection
                    basePrice={model.basePrice}
                    glassTypes={glassTypes}
                    selectedSolutionId={inferredSolution?.id}
                  />
                </Card>

                {/* Services Section - Only show if services are available (Don't Make Me Think principle) */}
                <div ref={servicesSectionRef}>
                  {services.length > 0 && (
                    <Card
                      className={getCardClassName(activeFormStep, "services")}
                    >
                      <ServicesSelectorSection services={services} />
                    </Card>
                  )}
                </div>

                {/* Quote Summary with submit button - Duplicate for better UX at end of form */}
                <QuoteSummary
                  basePrice={model.basePrice}
                  calculatedPrice={calculatedPrice}
                  error={error}
                  isCalculating={isCalculating}
                  justAddedToCart={justAddedToCart}
                />

                {/* ✅ Show success actions after adding to cart */}
                {justAddedToCart && (
                  <AddedToCartActions
                    modelName={model.name}
                    onConfigureAnotherAction={handleConfigureAnother}
                    ref={successCardRef}
                  />
                )}
              </>
            }
          />
        </div>
      </form>
    </Form>
  );
}
