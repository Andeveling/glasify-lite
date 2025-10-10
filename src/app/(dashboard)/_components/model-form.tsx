'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/trpc/react';

// Constants to avoid magic numbers
const MIN_DIMENSION = 100;
const MAX_DIMENSION = 5000;
const MAX_NAME_LENGTH = 100;
const MAX_PRICE = 999_999;
const MAX_COST_PER_MM = 100;
const DEFAULT_MIN_DIMENSION = 200;
const DEFAULT_MAX_DIMENSION = 2000;

// Simplified Zod schema matching admin.model-upsert input schema
const modelFormSchema = z
  .object({
    accessoryPrice: z.number().min(0).optional().nullable(),
    basePrice: z
      .number()
      .min(0, 'El precio base debe ser mayor o igual a 0')
      .max(MAX_PRICE, `El precio base no debe exceder ${MAX_PRICE.toLocaleString()}`),
    compatibleGlassTypeIds: z
      .array(z.string().cuid('ID del tipo de vidrio debe ser válido'))
      .min(1, 'Debe seleccionar al menos un tipo de vidrio compatible'),
    costPerMmHeight: z
      .number()
      .min(0, 'El costo por mm de altura debe ser mayor o igual a 0')
      .max(MAX_COST_PER_MM, `El costo por mm de altura no debe exceder ${MAX_COST_PER_MM}`),
    costPerMmWidth: z
      .number()
      .min(0, 'El costo por mm de ancho debe ser mayor o igual a 0')
      .max(MAX_COST_PER_MM, `El costo por mm de ancho no debe exceder ${MAX_COST_PER_MM}`),
    id: z.string().cuid().optional(),
    maxHeightMm: z
      .number()
      .int()
      .min(MIN_DIMENSION, `La altura máxima debe ser al menos ${MIN_DIMENSION}mm`)
      .max(MAX_DIMENSION, `La altura máxima no debe exceder ${MAX_DIMENSION}mm`),
    maxWidthMm: z
      .number()
      .int()
      .min(MIN_DIMENSION, `El ancho máximo debe ser al menos ${MIN_DIMENSION}mm`)
      .max(MAX_DIMENSION, `El ancho máximo no debe exceder ${MAX_DIMENSION}mm`),
    minHeightMm: z
      .number()
      .int()
      .min(MIN_DIMENSION, `La altura mínima debe ser al menos ${MIN_DIMENSION}mm`)
      .max(MAX_DIMENSION, `La altura mínima no debe exceder ${MAX_DIMENSION}mm`),
    minWidthMm: z
      .number()
      .int()
      .min(MIN_DIMENSION, `El ancho mínimo debe ser al menos ${MIN_DIMENSION}mm`)
      .max(MAX_DIMENSION, `El ancho mínimo no debe exceder ${MAX_DIMENSION}mm`),
    name: z
      .string()
      .min(1, 'El nombre del modelo es requerido')
      .max(MAX_NAME_LENGTH, `El nombre no debe exceder ${MAX_NAME_LENGTH} caracteres`),
    profileSupplierId: z.string().cuid('ID del proveedor de perfiles debe ser válido').optional().nullable(),
    status: z.enum(['draft', 'published']),
  })
  .refine((data) => data.minWidthMm < data.maxWidthMm, {
    message: 'El ancho mínimo debe ser menor al ancho máximo',
    path: ['maxWidthMm'],
  })
  .refine((data) => data.minHeightMm < data.maxHeightMm, {
    message: 'La altura mínima debe ser menor a la altura máxima',
    path: ['maxHeightMm'],
  });

type ModelFormData = z.infer<typeof modelFormSchema>;

type ModelFormProps = {
  modelData?: Partial<ModelFormData>;
  onSuccess?: (result: { modelId: string; status: 'draft' | 'published' }) => void;
  onCancel?: () => void;
};

type ModelFormApi = UseFormReturn<ModelFormData, unknown, ModelFormData>;

type ModelFormControllerArgs = Pick<ModelFormProps, 'modelData' | 'onSuccess'>;

// Mock data for development - in a real app this would come from the API
const MOCK_GLASS_TYPES = [
  { id: 'cm1glass123456789abcdef01', name: 'Vidrio Templado 6mm' },
  { id: 'cm1glass234567890bcdef012', name: 'Vidrio Laminado 8mm' },
  { id: 'cm1glass345678901cdef0123', name: 'Doble Vidriado Hermético' },
];

function useModelFormController({ modelData, onSuccess }: ModelFormControllerArgs) {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile suppliers from tRPC
  const { data: profileSuppliers, isLoading: isLoadingSuppliers } = api.profileSupplier.list.useQuery({
    isActive: true,
  });

  // Use the actual admin.model-upsert mutation
  const modelUpsertMutation = api.admin['model-upsert'].useMutation({
    onError: () => {
      setIsLoading(false);
    },
    onSuccess: (result) => {
      setIsLoading(false);
      onSuccess?.(result);
    },
  });

  // React Hook Form setup
  const form = useForm<ModelFormData, unknown, ModelFormData>({
    defaultValues: {
      accessoryPrice: modelData?.accessoryPrice ?? null,
      basePrice: modelData?.basePrice ?? 0,
      compatibleGlassTypeIds: modelData?.compatibleGlassTypeIds ?? [],
      costPerMmHeight: modelData?.costPerMmHeight ?? 0,
      costPerMmWidth: modelData?.costPerMmWidth ?? 0,
      id: modelData?.id,
      maxHeightMm: modelData?.maxHeightMm ?? DEFAULT_MAX_DIMENSION,
      maxWidthMm: modelData?.maxWidthMm ?? DEFAULT_MAX_DIMENSION,
      minHeightMm: modelData?.minHeightMm ?? DEFAULT_MIN_DIMENSION,
      minWidthMm: modelData?.minWidthMm ?? DEFAULT_MIN_DIMENSION,
      name: modelData?.name ?? '',
      profileSupplierId: modelData?.profileSupplierId ?? null,
      status: modelData?.status ?? 'draft',
    },
    resolver: zodResolver(modelFormSchema),
  });

  const handleSubmit = form.handleSubmit(async (data: ModelFormData) => {
    setIsLoading(true);

    try {
      await modelUpsertMutation.mutateAsync(data);
    } catch (_error) {
      // Error handling is done in the mutation callbacks
    }
  });

  const isEditing = Boolean(modelData?.id);

  return { form, handleSubmit, isEditing, isLoading, isLoadingSuppliers, profileSuppliers };
}

export function ModelForm({ modelData, onSuccess, onCancel }: ModelFormProps) {
  const { form, handleSubmit, isEditing, isLoading, isLoadingSuppliers, profileSuppliers } = useModelFormController({
    modelData,
    onSuccess,
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Modelo' : 'Crear Nuevo Modelo'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Modifica los datos del modelo de vidrio existente'
            : 'Ingresa los datos del nuevo modelo de vidrio'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <BasicInfoSection form={form} isLoadingSuppliers={isLoadingSuppliers} profileSuppliers={profileSuppliers} />

            {/* Compatible Glass Types */}
            <GlassTypesSection form={form} />

            {/* Dimensions */}
            <DimensionsSection form={form} />

            {/* Pricing */}
            <PricingSection form={form} />

            {/* Form Actions */}
            <div className="flex gap-3 pt-6">
              <Button className="min-w-[120px]" disabled={isLoading} type="submit">
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Actualizar' : 'Crear'} Modelo
              </Button>

              {onCancel && (
                <Button disabled={isLoading} onClick={onCancel} type="button" variant="outline">
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function BasicInfoSection({
  form,
  isLoadingSuppliers,
  profileSuppliers,
}: {
  form: ModelFormApi;
  isLoadingSuppliers: boolean;
  profileSuppliers?: Array<{ id: string; name: string }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Información Básica</h3>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Modelo</FormLabel>
            <FormControl>
              <Input placeholder="ej. Vidrio Templado 6mm" {...field} />
            </FormControl>
            <FormDescription>Nombre descriptivo del modelo de vidrio</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profileSupplierId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Proveedor de Perfiles (Opcional)</FormLabel>
            <Select disabled={isLoadingSuppliers} onValueChange={field.onChange} value={field.value ?? undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={isLoadingSuppliers ? 'Cargando proveedores...' : 'Seleccionar proveedor (opcional)'}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Sin proveedor asignado</SelectItem>
                {profileSuppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>Proveedor de perfiles para este modelo. Puede dejarse sin asignar.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="draft">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Borrador</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="published">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Publicado</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>Los modelos publicados aparecen en el catálogo público</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function GlassTypesSection({ form }: { form: ModelFormApi }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Tipos de Vidrio Compatibles</h3>

      <FormField
        control={form.control}
        name="compatibleGlassTypeIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipos de Vidrio</FormLabel>
            <FormDescription>Selecciona los tipos de vidrio compatibles con este modelo (mínimo 1)</FormDescription>
            <div className="grid grid-cols-1 gap-2">
              {MOCK_GLASS_TYPES.map((glassType) => (
                <label
                  className="flex cursor-pointer items-center space-x-2 rounded-md border border-input p-2 hover:bg-accent"
                  key={glassType.id}
                >
                  <input
                    checked={field.value.includes(glassType.id)}
                    className="h-4 w-4"
                    onChange={(e) => {
                      const updatedValue = e.target.checked
                        ? [...field.value, glassType.id]
                        : field.value.filter((id: string) => id !== glassType.id);
                      field.onChange(updatedValue);
                    }}
                    type="checkbox"
                  />
                  <span className="text-sm">{glassType.name}</span>
                </label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function DimensionsSection({ form }: { form: ModelFormApi }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Dimensiones (mm)</h3>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="minWidthMm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ancho Mínimo</FormLabel>
              <FormControl>
                <Input
                  max={MAX_DIMENSION}
                  min={MIN_DIMENSION}
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
              <FormLabel>Ancho Máximo</FormLabel>
              <FormControl>
                <Input
                  max={MAX_DIMENSION}
                  min={MIN_DIMENSION}
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
          name="minHeightMm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Altura Mínima</FormLabel>
              <FormControl>
                <Input
                  max={MAX_DIMENSION}
                  min={MIN_DIMENSION}
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
              <FormLabel>Altura Máxima</FormLabel>
              <FormControl>
                <Input
                  max={MAX_DIMENSION}
                  min={MIN_DIMENSION}
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function PricingSection({ form }: { form: ModelFormApi }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Configuración de Precios</h3>

      <FormField
        control={form.control}
        name="basePrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio Base</FormLabel>
            <FormControl>
              <Input
                max={MAX_PRICE}
                min="0"
                step="0.01"
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>Precio fijo base antes de cálculos por dimensión</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="costPerMmWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo por mm Ancho</FormLabel>
              <FormControl>
                <Input
                  max={MAX_COST_PER_MM}
                  min="0"
                  step="0.001"
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
          name="costPerMmHeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo por mm Altura</FormLabel>
              <FormControl>
                <Input
                  max={MAX_COST_PER_MM}
                  min="0"
                  step="0.001"
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="accessoryPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio de Accesorios (Opcional)</FormLabel>
            <FormControl>
              <Input
                max={MAX_PRICE}
                min="0"
                step="0.01"
                type="number"
                {...field}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? null : Number(value));
                }}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>Precio adicional por accesorios incluidos</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
