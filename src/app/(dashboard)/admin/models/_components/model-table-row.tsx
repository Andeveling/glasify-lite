/**
 * ModelTableRow Component
 * 
 * Single row in model table with actions
 * Follows Single Responsibility Principle - renders one model row
 */

'use client';

import type { MaterialType, ModelStatus } from '@prisma/client';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCurrencyFormatter } from '@/app/_hooks/use-currency-formatter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';

type ModelData = {
  id: string;
  name: string;
  status: ModelStatus;
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  basePrice: number; // Already serialized
  compatibleGlassTypeIds: string[];
  profileSupplier: {
    id: string;
    name: string;
    materialType: MaterialType;
  } | null;
};

type ModelTableRowProps = {
  model: ModelData;
  onDeleteClick: (id: string, name: string) => void;
};

const statusLabels: Record<ModelStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
};

const getStatusVariant = (status: ModelStatus): 'default' | 'secondary' | 'outline' => {
  if (status === 'published') return 'default';
  if (status === 'draft') return 'secondary';
  return 'outline';
};

export function ModelTableRow({ model, onDeleteClick }: ModelTableRowProps) {
  const { formatPrice } = useCurrencyFormatter();

  return (
    <TableRow>
      <TableCell className="font-medium">{model.name}</TableCell>
      <TableCell>
        <Badge variant="outline">Sin SKU</Badge>
      </TableCell>
      <TableCell className="text-sm">
        <div className="flex flex-col gap-0.5">
          <span>
            Ancho: {model.minWidthMm}-{model.maxWidthMm}mm
          </span>
          <span className="text-muted-foreground text-xs">
            Alto: {model.minHeightMm}-{model.maxHeightMm}mm
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm">{formatPrice(model.basePrice)}</TableCell>
      <TableCell className="text-sm">
        {model.profileSupplier?.name || <span className="text-muted-foreground">Sin proveedor</span>}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{model.compatibleGlassTypeIds.length} tipos</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusVariant(model.status)}>{statusLabels[ model.status ]}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button asChild size="icon" variant="ghost">
            <Link href={`/admin/models/${model.id}`}>
              <Pencil className="size-4" />
              <span className="sr-only">Editar</span>
            </Link>
          </Button>
          <Button onClick={() => onDeleteClick(model.id, model.name)} size="icon" variant="ghost">
            <Trash2 className="size-4 text-destructive" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
