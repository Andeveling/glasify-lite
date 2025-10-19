/**
 * GlassTypesTable Component
 *
 * Server-optimized table for Glass Types admin page using ServerTable components.
 * Implements server-side filtering, sorting, search, and pagination.
 *
 * Features:
 * - Server-side data fetching via tRPC
 * - URL-based state management
 * - Debounced search (300ms)
 * - Sortable columns
 * - Filter by purpose, supplier, active status, thickness
 * - Delete confirmation with referential integrity check
 *
 * Architecture:
 * - Uses ServerTable organism with molecular components
 * - Follows SOLID principles (Single Responsibility)
 * - Type-safe with Zod validation
 */

'use client';

import type { GlassPurpose } from '@prisma/client';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog';
import type { ServerTableColumn } from '@/app/_components/server-table';
import { ServerTable } from '@/app/_components/server-table';
import { type FilterDefinition, TableFilters } from '@/app/_components/server-table/table-filters';
import { TablePagination } from '@/app/_components/server-table/table-pagination';
import { TableSearch } from '@/app/_components/server-table/table-search';
import { useTenantConfig } from '@/app/_hooks/use-tenant-config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/format';
import { api } from '@/trpc/react';

/**
 * Glass Type data type (from tRPC)
 */
type GlassType = {
  id: string;
  name: string;
  purpose: GlassPurpose;
  thicknessMm: number;
  pricePerSqm: number;
  sku: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  glassSupplier: {
    id: string;
    name: string;
  } | null;
  solutions: Array<{
    isPrimary: boolean;
    solution: {
      nameEs: string;
    };
  }>;
  _count: {
    solutions: number;
    characteristics: number;
  };
};

/**
 * Supplier data type
 */
type Supplier = {
  id: string;
  name: string;
};

type GlassTypesTableProps = {
  initialData: {
    items: GlassType[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
  suppliers: Supplier[];
  searchParams: {
    search?: string;
    purpose?: string;
    glassSupplierId?: string;
    isActive?: string;
    page?: string;
  };
};

/**
 * Purpose badge component
 */
function PurposeBadge({ purpose }: { purpose: GlassPurpose }) {
  const labels: Record<GlassPurpose, string> = {
    decorative: 'Decorativo',
    general: 'General',
    insulation: 'Aislamiento',
    security: 'Seguridad',
  };

  return <Badge variant="outline">{labels[purpose]}</Badge>;
}

/**
 * Active status badge
 */
function ActiveBadge({ isActive }: { isActive: boolean }) {
  return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Activo' : 'Inactivo'}</Badge>;
}

/**
 * Solutions display
 */
function SolutionsBadges({ solutions }: { solutions: GlassType['solutions'] }) {
  if (solutions.length === 0) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  const primary = solutions.find((s) => s.isPrimary);
  const displaySolution = primary ?? solutions[0];

  if (!displaySolution) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge variant={displaySolution.isPrimary ? 'default' : 'secondary'}>{displaySolution.solution.nameEs}</Badge>
      {solutions.length > 1 && <span className="text-muted-foreground text-xs">+{solutions.length - 1}</span>}
    </div>
  );
}

/**
 * Actions dropdown menu
 */
function ActionsMenu({ glassType, onDelete }: { glassType: GlassType; onDelete: (id: string, name: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Abrir menú de acciones" size="icon" variant="ghost">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/glass-types/${glassType.id}`}>
            <Pencil className="mr-2 size-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(glassType.id, glassType.name)}>
          <Trash2 className="mr-2 size-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GlassTypesTable({ initialData, suppliers, searchParams }: GlassTypesTableProps) {
  const { formatContext } = useTenantConfig();
  const utils = api.useUtils();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [glassTypeToDelete, setGlassTypeToDelete] = useState<{ id: string; name: string } | null>(null);

  // Delete mutation
  const deleteMutation = api.admin['glass-type'].delete.useMutation({
    onError: (error) => {
      toast.error('Error al eliminar tipo de vidrio', {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success('Tipo de vidrio eliminado correctamente');
      setDeleteDialogOpen(false);
      setGlassTypeToDelete(null);
      void utils.admin['glass-type'].list.invalidate();
    },
  });

  /**
   * Handle delete click
   */
  const handleDeleteClick = (id: string, name: string) => {
    setGlassTypeToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  /**
   * Confirm delete
   */
  const handleConfirmDelete = async () => {
    if (!glassTypeToDelete) return;
    await deleteMutation.mutateAsync({ id: glassTypeToDelete.id });
  };

  /**
   * Column definitions
   */
  const columns: ServerTableColumn<GlassType>[] = [
    {
      cell: (item) => (
        <div>
          <div className="font-medium">{item.name}</div>
          {item.sku && <div className="text-muted-foreground text-xs">SKU: {item.sku}</div>}
        </div>
      ),
      header: 'Nombre',
      id: 'name',
      sortable: true,
    },
    {
      cell: (item) => <PurposeBadge purpose={item.purpose} />,
      header: 'Propósito',
      id: 'purpose',
      sortable: true,
    },
    {
      align: 'center',
      cell: (item) => `${item.thicknessMm}mm`,
      header: 'Espesor',
      id: 'thicknessMm',
      sortable: true,
    },
    {
      cell: (item) => formatCurrency(item.pricePerSqm, { context: formatContext }),
      header: 'Precio/m²',
      id: 'pricePerSqm',
      sortable: true,
    },
    {
      cell: (item) => <SolutionsBadges solutions={item.solutions} />,
      header: 'Soluciones',
      id: 'solutions',
      sortable: false,
    },
    {
      cell: (item) => (item.glassSupplier ? item.glassSupplier.name : '—'),
      header: 'Proveedor',
      id: 'supplier',
      sortable: false,
    },
    {
      align: 'center',
      cell: (item) => <ActiveBadge isActive={item.isActive} />,
      header: 'Estado',
      id: 'isActive',
      sortable: false,
    },
    {
      align: 'right',
      cell: (item) => <ActionsMenu glassType={item} onDelete={handleDeleteClick} />,
      header: 'Acciones',
      id: 'actions',
      sortable: false,
      width: '80px',
    },
  ];

  /**
   * Filter definitions
   */
  const filters: FilterDefinition[] = [
    {
      defaultValue: 'all',
      id: 'purpose',
      label: 'Propósito',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'General', value: 'general' },
        { label: 'Aislamiento', value: 'insulation' },
        { label: 'Seguridad', value: 'security' },
        { label: 'Decorativo', value: 'decorative' },
      ],
      type: 'select',
    },
    {
      defaultValue: 'all',
      id: 'isActive',
      label: 'Estado',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Activos', value: 'active' },
        { label: 'Inactivos', value: 'inactive' },
      ],
      type: 'select',
    },
    {
      defaultValue: 'all',
      id: 'glassSupplierId',
      label: 'Proveedor de Vidrio',
      options: [{ label: 'Todos', value: 'all' }, ...suppliers.map((s) => ({ label: s.name, value: s.id }))],
      type: 'select',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-end justify-between gap-4">
        <TableFilters filters={filters} />
        <Button asChild>
          <Link href="/admin/glass-types/new">
            <Plus className="mr-2 size-4" />
            Nuevo Tipo de Vidrio
          </Link>
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Tipos de Vidrio ({initialData.total})</CardTitle>
              <CardDescription>Gestiona los tipos de vidrio con sus soluciones y características</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <TableSearch defaultValue={searchParams.search} placeholder="Buscar por nombre, SKU o descripción..." />

          {/* Table */}
          <ServerTable columns={columns} data={initialData.items} emptyMessage="No se encontraron tipos de vidrio" />

          {/* Pagination */}
          <TablePagination
            currentPage={initialData.page}
            totalItems={initialData.total}
            totalPages={initialData.totalPages}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        dependencies={[]}
        entityLabel={glassTypeToDelete?.name ?? ''}
        entityName="tipo de vidrio"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
    </div>
  );
}
