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
import { useSolutionInference } from '../../_hooks/use-solution-inference';
import { createQuoteFormSchema, type QuoteFormValues } from '../../_utils/validation';
import { StickyPriceHeader } from '../sticky-price-header';
import { AddedToCartActions } from './added-to-cart-actions';
import { QuoteSummary } from './quote-summary';
import { DimensionsSection } from './sections/dimensions-section';
import { GlassTypeSelectorSection } from './sections/glass-type-selector-section';
import { ServicesSelectorSection } from './sections/services-selector-section';

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

  // ✅ Get selected glass type object
  const selectedGlassType = glassTypes.find((gt) => gt.id === glassType);

  // ✅ Infer solution from glass type (replaces manual selection)
  const { inferredSolution, securityRating, thermalRating, acousticRating } = useSolutionInference(
    selectedGlassType ?? null,
    solutions
  );

  // Calculate price in real-time
  const { calculatedPrice, breakdown, error, isCalculating } = usePriceCalculation({
    additionalServices,
    glassTypeId: glassType,
    heightMm: Number(height) || 0,
    modelId: model.id,
    widthMm: Number(width) || 0,
  });

  // ✅ Build detailed price breakdown for popover
  const priceBreakdown = useMemo(() => {
    const items: Array<{ amount: number; category: 'model' | 'glass' | 'service' | 'adjustment'; label: string }> = [];

    if (!breakdown) {
      // Fallback: show base price only
      items.push({
        amount: Number(model.basePrice),
        category: 'model',
        label: 'Precio base del modelo',
      });
      return items;
    }

    // Calculate glass cost separately (area * pricePerSqm)
    const widthM = Number(width) / 1000;
    const heightM = Number(height) / 1000;
    const glassArea = widthM * heightM;
    const glassCost = selectedGlassType ? glassArea * selectedGlassType.pricePerSqm : 0;

    // Model price (dimPrice includes base + area factor, but NOT glass cost)
    const modelOnlyPrice = breakdown.dimPrice - glassCost;

    if (modelOnlyPrice > 0) {
      items.push({
        amount: modelOnlyPrice,
        category: 'model',
        label: 'Precio base del modelo',
      });
    }

    // Glass cost (separate line item for clarity)
    if (glassCost > 0 && selectedGlassType) {
      items.push({
        amount: glassCost,
        category: 'glass',
        label: `Vidrio ${selectedGlassType.name}`,
      });
    }

    // Accessories
    if (breakdown.accPrice > 0) {
      items.push({
        amount: breakdown.accPrice,
        category: 'model',
        label: 'Accesorios',
      });
    }

    // Services
    if (breakdown.services.length > 0) {
      const servicesById = services.reduce(
        (acc, svc) => {
          acc[svc.id] = svc;
          return acc;
        },
        {} as Record<string, ServiceOutput>
      );

      for (const svc of breakdown.services) {
        const serviceData = servicesById[svc.serviceId];
        if (serviceData) {
          items.push({
            amount: svc.amount,
            category: 'service',
            label: serviceData.name,
          });
        }
      }
    }

    // Adjustments
    if (breakdown.adjustments.length > 0) {
      for (const adj of breakdown.adjustments) {
        items.push({
          amount: adj.amount,
          category: 'adjustment',
          label: adj.concept,
        });
      }
    }

    return items;
  }, [breakdown, model.basePrice, services, width, height, selectedGlassType]);

  // ✅ Prepare cart item data from form values (using inferred solution)
  const cartItemInput: CreateCartItemInput & { unitPrice: number } = {
    additionalServiceIds: additionalServices,
    glassTypeId: glassType,
    glassTypeName: selectedGlassType?.name ?? '',
    heightMm: Number(height) || 0,
    modelId: model.id,
    modelName: model.name,
    quantity: 1, // Single item per add (user can increase in cart)
    solutionId: inferredSolution?.id || undefined,
    solutionName: inferredSolution?.nameEs || undefined,
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
        {/* ✅ Sticky Price Header - Always visible with config summary */}
        <StickyPriceHeader
          basePrice={model.basePrice}
          breakdown={priceBreakdown}
          configSummary={{
            glassTypeName: selectedGlassType?.name,
            heightMm: Number(height) || undefined,
            modelName: model.name,
            solutionName: inferredSolution?.nameEs,
            widthMm: Number(width) || undefined,
          }}
          currency={currency}
          currentPrice={calculatedPrice ?? model.basePrice}
        />

        <div className="space-y-6 pt-4">
          {/* ✅ Show success actions after adding to cart */}
          {justAddedToCart && (
            <AddedToCartActions
              modelName={model.name}
              onConfigureAnother={handleConfigureAnother}
              ref={successCardRef}
            />
          )}

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

          {/* Glass Type Selector with performance bars */}
          <Card className="p-6">
            <GlassTypeSelectorSection
              basePrice={model.basePrice}
              glassTypes={glassTypes}
              selectedSolutionId={inferredSolution?.id}
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
