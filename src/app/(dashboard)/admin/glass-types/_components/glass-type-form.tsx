/**
 * Glass Type Form Component (US8 - T069)
 *
 * Form for creating/editing glass types with:
 * - Accordion sections: Basic Info, Thermal Properties, Solutions, Characteristics
 * - React Hook Form + Zod validation
 * - Dynamic solution and characteristic arrays
 *
 * NOTE: This is a placeholder - full implementation with SolutionSelector and
 * CharacteristicSelector components will be added in T070 and T071
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { GlassPurpose } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createGlassTypeSchema, type GetGlassTypeByIdOutput } from '@/lib/validations/admin/glass-type.schema';
import { api } from '@/trpc/react';
import { CharacteristicSelector } from './characteristic-selector';
import { SolutionSelector } from './solution-selector';

type GlassTypeFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: GetGlassTypeByIdOutput;
};

const DEFAULT_THICKNESS_MM = 6;

// Form values type - use z.input to get the input type (with defaults applied)
type GlassTypeFormValues = z.input<typeof createGlassTypeSchema>;

// Helper type to ensure isActive is always boolean in form defaults
type FormDefaults = Omit<Partial<GlassTypeFormValues>, 'isActive'> & { isActive: boolean };

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Form component with multiple sections requires extensive setup
export function GlassTypeForm({ mode, defaultValues }: GlassTypeFormProps) {
  const router = useRouter();

  // Prepare form defaults ensuring isActive is always boolean
  const formDefaults: FormDefaults = {
    characteristics:
      defaultValues?.characteristics.map((c) => ({
        certification: c.certification ?? undefined,
        characteristicId: c.characteristicId,
        notes: c.notes ?? undefined,
        value: c.value ?? undefined,
      })) ?? [],
    description: defaultValues?.description ?? undefined,
    glassSupplierId: defaultValues?.glassSupplierId ?? undefined,
    isActive: defaultValues?.isActive ?? true, // Always boolean
    lastReviewDate: defaultValues?.lastReviewDate ?? undefined,
    lightTransmission:
      defaultValues?.lightTransmission !== null && defaultValues?.lightTransmission !== undefined
        ? Number(defaultValues.lightTransmission)
        : undefined,
    name: defaultValues?.name ?? '',
    pricePerSqm:
      defaultValues?.pricePerSqm !== null && defaultValues?.pricePerSqm !== undefined
        ? Number(defaultValues.pricePerSqm)
        : 0,
    purpose: (defaultValues?.purpose as GlassPurpose) ?? 'general',
    sku: defaultValues?.sku ?? undefined,
    solarFactor:
      defaultValues?.solarFactor !== null && defaultValues?.solarFactor !== undefined
        ? Number(defaultValues.solarFactor)
        : undefined,
    solutions:
      defaultValues?.solutions.map((s) => ({
        isPrimary: s.isPrimary,
        notes: s.notes ?? undefined,
        performanceRating: s.performanceRating,
        solutionId: s.solutionId,
      })) ?? [],
    thicknessMm: defaultValues?.thicknessMm ?? DEFAULT_THICKNESS_MM,
    uValue:
      defaultValues?.uValue !== null && defaultValues?.uValue !== undefined ? Number(defaultValues.uValue) : undefined,
  };

  const form = useForm<GlassTypeFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(createGlassTypeSchema),
  });

  const createMutation = api.admin['glass-type'].create.useMutation({
    onError: (err) => {
      toast.error('Error al crear tipo de vidrio', {
        description: err.message,
      });
    },
    onSuccess: () => {
      toast.success('Tipo de vidrio creado correctamente');
      router.push('/admin/glass-types');
      router.refresh();
    },
  });

  const updateMutation = api.admin['glass-type'].update.useMutation({
    onError: (err) => {
      toast.error('Error al actualizar tipo de vidrio', {
        description: err.message,
      });
    },
    onSuccess: () => {
      toast.success('Tipo de vidrio actualizado correctamente');
      router.push('/admin/glass-types');
      router.refresh();
    },
  });

  const onSubmit = (data: GlassTypeFormValues) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else if (defaultValues) {
      updateMutation.mutate({
        data,
        id: defaultValues.id,
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Accordion className="space-y-4" defaultValue={['basic']} type="multiple">
          {/* Basic Information Section */}
          <AccordionItem value="basic">
            <AccordionTrigger className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80">
              <span className="font-semibold text-lg">Información Básica</span>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Vidrio Templado 6mm" {...field} />
                        </FormControl>
                        <FormDescription>Nombre descriptivo del tipo de vidrio</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Thickness */}
                  <FormField
                    control={form.control}
                    name="thicknessMm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Espesor (mm) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            max={50}
                            min={1}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            type="number"
                          />
                        </FormControl>
                        <FormDescription>1-50mm</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price per sqm */}
                  <FormField
                    control={form.control}
                    name="pricePerSqm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio por m² *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            min={0}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            step={0.01}
                            type="number"
                          />
                        </FormControl>
                        <FormDescription>Precio de referencia</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Purpose */}
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Propósito *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un propósito" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="insulation">Aislamiento</SelectItem>
                            <SelectItem value="security">Seguridad</SelectItem>
                            <SelectItem value="decorative">Decorativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Clasificación de uso (legacy)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SKU */}
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: VT-6MM-001" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormDescription>Código del proveedor (opcional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[100px]"
                            placeholder="Descripción detallada del tipo de vidrio..."
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>Información adicional (opcional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Is Active */}
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Activo</FormLabel>
                          <FormDescription>El tipo de vidrio está disponible para selección</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Thermal Properties Section */}
          <AccordionItem value="thermal">
            <AccordionTrigger className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80">
              <span className="font-semibold text-lg">Propiedades Térmicas y Ópticas</span>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
                  {/* U-Value */}
                  <FormField
                    control={form.control}
                    name="uValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor U (W/m²·K)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            max={10}
                            min={0}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            step={0.01}
                            type="number"
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>Transmitancia térmica (opcional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Solar Factor */}
                  <FormField
                    control={form.control}
                    name="solarFactor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Factor Solar (g)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            max={1}
                            min={0}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            step={0.01}
                            type="number"
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>0.00-1.00 (opcional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Light Transmission */}
                  <FormField
                    control={form.control}
                    name="lightTransmission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transmisión de Luz</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            max={1}
                            min={0}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            step={0.01}
                            type="number"
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>0.00-1.00 (opcional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Solutions Section - T070 Implemented */}
          <AccordionItem value="solutions">
            <AccordionTrigger className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80">
              <span className="font-semibold text-lg">Soluciones</span>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <SolutionSelector />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Characteristics Section - T071 Implemented */}
          <AccordionItem value="characteristics">
            <AccordionTrigger className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80">
              <span className="font-semibold text-lg">Características</span>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <CharacteristicSelector />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button onClick={() => router.back()} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={isLoading} type="submit">
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {mode === 'create' ? 'Crear Tipo de Vidrio' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
