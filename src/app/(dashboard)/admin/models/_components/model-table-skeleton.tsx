/**
 * ModelTableSkeleton Component
 *
 * Loading skeleton for model table
 * Provides better UX than generic "Loading..." text
 */

import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function ModelTableSkeleton() {
	return (
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
				{[
					"skeleton-1",
					"skeleton-2",
					"skeleton-3",
					"skeleton-4",
					"skeleton-5",
				].map((key) => (
					<TableRow key={key}>
						<TableCell>
							<Skeleton className="h-4 w-[180px]" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-5 w-[80px]" />
						</TableCell>
						<TableCell>
							<div className="flex flex-col gap-1">
								<Skeleton className="h-3 w-[120px]" />
								<Skeleton className="h-3 w-[100px]" />
							</div>
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-[100px]" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-[140px]" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-5 w-[60px]" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-5 w-[80px]" />
						</TableCell>
						<TableCell className="text-right">
							<div className="flex justify-end gap-2">
								<Skeleton className="size-8" />
								<Skeleton className="size-8" />
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
