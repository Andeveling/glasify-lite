"use client";

import { Eye, Filter, MessageCircle, Search } from "lucide-react";
import { useState } from "react";
import { generateStableKeyedArray } from "@/app/_utils/generate-keys.util";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { formatDate } from "@/lib/utils";
import { useTenantConfig } from "@/providers/tenant-config-provider";

// Types for quote data
type QuoteStatus =
	| "draft"
	| "calculating"
	| "pending"
	| "submitted"
	| "completed"
	| "cancelled";

type Quote = {
	id: string;
	customerName: string;
	customerEmail: string;
	customerPhone?: string;
	status: QuoteStatus;
	itemCount: number;
	totalAmount: number;
	createdAt: string;
	updatedAt: string;
	estimatedDelivery?: string;
};

// Mock data for development
const MOCK_QUOTES: Quote[] = [
	{
		createdAt: "2024-01-15T10:30:00Z",
		customerEmail: "juan.perez@email.com",
		customerName: "Juan Pérez",
		customerPhone: "+54 9 11 1234-5678",
		estimatedDelivery: "2024-01-22T00:00:00Z",
		id: "cm1quote123456789abcdef01",
		itemCount: 3,
		status: "submitted",
		totalAmount: 450_000,
		updatedAt: "2024-01-15T14:20:00Z",
	},
	{
		createdAt: "2024-01-14T16:45:00Z",
		customerEmail: "maria.gonzalez@email.com",
		customerName: "María González",
		id: "cm1quote234567890bcdef012",
		itemCount: 2,
		status: "pending",
		totalAmount: 320_000,
		updatedAt: "2024-01-14T16:45:00Z",
	},
	{
		createdAt: "2024-01-13T09:15:00Z",
		customerEmail: "carlos.rodriguez@email.com",
		customerName: "Carlos Rodríguez",
		customerPhone: "+54 9 11 9876-5432",
		id: "cm1quote345678901cdef0123",
		itemCount: 5,
		status: "calculating",
		totalAmount: 890_000,
		updatedAt: "2024-01-13T11:30:00Z",
	},
	{
		createdAt: "2024-01-10T14:20:00Z",
		customerEmail: "ana.martinez@email.com",
		customerName: "Ana Martínez",
		estimatedDelivery: "2024-01-20T00:00:00Z",
		id: "cm1quote456789012def01234",
		itemCount: 1,
		status: "completed",
		totalAmount: 150_000,
		updatedAt: "2024-01-12T10:15:00Z",
	},
	{
		createdAt: "2024-01-09T11:00:00Z",
		customerEmail: "roberto.silva@email.com",
		customerName: "Roberto Silva",
		id: "cm1quote567890123ef012345",
		itemCount: 4,
		status: "draft",
		totalAmount: 0,
		updatedAt: "2024-01-09T11:00:00Z",
	},
];

const QUOTE_SKELETON_COUNT = 5;

const STATUS_CONFIG: Record<
	QuoteStatus,
	{
		label: string;
		variant: "default" | "secondary" | "destructive" | "outline";
	}
> = {
	calculating: { label: "Calculando", variant: "outline" },
	cancelled: { label: "Cancelada", variant: "destructive" },
	completed: { label: "Completada", variant: "default" },
	draft: { label: "Borrador", variant: "secondary" },
	pending: { label: "Pendiente", variant: "outline" },
	submitted: { label: "Enviada", variant: "default" },
};

type QuoteListProps = {
	quotes?: Quote[];
	onViewQuote?: (quoteId: string) => void;
	onContactCustomer?: (quote: Quote) => void;
	isLoading?: boolean;
};

export function QuoteList({
	quotes = MOCK_QUOTES,
	onViewQuote,
	onContactCustomer,
	isLoading = false,
}: QuoteListProps) {
	const { locale, timezone } = useTenantConfig();
	const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
	const [searchQuery, setSearchQuery] = useState("");

	// Filter quotes based on search and status
	const filteredQuotes = quotes.filter((quote) => {
		const matchesSearch =
			quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			quote.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
			quote.id.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || quote.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	// Format currency
	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("es-AR", {
			currency: "ARS",
			style: "currency",
		}).format(amount);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Cargando cotizaciones...</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{generateStableKeyedArray(
							QUOTE_SKELETON_COUNT,
							"quote-skeleton",
						).map((item) => (
							<div
								className="h-16 animate-pulse rounded bg-muted"
								key={item.key}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Gestión de Cotizaciones</CardTitle>
				<CardDescription>
					Administra y supervisa todas las cotizaciones de clientes
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Filters and Search */}
				<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-2">
						<div className="relative flex-1 md:w-80">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								className="pl-10"
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Buscar por cliente, email o ID..."
								value={searchQuery}
							/>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-muted-foreground" />
						<Select
							onValueChange={(value) =>
								setStatusFilter(value as QuoteStatus | "all")
							}
							value={statusFilter}
						>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Estado" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los estados</SelectItem>
								<SelectItem value="draft">Borrador</SelectItem>
								<SelectItem value="calculating">Calculando</SelectItem>
								<SelectItem value="pending">Pendiente</SelectItem>
								<SelectItem value="submitted">Enviada</SelectItem>
								<SelectItem value="completed">Completada</SelectItem>
								<SelectItem value="cancelled">Cancelada</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Quotes Table */}
				{filteredQuotes.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						{searchQuery || statusFilter !== "all"
							? "No se encontraron cotizaciones con los filtros aplicados."
							: "No hay cotizaciones disponibles."}
					</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Cliente</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead className="text-center">Ítems</TableHead>
									<TableHead className="text-right">Total</TableHead>
									<TableHead>Creada</TableHead>
									<TableHead>Actualizada</TableHead>
									<TableHead className="w-32">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredQuotes.map((quote) => (
									<TableRow key={quote.id}>
										<TableCell>
											<div>
												<div className="font-medium">{quote.customerName}</div>
												<div className="text-muted-foreground text-sm">
													{quote.customerEmail}
												</div>
												{quote.customerPhone && (
													<div className="text-muted-foreground text-sm">
														{quote.customerPhone}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant={STATUS_CONFIG[quote.status].variant}>
												{STATUS_CONFIG[quote.status].label}
											</Badge>
											{quote.estimatedDelivery && (
												<div className="mt-1 text-muted-foreground text-xs">
													Entrega:{" "}
													{
														formatDate(
															quote.estimatedDelivery,
															locale,
															timezone,
														).split(",")[0]
													}
												</div>
											)}
										</TableCell>
										<TableCell className="text-center">
											<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm">
												{quote.itemCount}
											</span>
										</TableCell>
										<TableCell className="text-right font-medium">
											{quote.totalAmount > 0 ? (
												formatCurrency(quote.totalAmount)
											) : (
												<span className="text-muted-foreground">—</span>
											)}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{formatDate(quote.createdAt, locale, timezone)}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{formatDate(quote.updatedAt, locale, timezone)}
										</TableCell>
										<TableCell>
											<div className="flex gap-1">
												<Button
													onClick={() => onViewQuote?.(quote.id)}
													size="sm"
													title="Ver detalles"
													variant="outline"
												>
													<Eye className="h-4 w-4" />
												</Button>
												{quote.customerPhone && (
													<Button
														onClick={() => onContactCustomer?.(quote)}
														size="sm"
														title="Contactar cliente"
														variant="outline"
													>
														<MessageCircle className="h-4 w-4" />
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}

				{/* Summary */}
				<div className="mt-6 border-t pt-4">
					<div className="text-muted-foreground text-sm">
						Mostrando {filteredQuotes.length} de {quotes.length} cotizaciones
						{(searchQuery || statusFilter !== "all") && (
							<span> • Filtros aplicados</span>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
