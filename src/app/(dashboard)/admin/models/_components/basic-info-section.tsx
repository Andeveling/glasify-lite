/**
 * Basic Information Section
 *
 * Model name, status, and profile supplier selection
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RouterOutputs } from '@/trpc/react';
import { FormSelect, FormTextInput } from './form-fields';

type ProfileSupplier = RouterOutputs['admin']['profile-supplier']['list']['items'][number];

type BasicInfoSectionProps = {
  suppliers: ProfileSupplier[];
};

const STATUS_OPTIONS = [
  { label: 'Borrador', value: 'draft' },
  { label: 'Publicado', value: 'published' },
];

export function BasicInfoSection({ suppliers }: BasicInfoSectionProps) {
  const supplierOptions = suppliers.map((supplier) => ({
    label: supplier.name,
    value: supplier.id,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Básica</CardTitle>
        <CardDescription>Datos generales del modelo de ventana o puerta</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormTextInput
            description="Nombre descriptivo del modelo"
            label="Nombre"
            name="name"
            placeholder="Ej: Ventana Corrediza PVC"
            required
          />
        </div>

        <FormSelect
          description="Estado de publicación del modelo"
          label="Estado"
          name="status"
          options={STATUS_OPTIONS}
          placeholder="Selecciona estado"
          required
        />

        <FormSelect
          description="Proveedor del perfil de ventana/puerta"
          label="Proveedor de Perfiles"
          name="profileSupplierId"
          options={supplierOptions}
          placeholder="Selecciona proveedor"
        />
      </CardContent>
    </Card>
  );
}
