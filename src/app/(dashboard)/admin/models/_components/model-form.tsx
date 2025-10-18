/**
 * Model Form Component (US9 - T085)
 *
 * Form for creating/editing models with:
 * - Accordion sections: Basic Info, Dimensions, Pricing, Compatible Glass Types, Cost Notes
 * - React Hook Form + Zod validation
 * - Multi-select for compatible glass types
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { MaterialType, ModelStatus } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type CreateModelInput, createModelSchema } from '@/lib/validations/admin/model.schema';
import { api } from '@/trpc/react';

type ModelFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: {
    id: string;
    name: string;
    status: ModelStatus;
    profileSupplierId: string | null;
    minWidthMm: number;
    maxWidthMm: number;
    minHeightMm: number;
    maxHeightMm: number;
    basePrice: number;
    costPerMmWidth: number;
    costPerMmHeight: number;
    accessoryPrice: number | null;
    glassDiscountWidthMm: number;
    glassDiscountHeightMm: number;
    compatibleGlassTypeIds: string[];
    profitMarginPercentage: number | null;
    lastCostReviewDate: Date | null;
    costNotes: string | null;
  };
};

// Form values type
type ModelFormValues = CreateModelInput;

// Default dimension values (in mm)
const DEFAULT_MIN_WIDTH_MM = 600;
const DEFAULT_MAX_WIDTH_MM = 2000;
const DEFAULT_MIN_HEIGHT_MM = 800;
const DEFAULT_MAX_HEIGHT_MM = 2200;

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Form component with multiple sections requires extensive setup
export function ModelForm({ mode, defaultValues }: ModelFormProps) {
  const router = useRouter();

  // Fetch profile suppliers for dropdown
  const { data: suppliersData } = api.admin[ 'profile-supplier' ].list.useQuery({
    isActive: 'active',
    limit: 100,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Fetch glass types for multi-select
  const { data: glassTypesData } = api.admin[ 'glass-type' ].list.useQuery({
    isActive: 'active',
    limit: 100,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const form = useForm<ModelFormValues>({
    defaultValues: {
      accessoryPrice: defaultValues?.accessoryPrice ?? undefined,
      basePrice: defaultValues?.basePrice ?? 0,
      compatibleGlassTypeIds: defaultValues?.compatibleGlassTypeIds ?? [],
      costNotes: defaultValues?.costNotes ?? undefined,
      costPerMmHeight: defaultValues?.costPerMmHeight ?? 0,
      costPerMmWidth: defaultValues?.costPerMmWidth ?? 0,
      glassDiscountHeightMm: defaultValues?.glassDiscountHeightMm ?? 0,
      glassDiscountWidthMm: defaultValues?.glassDiscountWidthMm ?? 0,
      lastCostReviewDate: defaultValues?.lastCostReviewDate ?? undefined,
      maxHeightMm: defaultValues?.maxHeightMm ?? DEFAULT_MAX_HEIGHT_MM,
      maxWidthMm: defaultValues?.maxWidthMm ?? DEFAULT_MAX_WIDTH_MM,
      minHeightMm: defaultValues?.minHeightMm ?? DEFAULT_MIN_HEIGHT_MM,
      minWidthMm: defaultValues?.minWidthMm ?? DEFAULT_MIN_WIDTH_MM,
      name: defaultValues?.name ?? '',
      profileSupplierId: defaultValues?.profileSupplierId ?? undefined,
      profitMarginPercentage: defaultValues?.profitMarginPercentage ?? undefined,
      status: defaultValues?.status ?? 'draft',
    },
    // Align resolver types with the form values to avoid Control<> generic mismatches
    resolver: zodResolver(createModelSchema) as unknown as Resolver<ModelFormValues>,
  });

  const createMutation = api.admin.model.create.useMutation({
    onError: (err) => {
      toast.error('Error al crear modelo', {
        description: err.message,
      });
    },
    onSuccess: () => {
      toast.success('Modelo creado correctamente');
      router.push('/admin/models');
      router.refresh();
    },
  });

  const updateMutation = api.admin.model.update.useMutation({
    onError: (err) => {
      toast.error('Error al actualizar modelo', {
        description: err.message,
      });
    },
    onSuccess: () => {
      toast.success('Modelo actualizado correctamente');
      router.push('/admin/models');
      router.refresh();
    },
  });

  const handleSubmit = (data: ModelFormValues) => {
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
  const suppliers = suppliersData?.items ?? [];
  const glassTypes = glassTypesData?.items ?? [];

  // Material type labels
  const materialLabels: Record<MaterialType, string> = {
    ALUMINUM: 'Aluminio',
    MIXED: 'Mixto',
    PVC: 'PVC',
    WOOD: 'Madera',
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <Accordion className="space-y-4" defaultValue={[ 'basic' ]} type="multiple">
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
                          <Input placeholder="Ej: Ventana Corrediza PVC" {...field} />
                        </FormControl>
                        <FormDescription>Nombre descriptivo del modelo</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Borrador</SelectItem>
                            <SelectItem value="published">Publicado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Estado de publicación del modelo</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Profile Supplier */}
                  <FormField
                    control={form.control}
                    name="profileSupplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proveedor de Perfiles</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona proveedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Sin proveedor</SelectItem>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name} ({materialLabels[ supplier.materialType ]})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Proveedor del perfil de ventana/puerta</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Dimensions Section */}
          <AccordionItem value="dimensions">
            <AccordionTrigger className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80">
              <span className="font-semibold text-lg">Dimensiones</span>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
                  {/* Width Range */}
                  <FormField
                    control={form.control}
                    name="minWidthMm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ancho Mínimo (mm) *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="600"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxWidthMm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ancho Máximo (mm) *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2000"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Height Range */}
                  <FormField
                    control={form.control}
                    name="minHeightMm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alto Mínimo (mm) *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="800"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxHeightMm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alto Máximo (mm) *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2200"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Glass Discounts */}
                  <FormField
                    control={form.control}
                    name="glassDiscountWidthMm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descuento Vidrio Ancho (mm)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Descuento por lado para cálculo de vidrio</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="glassDiscountHeightMm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descuento Vidrio Alto (mm)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Descuento por lado para cálculo de vidrio</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Pricing Section */}
          <AccordionItem value="pricing">
            <AccordionTrigger className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80">
              <span className="font-semibold text-lg">Precios</span>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
                  {/* Base Price */}
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Base *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="150000"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Precio base del modelo (sin dimensiones)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cost Per mm Width */}
                  <FormField
                    control={form.control}
                    name="costPerMmWidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo por mm Ancho *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="50"
                            step="0.01"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Costo adicional por cada mm de ancho</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cost Per mm Height */}
                  <FormField
                    control={form.control}
                    name="costPerMmHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo por mm Alto *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="30"
                            step="0.01"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Costo adicional por cada mm de alto</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Accessory Price */}
                  <FormField
                    control={form.control}
                    name="accessoryPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Accesorios</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>Precio adicional por accesorios</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Profit Margin */}
                  <FormField
                    control={form.control}
                    name="profitMarginPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Margen de Ganancia (%)</FormLabel>
                        <FormControl>
                          <Input
                            max="100"
                            min="0"
                            placeholder="30"
                            step="0.01"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>Porcentaje de margen de ganancia (0-100%)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Compatible Glass Types Section */}
          <AccordionItem value="glassTypes">
            <AccordionTrigger className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80">
              <span className="font-semibold text-lg">Tipos de Vidrio Compatibles</span>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="compatibleGlassTypeIds"
                    render={() => (
                      <FormItem>
                        <FormLabel>Selecciona Tipos de Vidrio *</FormLabel>
                        <FormDescription>
                          Selecciona al menos un tipo de vidrio compatible con este modelo
                        </FormDescription>
                        <div className="grid gap-2 pt-2">
                          {glassTypes.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No hay tipos de vidrio activos disponibles</p>
                          ) : (
                            glassTypes.map((glassType) => (
                              <FormField
                                control={form.control}
                                key={glassType.id}
                                name="compatibleGlassTypeIds"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(glassType.id)}
                                        onCheckedChange={(checked) => {
                                          const currentValue = field.value ?? [];
                                          const newValue = checked
                                            ? [ ...currentValue, glassType.id ]
                                            : currentValue.filter((value) => value !== glassType.id);
                                          field.onChange(newValue);
                                        }}
                                      />
                                    </FormControl>
                                    <div className="flex-1 space-y-1 leading-none">
                                      <FormLabel className="font-normal">
                                        {glassType.name}
                                        <Badge className="ml-2" variant="outline">
                                          {glassType.thicknessMm}mm
                                        </Badge>
                                      </FormLabel>
                                      {glassType.description && (
                                        <p className="text-muted-foreground text-sm">{glassType.description}</p>
                                      )}
                                    </div>
                                  </FormItem>
                                )}
                              />
                            ))
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Cost Notes Section */}
          <AccordionItem value="costNotes">
            <AccordionTrigger className="rounded-lg bg-muted px-4 py-2 hover:bg-muted/80">
              <span className="font-semibold text-lg">Notas de Costos</span>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="costNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[100px]"
                            placeholder="Notas sobre la estructura de costos, proveedores, etc."
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>Información adicional sobre los costos del modelo</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastCostReviewDate"
                    render={({ field }) => {
                      let dateValue = '';
                      if (field.value instanceof Date) {
                        dateValue = field.value.toISOString().split('T')[ 0 ] ?? '';
                      } else if (field.value) {
                        dateValue = new Date(field.value).toISOString().split('T')[ 0 ] ?? '';
                      }

                      return (
                        <FormItem className="mt-4">
                          <FormLabel>Fecha Última Revisión de Costos</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                              value={dateValue}
                            />
                          </FormControl>
                          <FormDescription>Última fecha de revisión de costos y precios</FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button onClick={() => router.push('/admin/models')} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={isLoading} type="submit">
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {mode === 'create' ? 'Crear Modelo' : 'Actualizar Modelo'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
