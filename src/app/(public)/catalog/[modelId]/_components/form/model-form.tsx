'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import type { Model, QuoteFormData } from '../../_types/model.types';
import { QuoteSummary } from './quote-summary';
import { DimensionsSection } from './sections/dimensions-section';
import { GlassTypeSelectorSection } from './sections/glass-type-selector-section';
import { ServicesSelectorSection } from './sections/services-selector-section';

type ModelFormProps = {
  model: Model;
  onSubmit?: (data: QuoteFormData) => void;
};

export function ModelForm({ model, onSubmit }: ModelFormProps) {
  const [ submittedData, setSubmittedData ] = useState<QuoteFormData | null>(null);

  const form = useForm<QuoteFormData>({
    defaultValues: {
      additionalServices: [],
      glassType: '',
      height: '',
      quantity: '1',
      width: '',
    },
  });

  const handleSubmit = (data: QuoteFormData) => {
    setSubmittedData(data);
    onSubmit?.(data);
  };

  return (
    <>
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <Card className="p-6">
            <DimensionsSection dimensions={model.dimensions} />
          </Card>

          <Card className="p-6">
            <GlassTypeSelectorSection />
          </Card>

          <Card className="p-6">
            <ServicesSelectorSection />
          </Card>

          <QuoteSummary basePrice={model.basePrice} currency={model.currency} />
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
