"use client";

import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import type { FC } from "react";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * Path segment to Spanish label mapping
 */
const pathLabels: Record<string, string> = {
	admin: "Admin",
	edit: "Editar",
	"glass-characteristics": "Características de Vidrio",
	"glass-solutions": "Soluciones de Vidrio",
	"glass-suppliers": "Proveedores de Vidrio",
	"glass-types": "Tipos de Vidrio",
	models: "Modelos",
	new: "Nuevo",
	"profile-suppliers": "Proveedores de Perfiles",
	services: "Servicios",
};

/**
 * Admin Breadcrumbs Component
 *
 * Automatically generates breadcrumb navigation based on current pathname.
 * Shows hierarchical location within admin section with Spanish labels.
 *
 * @example
 * Path: /admin/models/new
 * Breadcrumbs: Home > Admin > Modelos > Nuevo
 */
export const AdminBreadcrumbs: FC = () => {
	const pathname = usePathname();

	// Generate breadcrumb items from pathname
	const pathSegments = pathname.split("/").filter(Boolean);

	// Don't show breadcrumbs on admin home
	if (pathSegments.length <= 1) {
		return null;
	}

	const breadcrumbItems = pathSegments.map((segment, index) => {
		const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
		const label = pathLabels[segment] ?? segment;
		const isLast = index === pathSegments.length - 1;

		return {
			href,
			isLast,
			label,
		};
	});

	return (
		<Breadcrumb>
			<BreadcrumbList className="flex items-center gap-1">
				{/* Home link */}
				<BreadcrumbItem>
					<BreadcrumbLink
						className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
						href="/admin"
					>
						<Home className="h-4 w-4" />
						<span className="sr-only">Inicio</span>
					</BreadcrumbLink>
				</BreadcrumbItem>

				{breadcrumbItems.map((item) => (
					<div className="flex items-center gap-1" key={item.href}>
						<BreadcrumbSeparator>
							<ChevronRight className="h-4 w-4 text-muted-foreground/50" />
						</BreadcrumbSeparator>
						<BreadcrumbItem>
							{item.isLast ? (
								<BreadcrumbPage className="font-medium text-foreground">
									{item.label}
								</BreadcrumbPage>
							) : (
								<BreadcrumbLink
									className="text-muted-foreground transition-colors hover:text-foreground"
									href={item.href}
								>
									{item.label}
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</div>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
};
