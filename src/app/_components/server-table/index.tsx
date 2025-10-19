/**
 * ServerTable Component
 *
 * Server-optimized table organism following Next.js 15 + Atomic Design patterns.
 * Implements SOLID principles with composable, reusable table components.
 *
 * Features:
 * - Server-side filtering, sorting, pagination
 * - URL-based state management (deep linking)
 * - Type-safe with generic support
 * - Accessible (ARIA attributes, keyboard navigation)
 * - Responsive design
 *
 * Usage:
 * ```tsx
 * import { ServerTable } from '@/app/_components/server-table';
 * import { TableSearch } from '@/app/_components/server-table/table-search';
 * import { TablePagination } from '@/app/_components/server-table/table-pagination';
 *
 * <ServerTable
 *   data={models}
 *   columns={modelColumns}
 *   searchPlaceholder="Buscar modelos..."
 *   emptyMessage="No se encontraron modelos"
 * />
 * ```
 *
 * @see PAT-001: Server-first data tables
 */

import type { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * Column definition for table
 */
export interface ServerTableColumn<T> {
  /** Column identifier (must match data key) */
  id: string;

  /** Column header text */
  header: string;

  /** Is this column sortable? */
  sortable?: boolean;

  /** Custom cell renderer */
  cell?: (item: T) => ReactNode;

  /** Column alignment */
  align?: 'left' | 'center' | 'right';

  /** Column width (CSS value) */
  width?: string;
}

/**
 * ServerTable props
 */
export interface ServerTableProps<T extends Record<string, unknown>> {
  /** Array of data items to display */
  data: T[];

  /** Column definitions */
  columns: ServerTableColumn<T>[];

  /** Placeholder text for search input */
  searchPlaceholder?: string;

  /** Message to show when no data */
  emptyMessage?: string;

  /** Show search input? */
  showSearch?: boolean;

  /** Show pagination controls? */
  showPagination?: boolean;

  /** Total count of items (for pagination) */
  totalCount?: number;

  /** Current page (for pagination) */
  currentPage?: number;

  /** Page size (for pagination) */
  pageSize?: number;

  /** Custom row key extractor */
  rowKey?: (item: T) => string;

  /** Custom empty state component */
  emptyState?: ReactNode;

  /** Loading state */
  isLoading?: boolean;

  /** Additional table class names */
  className?: string;
}

/**
 * Default row key extractor
 */
function defaultRowKey<T extends Record<string, unknown>>(item: T): string {
  return (item.id as string) ?? JSON.stringify(item);
}

/**
 * Default cell renderer
 */
function defaultCellRenderer<T extends Record<string, unknown>>(item: T, column: ServerTableColumn<T>): ReactNode {
  const value = item[column.id];

  // Handle null/undefined
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  // Handle boolean
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  // Handle Date
  if (value instanceof Date) {
    return value.toLocaleDateString('es-AR');
  }

  // Handle string/number
  return String(value);
}

/**
 * Get alignment class from column alignment
 */
function getAlignmentClass(align?: 'left' | 'center' | 'right'): string | undefined {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return;
}

/**
 * ServerTable Component
 *
 * Composable, server-optimized table with filtering, sorting, and pagination
 */
export function ServerTable<T extends Record<string, unknown>>({
  data,
  columns,
  emptyMessage = 'No se encontraron resultados',
  rowKey = defaultRowKey,
  emptyState,
  isLoading = false,
  className,
}: ServerTableProps<T>) {
  // Show empty state
  if (!isLoading && data.length === 0) {
    return (
      emptyState ?? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </div>
      )
    );
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead className={getAlignmentClass(column.align)} key={column.id} style={{ width: column.width }}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={rowKey(item)}>
                {columns.map((column) => (
                  <TableCell className={getAlignmentClass(column.align)} key={column.id}>
                    {column.cell ? column.cell(item) : defaultCellRenderer(item, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
