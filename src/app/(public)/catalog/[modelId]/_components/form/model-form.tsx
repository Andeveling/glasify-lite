'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { useCart } from '@/app/(public)/cart/_hooks/use-cart';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useScrollIntoView } from '@/hooks/use-scroll-into-view';
import type {
  GlassSolutionOutput,
  GlassTypeOutput,
  ModelDetailOutput,
  ServiceOutput,
} from '@/server/api/routers/catalog';
import type { CreateCartItemInput } from '@/types/cart.types';
import { usePriceCalculation } from '../../_hooks/use-price-calculation';
import { createQuoteFormSchema, type QuoteFormValues } from '../../_utils/validation';
import { AddedToCartActions } from './added-to-cart-actions';
import { QuoteSummary } from './quote-summary';
import { DimensionsSection } from './sections/dimensions-section';
import { GlassTypeSelectorSection } from './sections/glass-type-selector-section';
import { ServicesSelectorSection } from './sections/services-selector-section';
import { SolutionSelectorSection } from './sections/solution-selector-section';

// ============================================================================
// Types
// ============================================================================

type ModelFormProps = {
  model: ModelDetailOutput;
  glassTypes: GlassTypeOutput[];
  services: ServiceOutput[];
  solutions: GlassSolutionOutput[];
  currency: string;
};

// ============================================================================
// Component
// ============================================================================

export function ModelForm({ model, glassTypes, services, solutions, currency }: ModelFormProps) {
  const schema = useMemo(() => createQuoteFormSchema(model), [model]);
  const { addItem } = useCart();

  // ✅ Track if item was just added to cart
  const [justAddedToCart, setJustAddedToCart] = useState(false);

  // ✅ Auto-scroll to success card when item is added
  const successCardRef = useScrollIntoView(justAddedToCart);

  // ✅ UX Improvement: Pre-populate with minimum valid dimensions and first glass type
  const defaultValues = useMemo(
    () => ({
      additionalServices: [],
      glassType: glassTypes[0]?.id ?? '', // Pre-select first glass type (usually most common/budget)
      height: model.minHeightMm, // Use minimum height as starting point
      quantity: 1,
      solution: '', // No solution selected by default (optional field)
      width: model.minWidthMm, // Use minimum width as starting point
    }),
    [model.minWidthMm, model.minHeightMm, glassTypes]
  );

  const form = useForm<QuoteFormValues>({
    defaultValues,
    mode: 'onChange',
    // @ts-expect-error - zodResolver with z.coerce has type inference issues
    resolver: zodResolver(schema),
  });

  // Watch form values for price calculation
  // ✅ Optimization: Use useWatch with specific fields instead of form.watch() to prevent unnecessary re-renders
  const width = useWatch({ control: form.control, name: 'width' });
  const height = useWatch({ control: form.control, name: 'height' });
  const glassType = useWatch({ control: form.control, name: 'glassType' });
  const additionalServices = useWatch({ control: form.control, name: 'additionalServices' });
  const selectedSolution = useWatch({ control: form.control, name: 'solution' });

  // Calculate price in real-time
  const { calculatedPrice, error, isCalculating } = usePriceCalculation({
    additionalServices,
    glassTypeId: glassType,
    heightMm: Number(height) || 0,
    modelId: model.id,
    widthMm: Number(width) || 0,
  });

  // ✅ Prepare cart item data from form values
  const selectedGlassType = glassTypes.find((gt) => gt.id === glassType);
  const selectedSolutionData = solutions.find((s) => s.id === selectedSolution);

  const cartItemInput: CreateCartItemInput & { unitPrice: number } = {
    additionalServiceIds: additionalServices,
    glassTypeId: glassType,
    glassTypeName: selectedGlassType?.name ?? '',
    heightMm: Number(height) || 0,
    modelId: model.id,
    modelName: model.name,
    quantity: 1, // Single item per add (user can increase in cart)
    solutionId: selectedSolution || undefined,
    solutionName: selectedSolutionData?.name || undefined,
    unitPrice: calculatedPrice ?? model.basePrice,
    widthMm: Number(width) || 0,
  };

  // ✅ Form submit handler - Add item to cart
  const handleFormSubmit = () => {
    try {
      // Add item to cart (client-side)
      addItem(cartItemInput);

      // ✅ UX Enhancement: Reset form to default values for next configuration
      form.reset(defaultValues);

      // ✅ UX Enhancement: Show success state (scroll handled by useScrollIntoView hook)
      setJustAddedToCart(true);

      // Show success toast
      toast.success('Item agregado al carrito', {
        description: `${model.name} ha sido agregado exitosamente`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error && err.message.includes('no puedes agregar más')
          ? 'Has alcanzado el límite de 20 items en el carrito'
          : 'No se pudo agregar el item al carrito';

      // Show error toast
      toast.error('Error al agregar', {
        description: errorMessage,
      });
    }
  };

  // ✅ Handler to configure another item
  const handleConfigureAnother = () => {
    setJustAddedToCart(false);
    form.reset(defaultValues);
    // Scroll handled automatically by useScrollIntoView when justAddedToCart becomes true again
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="space-y-6">
          {/* ✅ Show success actions after adding to cart */}
          {justAddedToCart && (
            <AddedToCartActions
              modelName={model.name}
              onConfigureAnother={handleConfigureAnother}
              ref={successCardRef}
            />
          )}

          {/* Solution Selector (Step 1) - Optional */}
          {solutions.length > 0 && (
            <Card className="p-6">
              <SolutionSelectorSection solutions={solutions} />
            </Card>
          )}

          {/* Glass Type Selector (Step 2) - Filtered by solution if selected */}
          <Card className="p-6">
            <GlassTypeSelectorSection glassTypes={glassTypes} selectedSolutionId={selectedSolution} />
          </Card>

          <Card className="p-6">
            <DimensionsSection
              dimensions={{
                maxHeight: model.maxHeightMm,
                maxWidth: model.maxWidthMm,
                minHeight: model.minHeightMm,
                minWidth: model.minWidthMm,
              }}
            />
          </Card>

          {/* Services Section - Only show if services are available (Don't Make Me Think principle) */}
          {services.length > 0 && (
            <Card className="p-6">
              <ServicesSelectorSection services={services} />
            </Card>
          )}

          <QuoteSummary
            basePrice={model.basePrice}
            calculatedPrice={calculatedPrice}
            currency={currency}
            error={error}
            isCalculating={isCalculating}
          />
        </div>
      </form>
    </Form>
  );
}
