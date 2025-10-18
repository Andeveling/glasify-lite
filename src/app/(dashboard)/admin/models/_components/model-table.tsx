/**
 * ModelTable Component
 * 
 * Table display for models with loading states
 * Follows Open/Closed Principle - extensible via props
 */

'use client';

import type { MaterialType, ModelStatus } from '@prisma/client';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ModelTableRow } from './model-table-row';
import { ModelTableSkeleton } from './model-table-skeleton';

type ModelData = {
  id: string;
  name: string;
  status: ModelStatus;
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  basePrice: number; // Already serialized from Decimal
  compatibleGlassTypeIds: string[];
  profileSupplier: {
    id: string;
    name: string;
    materialType: MaterialType;
  } | null;
};

type ModelTableProps = {
  models: ModelData[];
  total: number;
  isLoading?: boolean;
  onDeleteClick: (id: string, name: string) => void;
};

export function ModelTable({ isLoading = false, models, onDeleteClick, total }: ModelTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelos ({total})</CardTitle>
        <CardDescription>
          Mostrando {models.length} de {total} modelos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<ModelTableSkeleton />}>
          {isLoading ? (
            <ModelTableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Dimensiones</TableHead>
                  <TableHead>Precio Base</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Tipos Compatibles</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center text-muted-foreground" colSpan={8}>
                      No se encontraron modelos
                    </TableCell>
                  </TableRow>
                ) : (
                  models.map((model) => <ModelTableRow key={model.id} model={model} onDeleteClick={onDeleteClick} />)
                )}
              </TableBody>
            </Table>
          )}
        </Suspense>
      </CardContent>
    </Card>
  );
}
