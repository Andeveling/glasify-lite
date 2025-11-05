/**
 * Services List Component
 *
 * Client Component - Server-optimized pattern with SOLID principles
 *
 * Receives:
 * - initialData: Datos precargados del servidor (SSR)
 * - searchParams: Estado actual de filtros (para sincronización)
 *
 * Responsibilities:
 * - Display tabla con datos
 * - Coordinate CRUD actions (delegates to hooks)
 * - Manage dialog state
 *
 * Features:
 * - Optimistic UI with rollback on error
 * - Toast notifications with loading states
 * - Cache invalidation after mutations
 * - Activate/Deactivate services
 *
 * SOLID Principles Applied:
 * ✅ Single Responsibility: Focused on presentation and coordination
 * ✅ Open/Closed: Actions extensible via hooks, closed for modification
 * ✅ Liskov Substitution: SerializedService type substitutable
 * ✅ Interface Segregation: Props split by responsibility
 * ✅ Dependency Inversion: Depends on hooks abstraction, not implementation
 */

"use client";

import type { Service, ServiceType, ServiceUnit } from "@prisma/client";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/app/_components/delete-confirmation-dialog";
import { TablePagination } from "@/app/_components/server-table/table-pagination";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { useServiceActions } from "../_hooks/use-service-actions";
import { ServiceDialog } from "./service-dialog";
import { ServiceRowActions } from "./service-row-actions";
import { ServicesEmpty } from "./services-empty";

type SerializedService = {
	id: string;
	isActive?: boolean;
	name: string;
	rate: number;
	type: ServiceType;
	unit: ServiceUnit;
	minimumBillingUnit?: number | null;
	createdAt?: Date;
	updatedAt?: Date;
};

type ServicesListProps = {
	initialData: {
		items: SerializedService[];
		limit: number;
		page: number;
		total: number;
		totalPages: number;
	};
	searchParams: {
		isActive?: string;
		page?: string;
		search?: string;
		sortBy?: string;
		sortOrder?: "asc" | "desc";
		type?: string;
	};
};

/**
 * Service type labels (Spanish)
 * Used for badges and UI display
 */
const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
	area: "Área",
	fixed: "Fijo",
	perimeter: "Perímetro",
};

/**
 * Service unit labels (Spanish)
 * Used for column display
 */
const SERVICE_UNIT_LABELS: Record<ServiceUnit, string> = {
	ml: "ml",
	sqm: "m²",
	unit: "unidad",
};

/**
 * Service type badge variants
 * Visual distinction for different service types
 */
const SERVICE_TYPE_VARIANTS: Record<
	ServiceType,
	"default" | "secondary" | "outline"
> = {
	area: "default",
	fixed: "secondary",
	perimeter: "outline",
};

export function ServicesList({ initialData, searchParams }: ServicesListProps) {
	// Dialog state management
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [serviceToDelete, setServiceToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

	// Service actions hook (SOLID: Dependency Inversion)
	const { deleteService, toggleActive } = useServiceActions({
		limit: initialData.limit,
		onSuccessAction: () => {
			// Close delete dialog on successful deletion
			if (deleteDialogOpen) {
				setDeleteDialogOpen(false);
				setServiceToDelete(null);
			}
		},
		searchParams,
	});

	// Event handlers (SOLID: Interface Segregation)
	const handleEditClick = (serviceId: string) => {
		const service = initialData.items.find((s) => s.id === serviceId);
		if (!service) return;

		// Convert to full Service type for the dialog
		const mockDecimal = {
			toNumber: () => service.rate,
		};

		const mockMinimumBillingUnit = service.minimumBillingUnit
			? { toNumber: () => service.minimumBillingUnit }
			: null;

		setServiceToEdit({
			...service,
			createdAt: service.createdAt ?? new Date(),
			isActive: service.isActive ?? true,
			minimumBillingUnit:
				mockMinimumBillingUnit as Service["minimumBillingUnit"],
			rate: mockDecimal as Service["rate"],
			updatedAt: service.updatedAt ?? new Date(),
		});
		setEditDialogOpen(true);
	};

	const handleToggleActive = async (
		serviceId: string,
		currentState: boolean,
	) => {
		// Toggle the state (if active, deactivate; if inactive, activate)
		await toggleActive.mutateAsync({
			id: serviceId,
			isActive: !currentState,
		});
	};

	const handleDeleteClick = (serviceId: string, serviceName: string) => {
		setServiceToDelete({ id: serviceId, name: serviceName });
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (serviceToDelete) {
			await deleteService.mutateAsync({ id: serviceToDelete.id });
		}
	};

	const { items: services, page: currentPage, total, totalPages } = initialData;

	// Check if there are filters active
	const hasFilters = Boolean(
		searchParams?.search ||
			(searchParams?.type && searchParams.type !== "all") ||
			(searchParams?.isActive && searchParams.isActive !== "all"),
	);

	// Check if any action is loading
	const isLoading = deleteService.isPending || toggleActive.isPending;

	return (
		<>
			{/* Edit Dialog only - Create is handled by ServicesContent */}
			{serviceToEdit && (
				<ServiceDialog
					defaultValues={serviceToEdit}
					mode="edit"
					onOpenChangeAction={setEditDialogOpen}
					open={editDialogOpen}
				/>
			)}

			{/* Empty state */}
			{services.length === 0 ? (
				<ServicesEmpty hasFilters={hasFilters} />
			) : (
				<>
					<div className="overflow-x-auto rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Nombre</TableHead>
									<TableHead>Tipo</TableHead>
									<TableHead>Unidad</TableHead>
									<TableHead className="text-right">Tarifa</TableHead>
									<TableHead className="w-[100px] text-right">
										Acciones
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{services.map((service) => (
									<TableRow key={service.id}>
										<TableCell className="font-medium">
											{service.name}
											{!service.isActive && (
												<Badge className="ml-2" variant="outline">
													Inactivo
												</Badge>
											)}
										</TableCell>
										<TableCell>
											<Badge variant={SERVICE_TYPE_VARIANTS[service.type]}>
												{SERVICE_TYPE_LABELS[service.type]}
											</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{SERVICE_UNIT_LABELS[service.unit]}
										</TableCell>
										<TableCell className="text-right">
											{formatCurrency(service.rate)}
										</TableCell>
										<TableCell className="text-right">
											<ServiceRowActions
												isActive={service.isActive ?? true}
												isLoading={isLoading}
												onDeleteAction={handleDeleteClick}
												onEditAction={handleEditClick}
												onToggleActiveAction={handleToggleActive}
												serviceId={service.id}
												serviceName={service.name}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
							<TableFooter className="p-2" />
						</Table>
					</div>
					<TablePagination
						currentPage={currentPage}
						totalItems={total}
						totalPages={totalPages}
					/>
				</>
			)}

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmationDialog
				dependencies={[]}
				entityLabel={serviceToDelete?.name ?? ""}
				entityName="servicio"
				loading={deleteService.isPending}
				onConfirm={handleDeleteConfirm}
				onOpenChange={setDeleteDialogOpen}
				open={deleteDialogOpen}
				warningMessage="Esta acción no se puede deshacer."
			/>
		</>
	);
}
