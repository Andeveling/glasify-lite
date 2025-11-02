"use client";

/**
 * Tenant Configuration Settings Page
 *
 * Allows administrators to manage the singleton TenantConfig:
 * - Business name, currency, locale, timezone
 * - Quote validity period
 * - Contact information (email, phone, address)
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md (TASK-036)
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	type UpdateTenantConfigInput,
	updateTenantConfigSchema,
} from "@/server/schemas/tenant.schema";
import { api } from "@/trpc/react";

/**
 * Common currency codes for Latin America
 */
const CURRENCY_OPTIONS = [
	{ label: "Peso Colombiano (COP)", value: "COP" },
	{ label: "Dólar Estadounidense (USD)", value: "USD" },
	{ label: "Euro (EUR)", value: "EUR" },
	{ label: "Peso Mexicano (MXN)", value: "MXN" },
	{ label: "Peso Argentino (ARS)", value: "ARS" },
	{ label: "Peso Chileno (CLP)", value: "CLP" },
] as const;

/**
 * Common locales for Latin America
 */
const LOCALE_OPTIONS = [
	{ label: "Español - Colombia (es-CO)", value: "es-CO" },
	{ label: "Español - México (es-MX)", value: "es-MX" },
	{ label: "Español - Argentina (es-AR)", value: "es-AR" },
	{ label: "Español - Chile (es-CL)", value: "es-CL" },
	{ label: "English - US (en-US)", value: "en-US" },
] as const;

/**
 * Common IANA timezones for Latin America
 */
const TIMEZONE_OPTIONS = [
	{ label: "America/Bogota (COT, UTC-5)", value: "America/Bogota" },
	{
		label: "America/Mexico_City (CST/CDT, UTC-6)",
		value: "America/Mexico_City",
	},
	{
		label: "America/Argentina/Buenos_Aires (ART, UTC-3)",
		value: "America/Argentina/Buenos_Aires",
	},
	{ label: "America/Santiago (CLT/CLST, UTC-4)", value: "America/Santiago" },
	{ label: "America/New_York (EST/EDT, UTC-5)", value: "America/New_York" },
] as const;

export default function TenantConfigPage() {
	// Fetch current tenant configuration
	const {
		data: tenantConfig,
		isLoading,
		error,
	} = api.tenantConfig.get.useQuery();

	// Update mutation
	const updateMutation = api.tenantConfig.update.useMutation({
		onError: (err) => {
			toast.error("Error al actualizar la configuración", {
				description: err.message || "Ocurrió un error inesperado",
			});
		},
		onSuccess: () => {
			toast.success("Configuración actualizada", {
				description: "Los cambios se guardaron correctamente",
			});
		},
	});

	// React Hook Form
	const form = useForm<UpdateTenantConfigInput>({
		defaultValues: {
			businessAddress: "",
			businessName: "",
			contactEmail: "",
			contactPhone: "",
			currency: "COP",
			locale: "es-CO",
			quoteValidityDays: 15,
			timezone: "America/Bogota",
		},
		resolver: zodResolver(updateTenantConfigSchema),
	});

	// Populate form with fetched data
	useEffect(() => {
		if (tenantConfig) {
			form.reset({
				businessAddress: tenantConfig.businessAddress ?? "",
				businessName: tenantConfig.businessName,
				contactEmail: tenantConfig.contactEmail ?? "",
				contactPhone: tenantConfig.contactPhone ?? "",
				currency: tenantConfig.currency,
				locale: tenantConfig.locale,
				quoteValidityDays: tenantConfig.quoteValidityDays,
				timezone: tenantConfig.timezone,
			});
		}
	}, [tenantConfig, form]);

	// Handle form submission
	const onSubmit = (data: UpdateTenantConfigInput) => {
		updateMutation.mutate(data);
	};

	// Error state
	if (error) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardHeader>
						<CardTitle className="text-destructive">
							Error al cargar la configuración
						</CardTitle>
						<CardDescription>{error.message}</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6">
				<h1 className="font-bold text-3xl tracking-tight">
					Configuración del Negocio
				</h1>
				<p className="text-muted-foreground">
					Administra la información y preferencias de tu carpintería
				</p>
			</div>

			<Form {...form}>
				<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
					{/* Business Information Card */}
					<Card>
						<CardHeader>
							<CardTitle>Información del Negocio</CardTitle>
							<CardDescription>
								Datos generales de tu carpintería
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Business Name */}
							<FormField
								control={form.control}
								name="businessName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nombre del Negocio</FormLabel>
										<FormControl>
											<Input
												disabled={isLoading}
												placeholder="Ej: Carpintería El Sol"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Nombre que aparecerá en las cotizaciones
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Contact Email */}
							<FormField
								control={form.control}
								name="contactEmail"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Correo Electrónico</FormLabel>
										<FormControl>
											<Input
												disabled={isLoading}
												placeholder="contacto@tuempresa.com"
												type="email"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormDescription>
											Correo de contacto para clientes
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Contact Phone */}
							<FormField
								control={form.control}
								name="contactPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Teléfono</FormLabel>
										<FormControl>
											<Input
												disabled={isLoading}
												placeholder="+57 300 123 4567"
												type="tel"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormDescription>
											Número de contacto para clientes
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Business Address */}
							<FormField
								control={form.control}
								name="businessAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Dirección</FormLabel>
										<FormControl>
											<Textarea
												disabled={isLoading}
												placeholder="Calle 123 #45-67, Bogotá, Colombia"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormDescription>
											Dirección física del negocio
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Regional Settings Card */}
					<Card>
						<CardHeader>
							<CardTitle>Configuración Regional</CardTitle>
							<CardDescription>Moneda, idioma y zona horaria</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Currency */}
							<FormField
								control={form.control}
								name="currency"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Moneda</FormLabel>
										<Select
											disabled={isLoading}
											onValueChange={field.onChange}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona una moneda" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{CURRENCY_OPTIONS.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormDescription>
											Moneda para precios y cotizaciones
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Locale */}
							<FormField
								control={form.control}
								name="locale"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Idioma y Región</FormLabel>
										<Select
											disabled={isLoading}
											onValueChange={field.onChange}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona idioma y región" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{LOCALE_OPTIONS.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormDescription>
											Formato de fechas y números
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Timezone */}
							<FormField
								control={form.control}
								name="timezone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Zona Horaria</FormLabel>
										<Select
											disabled={isLoading}
											onValueChange={field.onChange}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona zona horaria" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{TIMEZONE_OPTIONS.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormDescription>
											Zona horaria para fechas de cotizaciones
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Quote Settings Card */}
					<Card>
						<CardHeader>
							<CardTitle>Configuración de Cotizaciones</CardTitle>
							<CardDescription>
								Preferencias para generación de cotizaciones
							</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Quote Validity Days */}
							<FormField
								control={form.control}
								name="quoteValidityDays"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Días de Validez de Cotizaciones</FormLabel>
										<FormControl>
											<Input
												disabled={isLoading}
												max={365}
												min={1}
												placeholder="15"
												type="number"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormDescription>
											Número de días durante los cuales una cotización es válida
											(1-365)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Submit Button */}
					<div className="flex justify-end gap-4">
						<Button
							disabled={isLoading || updateMutation.isPending}
							type="submit"
						>
							{updateMutation.isPending && (
								<Loader2 className="mr-2 size-4 animate-spin" />
							)}
							Guardar Cambios
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
