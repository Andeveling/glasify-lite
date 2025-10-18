'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { GlassSolution } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  createGlassSolutionSchema,
  MAX_KEY_LENGTH,
  MAX_NAME_LENGTH,
  MAX_SORT_ORDER,
  MIN_KEY_LENGTH,
  MIN_NAME_LENGTH,
  MIN_SORT_ORDER,
} from '@/lib/validations/admin/glass-solution.schema';
import { api } from '@/trpc/react';

type GlassSolutionFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: GlassSolution;
};

type FormValues = {
  key: string;
  name: string;
  nameEs: string;
  description?: string;
  sortOrder?: number;
  icon?: string | null;
  isActive?: boolean;
};

export function GlassSolutionForm({ mode, defaultValues }: GlassSolutionFormProps) {
  const router = useRouter();

  const form = useForm<FormValues>({
    defaultValues: {
      description: defaultValues?.description ?? undefined,
      icon: defaultValues?.icon ?? undefined,
      isActive: defaultValues?.isActive ?? true,
      key: defaultValues?.key ?? '',
      name: defaultValues?.name ?? '',
      nameEs: defaultValues?.nameEs ?? '',
      sortOrder: defaultValues?.sortOrder ?? 0,
    },
    resolver: zodResolver(createGlassSolutionSchema),
  });

  const createMutation = api.admin['glass-solution'].create.useMutation({
    onError: (err: { message?: string }) => {
      toast.error('Error al crear solución', {
        description: err.message || 'Ocurrió un error inesperado',
      });
    },
    onSuccess: () => {
      toast.success('Solución creada', {
        description: 'La solución se creó correctamente',
      });
      router.push('/admin/glass-solutions');
      router.refresh();
    },
  });

  const updateMutation = api.admin['glass-solution'].update.useMutation({
    onError: (err: { message?: string }) => {
      toast.error('Error al actualizar solución', {
        description: err.message || 'Ocurrió un error inesperado',
      });
    },
    onSuccess: () => {
      toast.success('Solución actualizada', {
        description: 'Los cambios se guardaron correctamente',
      });
      router.push('/admin/glass-solutions');
      router.refresh();
    },
  });

  const handleSubmit = (formData: FormValues) => {
    const cleanedData = {
      description: formData.description?.trim() || undefined,
      icon: formData.icon?.trim() || undefined,
      isActive: formData.isActive ?? true,
      key: formData.key.trim(),
      name: formData.name.trim(),
      nameEs: formData.nameEs.trim(),
      sortOrder: formData.sortOrder ?? 0,
    };

    if (mode === 'create') {
      createMutation.mutate(cleanedData);
    } else if (defaultValues?.id) {
      updateMutation.mutate({
        data: cleanedData,
        id: defaultValues.id,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Nueva Solución de Vidrio' : 'Editar Solución de Vidrio'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Crea una nueva solución base para tipos de vidrio'
            : 'Actualiza la información de la solución de vidrio'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información Básica</h3>

              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clave Técnica *</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending || mode === 'edit'}
                        maxLength={MAX_KEY_LENGTH}
                        placeholder="Ej: tempered, laminated, insulated"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Identificador único en snake_case ({MIN_KEY_LENGTH}-{MAX_KEY_LENGTH} caracteres). No editable
                      después de crear.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre (Inglés) *</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        maxLength={MAX_NAME_LENGTH}
                        placeholder="Ej: Tempered Glass, Laminated Glass"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nombre en inglés ({MIN_NAME_LENGTH}-{MAX_NAME_LENGTH} caracteres)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nameEs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre (Español) *</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        maxLength={MAX_NAME_LENGTH}
                        placeholder="Ej: Vidrio Templado, Vidrio Laminado"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Nombre en español para la interfaz de usuario</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden de Visualización</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        max={MAX_SORT_ORDER}
                        min={MIN_SORT_ORDER}
                        placeholder="0-100"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10))}
                        value={field.value ?? 0}
                      />
                    </FormControl>
                    <FormDescription>
                      Define el orden de aparición (0-100, menor número aparece primero)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información Visual</h3>

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icono Lucide (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="Ej: ShieldCheck, Layers, Snowflake"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Nombre de un icono de Lucide React (ej: ShieldCheck, Layers, Snowflake)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isPending}
                        placeholder="Descripción técnica de la solución..."
                        rows={4}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>Descripción técnica o notas internas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Estado</h3>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} disabled={isPending} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Solución Activa</FormLabel>
                      <FormDescription>
                        Las soluciones activas están disponibles para asignar a tipos de vidrio
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button disabled={isPending} type="submit">
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {mode === 'create' ? 'Crear Solución' : 'Guardar Cambios'}
              </Button>
              <Button disabled={isPending} onClick={() => router.back()} type="button" variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
