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
/** biome-ignore-all lint/suspicious/noConsole: <explanation> */

"use client";

import { FileText, Lightbulb, Star, ThermometerSun } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Form } from "@/components/ui/form";
import type { GetGlassTypeByIdOutput } from "@/lib/validations/admin/glass-type.schema";
import { useGlassTypeForm } from "../_hooks/use-glass-type-form";
import { FormActions } from "./form-actions";
import { BasicInfoSection } from "./sections/basic-info-section";
import { CharacteristicsSection } from "./sections/characteristics-section";
import { SolutionsSection } from "./sections/solutions-section";
import { ThermalPropertiesSection } from "./sections/thermal-properties-section";

type GlassTypeFormProps = {
  mode: "create" | "edit";
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

  console.log("defaultValues", defaultValues);

  return (
    <Form {...form}>
      {/* @ts-expect-error - Type mismatch between Zod schema and RHF Control types */}
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(handleSubmit, (errors) =>
          console.error("Form Errors:", errors)
        )}
      >
        <Accordion
          className="space-y-4"
          defaultValue={["basic"]}
          type="multiple"
        >
          {/* Basic Information Section */}
          <AccordionItem className="rounded-lg border" value="basic">
            <AccordionTrigger className="rounded-lg bg-gradient-to-r from-muted to-muted/50 px-4 py-3 transition-colors hover:bg-muted/80 hover:no-underline">
              <span className="flex items-center gap-2 font-semibold text-lg">
                <FileText aria-hidden="true" className="h-5 w-5" />
                <span>Información Básica</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-4">
              {/* @ts-expect-error - Type mismatch between specific and generic Control types */}
              <BasicInfoSection control={form.control} />
            </AccordionContent>
          </AccordionItem>

          {/* Thermal Properties Section */}
          <AccordionItem className="rounded-lg border" value="thermal">
            <AccordionTrigger className="rounded-lg bg-gradient-to-r from-muted to-muted/50 px-4 py-3 transition-colors hover:bg-muted/80 hover:no-underline">
              <span className="flex items-center gap-2 font-semibold text-lg">
                <ThermometerSun aria-hidden="true" className="h-5 w-5" />
                <span>Propiedades Térmicas y Ópticas</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-4">
              {/* @ts-expect-error - Type mismatch between specific and generic Control types */}
              <ThermalPropertiesSection control={form.control} />
            </AccordionContent>
          </AccordionItem>

          {/* Solutions Section */}
          <AccordionItem className="rounded-lg border" value="solutions">
            <AccordionTrigger className="rounded-lg bg-gradient-to-r from-muted to-muted/50 px-4 py-3 transition-colors hover:bg-muted/80 hover:no-underline">
              <span className="flex items-center gap-2 font-semibold text-lg">
                <Lightbulb aria-hidden="true" className="h-5 w-5" />
                <span>Soluciones</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-4">
              <SolutionsSection />
            </AccordionContent>
          </AccordionItem>

          {/* Characteristics Section */}
          <AccordionItem className="rounded-lg border" value="characteristics">
            <AccordionTrigger className="rounded-lg bg-gradient-to-r from-muted to-muted/50 px-4 py-3 transition-colors hover:bg-muted/80 hover:no-underline">
              <span className="flex items-center gap-2 font-semibold text-lg">
                <Star aria-hidden="true" className="h-5 w-5" />
                <span>Características</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-4">
              <CharacteristicsSection />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Form Actions */}
        <FormActions
          isLoading={isLoading}
          mode={mode}
          onCancel={() => router.back()}
        />
      </form>
    </Form>
  );
}
