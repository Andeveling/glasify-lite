'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { api } from '@/trpc/react';
import { BasicInfoSection } from './basic-info-section';
import { CostNotesSection } from './cost-notes-section';
import { DimensionsSection } from './dimensions-section';
import { GlassTypesSection } from './glass-types-section';
import { ImageGallerySectionComponent } from './image-gallery-section';
import { PricingSection } from './pricing-section';

// Constants
const MIN_DIMENSION_MM = 100;
const MAX_PROFIT_MARGIN = 100;
const DEFAULT_MIN_WIDTH_MM = 600;
const DEFAULT_MAX_WIDTH_MM = 2000;
const DEFAULT_MIN_HEIGHT_MM = 800;
const DEFAULT_MAX_HEIGHT_MM = 2200;
const FIVE_MINUTES_MS = 300_000; // 5 minutes stale time for catalog data

const modelFormSchema = z.object({
  accessoryPrice: z.number().min(0).optional().nullable(),
  basePrice: z.number().min(0),
  compatibleGlassTypeIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un tipo de vidrio'),
  costNotes: z.string().optional().nullable(),
  costPerMmHeight: z.number().min(0),
  costPerMmWidth: z.number().min(0),
  glassDiscountHeightMm: z.number().int().min(0).default(0),
  glassDiscountWidthMm: z.number().int().min(0).default(0),
  imageUrl: z
    .union([
      z.url('URL de imagen debe ser válida'), // Absolute URLs
      z.string().regex(/^\/[^\s]*$/, 'La ruta de la imagen debe comenzar con /'), // Relative paths starting with /
      z.literal(''), // Empty string
      z.null(),
      z.undefined(),
    ])
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  lastCostReviewDate: z.date().optional().nullable(),
  maxHeightMm: z.number().int().min(MIN_DIMENSION_MM),
  maxWidthMm: z.number().int().min(MIN_DIMENSION_MM),
  minHeightMm: z.number().int().min(MIN_DIMENSION_MM),
  minWidthMm: z.number().int().min(MIN_DIMENSION_MM),
  name: z.string().min(1, 'El nombre es requerido'),
  profileSupplierId: z.string().optional().nullable(),
  profitMarginPercentage: z.number().min(0).max(MAX_PROFIT_MARGIN).optional().nullable(),
  status: z.enum([ 'draft', 'published' ]),
});

type ModelFormValues = z.infer<typeof modelFormSchema>;

interface ModelFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ModelFormValues>;
  modelId?: string;
}

export function ModelForm({ mode, initialData, modelId }: ModelFormProps) {
  const router = useRouter();
  const utils = api.useUtils();

  // Suppliers query with 5-minute stale time (rarely changes)
  const { data: suppliersData } = api.admin[ 'profile-supplier' ].list.useQuery(
    {
      limit: 100,
      page: 1,
      sortBy: 'name',
      sortOrder: 'asc',
    },
    {
      staleTime: FIVE_MINUTES_MS,
    }
  );

  // Glass types query with 5-minute stale time (rarely changes)
  const { data: glassTypesData } = api.admin[ 'glass-type' ].list.useQuery(
    {
      limit: 100,
      page: 1,
      sortBy: 'name',
      sortOrder: 'asc',
    },
    {
      staleTime: FIVE_MINUTES_MS,
    }
  );

  const createMutation = api.admin.model.create.useMutation({
    onError: (error) => {
      toast.error(`Error al crear modelo: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Modelo creado exitosamente');
      // SSR two-step pattern: invalidate cache + refresh server data
      void utils.admin.model.list.invalidate();
      router.refresh(); // Force re-fetch server data
      router.push('/admin/models');
    },
  });

  const updateMutation = api.admin.model.update.useMutation({
    onError: (error) => {
      toast.error(`Error al actualizar modelo: ${error.message}`);
    },
    onSuccess: (data) => {
      toast.success('Modelo actualizado exitosamente');
      // SSR two-step pattern: invalidate cache + refresh server data
      void utils.admin.model.list.invalidate();
      void utils.admin.model[ 'get-by-id' ].invalidate({ id: data.id });
      router.refresh(); // Force re-fetch server data
      router.push('/admin/models');
    },
  });

  const form = useForm<ModelFormValues>({
    defaultValues: {
      accessoryPrice: initialData?.accessoryPrice ?? null,
      basePrice: initialData?.basePrice ?? MIN_DIMENSION_MM,
      compatibleGlassTypeIds: initialData?.compatibleGlassTypeIds ?? [],
      costNotes: initialData?.costNotes ?? null,
      costPerMmHeight: initialData?.costPerMmHeight ?? 0,
      costPerMmWidth: initialData?.costPerMmWidth ?? 0,
      glassDiscountHeightMm: initialData?.glassDiscountHeightMm ?? 0,
      glassDiscountWidthMm: initialData?.glassDiscountWidthMm ?? 0,
      imageUrl: initialData?.imageUrl ?? undefined,
      lastCostReviewDate: initialData?.lastCostReviewDate ?? null,
      maxHeightMm: initialData?.maxHeightMm ?? DEFAULT_MAX_HEIGHT_MM,
      maxWidthMm: initialData?.maxWidthMm ?? DEFAULT_MAX_WIDTH_MM,
      minHeightMm: initialData?.minHeightMm ?? DEFAULT_MIN_HEIGHT_MM,
      minWidthMm: initialData?.minWidthMm ?? DEFAULT_MIN_WIDTH_MM,
      name: initialData?.name ?? '',
      profileSupplierId: initialData?.profileSupplierId ?? null,
      profitMarginPercentage: initialData?.profitMarginPercentage ?? null,
      status: initialData?.status ?? 'draft',
    },
    // @ts-expect-error - Zod .default() causes type inference issues with react-hook-form
    resolver: zodResolver(modelFormSchema),
  });

  const handleSubmit = (values: ModelFormValues) => {
    // Transform null to undefined for backend compatibility
    const transformedValues = {
      ...values,
      accessoryPrice: values.accessoryPrice ?? undefined,
      costNotes: values.costNotes ?? undefined,
      imageUrl: values.imageUrl ?? undefined,
      lastCostReviewDate: values.lastCostReviewDate ?? undefined,
      profileSupplierId: values.profileSupplierId ?? undefined,
      profitMarginPercentage: values.profitMarginPercentage ?? undefined,
    };

    if (mode === 'create') {
      createMutation.mutate(transformedValues);
    } else if (modelId) {
      updateMutation.mutate({
        data: transformedValues,
        id: modelId,
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const suppliers = suppliersData?.items ?? [];
  const glassTypes = glassTypesData?.items ?? [];

  return (
    <Form {...form}>
      {/* @ts-expect-error - Type mismatch between Zod schema with .default() and react-hook-form inference */}
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
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-4 rounded-lg border bg-card p-4 shadow-lg">
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
