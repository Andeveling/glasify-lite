'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import type {
  GlassSolutionOutput,
  GlassTypeOutput,
  ModelDetailOutput,
  ServiceOutput,
} from '@/server/api/routers/catalog';
import type { CreateCartItemInput } from '@/types/cart.types';
import { usePriceCalculation } from '../../_hooks/use-price-calculation';
import type { QuoteFormData } from '../../_types/model.types';
import { createQuoteFormSchema, type QuoteFormValues } from '../../_utils/validation';
import { AddToCartButton } from './add-to-cart-button';
import { QuoteSummary } from './quote-summary';
import { DimensionsSection } from './sections/dimensions-section';
import { GlassTypeSelectorSection } from './sections/glass-type-selector-section';
import { ServicesSelectorSection } from './sections/services-selector-section';
import { SolutionSelectorSection } from './sections/solution-selector-section';

type ModelFormProps = {
  model: ModelDetailOutput;
  glassTypes: GlassTypeOutput[];
  services: ServiceOutput[];
  solutions: GlassSolutionOutput[];
  onSubmit?: (data: QuoteFormData) => void;
};

export function ModelForm({ model, glassTypes, services, solutions, onSubmit }: ModelFormProps) {
  const [submittedData, setSubmittedData] = useState<QuoteFormData | null>(null);

  const schema = useMemo(() => createQuoteFormSchema(model), [model]);

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

  const handleSubmit = (data: QuoteFormValues) => {
    const formData: QuoteFormData = {
      additionalServices: data.additionalServices,
      glassType: data.glassType,
      height: String(data.height),
      quantity: String(data.quantity),
      width: String(data.width),
    };
    setSubmittedData(formData);
    onSubmit?.(formData);
  };

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

  return (
    <>
      <Form {...form}>
        {/* @ts-expect-error - zodResolver with z.coerce has type inference issues */}
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
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

          <Card className="p-6">
            <ServicesSelectorSection services={services} />
          </Card>

          <QuoteSummary
            basePrice={model.basePrice}
            calculatedPrice={calculatedPrice}
            currency={model.manufacturer?.currency ?? 'USD'}
            error={error}
            isCalculating={isCalculating}
          />

          {/* Add to Cart Button - Separate from quote summary */}
          <AddToCartButton
            isCalculating={isCalculating}
            isValid={form.formState.isValid && !error}
            item={cartItemInput}
          />
        </form>
      </Form>

      {submittedData && (
        <Card className="p-6">
          <h3 className="mb-3 font-semibold text-lg">Datos enviados (desarrollo):</h3>
          <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">{JSON.stringify(submittedData, null, 2)}</pre>
        </Card>
      )}
    </>
  );
}
