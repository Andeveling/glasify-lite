/**
 * Data Table Component
 *
 * Reusable table component built with TanStack Table
 * Based on shadcn/ui data-table pattern
 *
 * Features:
 * - Client-side search filtering (instant, on current page data)
 * - Client-side sorting
 * - Client-side pagination (on filtered results)
 * - Configurable toolbar actions
 *
 * Note: This component handles client-side operations only.
 * For server-side filtering, use ServerFilters component with URL search params.
 */

"use client";

import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchKey?: string;
	searchPlaceholder?: string;
	toolbarSlot?: React.ReactNode;
};

const PAGE_SIZE_10 = 10;
const PAGE_SIZE_20 = 20;
const PAGE_SIZE_30 = 30;
const PAGE_SIZE_40 = 40;
const PAGE_SIZE_50 = 50;
const PAGE_SIZES = [
	PAGE_SIZE_10,
	PAGE_SIZE_20,
	PAGE_SIZE_30,
	PAGE_SIZE_40,
	PAGE_SIZE_50,
] as const;

export function DataTable<TData, TValue>({
	columns,
	data,
	searchKey,
	searchPlaceholder = "Buscar...",
	toolbarSlot,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});

	const table = useReactTable({
		columns,
		data,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		state: {
			columnFilters,
			columnVisibility,
			rowSelection,
			sorting,
		},
	});

	return (
		<div className="space-y-4">
			{/* Toolbar: Server Filters + Search */}
			{toolbarSlot}

			{/* Search Input (Client-Side) */}
			{searchKey && (
				<div className="flex items-center justify-between">
					<Input
						className="max-w-sm"
						onChange={(event) =>
							table.getColumn(searchKey)?.setFilterValue(event.target.value)
						}
						placeholder={searchPlaceholder}
						value={
							(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
						}
					/>
					<div className="text-muted-foreground text-sm">
						{table.getFilteredSelectedRowModel().rows.length} de{" "}
						{table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
					</div>
				</div>
			)}

			{/* Table */}
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									data-state={row.getIsSelected() && "selected"}
									key={row.id}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									className="h-24 text-center"
									colSpan={columns.length}
								>
									No se encontraron resultados.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between px-2">
				<div className="flex items-center space-x-6 lg:space-x-8">
					<div className="flex items-center space-x-2">
						<p className="font-medium text-sm">Filas por página</p>
						<Select
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
							value={`${table.getState().pagination.pageSize}`}
						>
							<SelectTrigger className="h-8 w-[70px]">
								<SelectValue
									placeholder={table.getState().pagination.pageSize}
								/>
							</SelectTrigger>
							<SelectContent side="top">
								{PAGE_SIZES.map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex w-[100px] items-center justify-center font-medium text-sm">
						Página {table.getState().pagination.pageIndex + 1} de{" "}
						{table.getPageCount()}
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<Button
						className="hidden size-8 p-0 lg:flex"
						disabled={!table.getCanPreviousPage()}
						onClick={() => table.setPageIndex(0)}
						variant="outline"
					>
						<span className="sr-only">Ir a la primera página</span>
						<ChevronsLeft className="size-4" />
					</Button>
					<Button
						className="size-8 p-0"
						disabled={!table.getCanPreviousPage()}
						onClick={() => table.previousPage()}
						variant="outline"
					>
						<span className="sr-only">Ir a la página anterior</span>
						<ChevronLeft className="size-4" />
					</Button>
					<Button
						className="size-8 p-0"
						disabled={!table.getCanNextPage()}
						onClick={() => table.nextPage()}
						variant="outline"
					>
						<span className="sr-only">Ir a la página siguiente</span>
						<ChevronRight className="size-4" />
					</Button>
					<Button
						className="hidden size-8 p-0 lg:flex"
						disabled={!table.getCanNextPage()}
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						variant="outline"
					>
						<span className="sr-only">Ir a la última página</span>
						<ChevronsRight className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
