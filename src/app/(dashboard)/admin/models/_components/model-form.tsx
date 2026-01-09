"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { type Resolver, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useModelCatalogData } from "../_hooks/use-model-catalog-data";
import { useModelMutations } from "../_hooks/use-model-mutations";
import { modelFormSchema } from "../_schemas/model-form.schema";
import {
  getModelFormDefaults,
  type ModelFormValues,
  transformModelFormValues,
} from "../_utils/model-form.utils";
import { BasicInfoSection } from "./basic-info-section";
import { CostNotesSection } from "./cost-notes-section";
import { DimensionsSection } from "./dimensions-section";
import { GlassTypesSection } from "./glass-types-section";
import { ImageGallerySectionComponent } from "./image-gallery-section";
import { PricingSection } from "./pricing-section";

type ModelFormProps = {
  mode: "create" | "edit";
  initialData?: Partial<ModelFormValues>;
  modelId?: string;
};

export function ModelForm({ mode, initialData, modelId }: ModelFormProps) {
  const { suppliers, glassTypes } = useModelCatalogData();
  const { createModel, updateModel, isCreating, isUpdating } =
    useModelMutations();

  const form = useForm<ModelFormValues>({
    defaultValues: getModelFormDefaults(initialData),
    resolver: zodResolver(modelFormSchema) as Resolver<ModelFormValues>,
    mode: "onBlur",
  });

  const handleSubmit = (values: ModelFormValues) => {
    const transformedValues = transformModelFormValues(values);

    if (mode === "create") {
      createModel(transformedValues);
    } else if (modelId) {
      updateModel({
        data: transformedValues,
        id: modelId,
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Main Form Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Basic Info (spans 2 columns on large screens) */}
          <div className="space-y-6 lg:col-span-2">
            <BasicInfoSection suppliers={suppliers} />
            <ImageGallerySectionComponent />
            <DimensionsSection />
            <PricingSection />
          </div>

          {/* Right Column - Glass Types & Notes */}
          <div className="space-y-6">
            <GlassTypesSection glassTypes={glassTypes} />
            <CostNotesSection />
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4 rounded-lg border bg-card p-4 shadow-lg">
          <div className="text-red-600 text-sm">
            <ul className="list-disc space-y-1 pl-5">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field}>{error?.message ?? "Error"}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/models">Cancelar</Link>
            </Button>
            <Button disabled={isLoading} type="submit">
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "create" ? "Crear Modelo" : "Actualizar Modelo"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
