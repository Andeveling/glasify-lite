/**
 * Glass Type Form Component (US8 - T069 - Refactored)
 *
 * Form for creating/editing glass types with SOLID principles:
 * - Accordion sections: Basic Info, Thermal Properties, Solutions, Characteristics
 * - React Hook Form + Zod validation
 * - Separated concerns: hooks for logic, components for UI
 *
 * Architecture:
 * - Custom hooks handle form state, mutations, and data transformation
 * - Section components (organisms) encapsulate related fields
 * - Field components (molecules) provide reusable form inputs
 * - Main component orchestrates composition
 */

'use client';

import { useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Form } from '@/components/ui/form';
import type { GetGlassTypeByIdOutput } from '@/lib/validations/admin/glass-type.schema';
import { useGlassTypeForm } from '../_hooks/use-glass-type-form';
import { FormActions } from './form-actions';
import { BasicInfoSection } from './sections/basic-info-section';
import { CharacteristicsSection } from './sections/characteristics-section';
import { SolutionsSection } from './sections/solutions-section';
import { ThermalPropertiesSection } from './sections/thermal-properties-section';

type GlassTypeFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: GetGlassTypeByIdOutput;
};

/**
 * Main glass type form component
 * Orchestrates form sections and handles submission
 */
export function GlassTypeForm({ mode, defaultValues }: GlassTypeFormProps) {
  const router = useRouter();
  const { form, handleSubmit, isLoading } = useGlassTypeForm({
    defaultValues,
    mode,
  });

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <Accordion className="space-y-4" defaultValue={['basic']} type="multiple">
          {/* Basic Information Section */}
          <AccordionItem value="basic">
            <AccordionTrigger className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80">
              <span className="font-semibold text-lg">Información Básica</span>
            </AccordionTrigger>
            <AccordionContent>
              <BasicInfoSection control={form.control} />
            </AccordionContent>
          </AccordionItem>

          {/* Thermal Properties Section */}
          <AccordionItem value="thermal">
            <AccordionTrigger className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80">
              <span className="font-semibold text-lg">Propiedades Térmicas y Ópticas</span>
            </AccordionTrigger>
            <AccordionContent>
              <ThermalPropertiesSection control={form.control} />
            </AccordionContent>
          </AccordionItem>

          {/* Solutions Section */}
          <AccordionItem value="solutions">
            <AccordionTrigger className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80">
              <span className="font-semibold text-lg">Soluciones</span>
            </AccordionTrigger>
            <AccordionContent>
              <SolutionsSection />
            </AccordionContent>
          </AccordionItem>

          {/* Characteristics Section */}
          <AccordionItem value="characteristics">
            <AccordionTrigger className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80">
              <span className="font-semibold text-lg">Características</span>
            </AccordionTrigger>
            <AccordionContent>
              <CharacteristicsSection />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Form Actions */}
        <FormActions isLoading={isLoading} mode={mode} onCancel={() => router.back()} />
      </form>
    </Form>
  );
}
