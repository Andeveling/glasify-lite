'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import type { GlassTypeOutput, ModelDetailOutput, ServiceOutput } from '@/server/api/routers/catalog';
import { usePriceCalculation } from '../../_hooks/use-price-calculation';
import type { QuoteFormData } from '../../_types/model.types';
import { createQuoteFormSchema, type QuoteFormValues } from '../../_utils/validation';
import { QuoteSummary } from './quote-summary';
import { DimensionsSection } from './sections/dimensions-section';
import { GlassTypeSelectorSection } from './sections/glass-type-selector-section';
import { ServicesSelectorSection } from './sections/services-selector-section';

type ModelFormProps = {
  model: ModelDetailOutput;
  glassTypes: GlassTypeOutput[];
  services: ServiceOutput[];
  onSubmit?: (data: QuoteFormData) => void;
};

export function ModelForm({ model, glassTypes, services, onSubmit }: ModelFormProps) {
  const [submittedData, setSubmittedData] = useState<QuoteFormData | null>(null);

  const schema = useMemo(() => createQuoteFormSchema(model), [model]);

  const form = useForm<QuoteFormValues>({
    defaultValues: {
      additionalServices: [],
      glassType: '',
      height: 0,
      quantity: 1,
      width: 0,
    },
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

  return (
    <>
      <Form {...form}>
        {/* @ts-expect-error - zodResolver with z.coerce has type inference issues */}
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
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
            <GlassTypeSelectorSection glassTypes={glassTypes} />
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
