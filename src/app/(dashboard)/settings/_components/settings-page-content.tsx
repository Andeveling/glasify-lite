"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Bell,
	CreditCard,
	Database,
	Globe,
	Mail,
	RefreshCcw,
	Save,
	Settings,
	Shield,
	Smartphone,
	User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const PROFILE_BIO_MAX_LENGTH = 160;
const PROFILE_NAME_MIN_LENGTH = 2;
const PROFILE_NAME_MAX_LENGTH = 50;
const BUSINESS_ADDRESS_MIN_LENGTH = 5;
const BUSINESS_ADDRESS_MAX_LENGTH = 200;
const BUSINESS_NAME_MIN_LENGTH = 2;
const BUSINESS_NAME_MAX_LENGTH = 100;
const BUSINESS_MARGIN_MIN = 0;
const BUSINESS_MARGIN_MAX = 100;
const DEFAULT_BUSINESS_MARGIN = 25;
const PHONE_NUMBER_REGEX = /^[+]?[0-9\s\-()]+$/;

// Form schemas for each settings section
const profileFormSchema = z.object({
	bio: z
		.string()
		.max(
			PROFILE_BIO_MAX_LENGTH,
			`La biografía no puede exceder ${PROFILE_BIO_MAX_LENGTH} caracteres`,
		)
		.optional(),
	email: z
		.string()
		.email("Ingresa un email válido")
		.min(1, "El email es requerido"),
	name: z
		.string()
		.min(
			PROFILE_NAME_MIN_LENGTH,
			`El nombre debe tener al menos ${PROFILE_NAME_MIN_LENGTH} caracteres`,
		)
		.max(
			PROFILE_NAME_MAX_LENGTH,
			`El nombre no puede exceder ${PROFILE_NAME_MAX_LENGTH} caracteres`,
		),
	phone: z
		.string()
		.optional()
		.refine((val) => !val || PHONE_NUMBER_REGEX.test(val), {
			message: "Formato de teléfono inválido",
		}),
});

const notificationFormSchema = z.object({
	emailNotifications: z.boolean(),
	marketingEmails: z.boolean(),
	newQuoteAlert: z.boolean(),
	pushNotifications: z.boolean(),
	reportFrequency: z.enum(["daily", "weekly", "monthly"]),
	statusUpdateAlert: z.boolean(),
});

const businessFormSchema = z.object({
	address: z
		.string()
		.min(
			BUSINESS_ADDRESS_MIN_LENGTH,
			`La dirección debe tener al menos ${BUSINESS_ADDRESS_MIN_LENGTH} caracteres`,
		)
		.max(
			BUSINESS_ADDRESS_MAX_LENGTH,
			`La dirección no puede exceder ${BUSINESS_ADDRESS_MAX_LENGTH} caracteres`,
		),
	companyName: z
		.string()
		.min(
			BUSINESS_NAME_MIN_LENGTH,
			`El nombre de la empresa debe tener al menos ${BUSINESS_NAME_MIN_LENGTH} caracteres`,
		)
		.max(
			BUSINESS_NAME_MAX_LENGTH,
			`El nombre de la empresa no puede exceder ${BUSINESS_NAME_MAX_LENGTH} caracteres`,
		),
	currency: z.enum(["ARS", "USD", "EUR"]),
	defaultMargin: z
		.number()
		.min(BUSINESS_MARGIN_MIN, "El margen no puede ser negativo")
		.max(
			BUSINESS_MARGIN_MAX,
			`El margen no puede superar el ${BUSINESS_MARGIN_MAX}%`,
		),
	taxId: z
		.string()
		.min(1, "El CUIT/CUIL es requerido")
		.regex(/^[0-9-]+$/, "Formato de CUIT/CUIL inválido"),
	timezone: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type BusinessFormValues = z.infer<typeof businessFormSchema>;

function ProfileSettings() {
	const form = useForm<ProfileFormValues>({
		defaultValues: {
			bio: "Administrador del sistema de cotizaciones Glasify",
			email: "admin@glasify.com",
			name: "Administrador Glasify",
			phone: "+54 11 1234-5678",
		},
		resolver: zodResolver(profileFormSchema),
	});

	const onSubmit = (data: ProfileFormValues) => {
		form.reset(data);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Perfil de Usuario</CardTitle>
				<CardDescription>
					Actualiza tu información personal y preferencias de cuenta
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nombre completo</FormLabel>
									<FormControl>
										<Input placeholder="Tu nombre completo" {...field} />
									</FormControl>
									<FormDescription>
										Este es tu nombre público que aparece en el sistema
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="tu@email.com" type="email" {...field} />
									</FormControl>
									<FormDescription>
										Tu dirección de email para notificaciones y recuperación de
										cuenta
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Teléfono (opcional)</FormLabel>
									<FormControl>
										<Input placeholder="+54 11 1234-5678" {...field} />
									</FormControl>
									<FormDescription>
										Número de contacto para notificaciones importantes
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="bio"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Biografía (opcional)</FormLabel>
									<FormControl>
										<Textarea
											className="resize-none"
											placeholder="Cuéntanos sobre ti..."
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Breve descripción que aparece en tu perfil
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit">
							<Save className="mr-2 h-4 w-4" />
							Guardar Perfil
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

function NotificationSettings() {
	const form = useForm<NotificationFormValues>({
		defaultValues: {
			emailNotifications: true,
			marketingEmails: false,
			newQuoteAlert: true,
			pushNotifications: false,
			reportFrequency: "weekly",
			statusUpdateAlert: true,
		},
		resolver: zodResolver(notificationFormSchema),
	});

	const onSubmit = (data: NotificationFormValues) => {
		form.reset(data);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Notificaciones</CardTitle>
				<CardDescription>
					Configure cómo y cuándo recibir notificaciones del sistema
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						<div className="space-y-4">
							<h4 className="font-medium text-sm">Canales de Comunicación</h4>

							<FormField
								control={form.control}
								name="emailNotifications"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">
												<Mail className="mr-2 inline h-4 w-4" />
												Notificaciones por Email
											</FormLabel>
											<FormDescription>
												Recibir alertas y actualizaciones por correo electrónico
											</FormDescription>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="pushNotifications"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">
												<Smartphone className="mr-2 inline h-4 w-4" />
												Notificaciones Push
											</FormLabel>
											<FormDescription>
												Recibir notificaciones instantáneas en el navegador
											</FormDescription>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						<Separator />

						<div className="space-y-4">
							<h4 className="font-medium text-sm">Tipos de Notificaciones</h4>

							<FormField
								control={form.control}
								name="newQuoteAlert"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">
												Nuevas Cotizaciones
											</FormLabel>
											<FormDescription>
												Alertas cuando se reciban nuevas solicitudes de
												cotización
											</FormDescription>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="statusUpdateAlert"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">
												Cambios de Estado
											</FormLabel>
											<FormDescription>
												Notificaciones cuando cambie el estado de las
												cotizaciones
											</FormDescription>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="marketingEmails"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">
												Emails de Marketing
											</FormLabel>
											<FormDescription>
												Recibir noticias, actualizaciones y ofertas especiales
											</FormDescription>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						<Separator />

						<FormField
							control={form.control}
							name="reportFrequency"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Frecuencia de Reportes</FormLabel>
									<Select
										defaultValue={field.value}
										onValueChange={field.onChange}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Selecciona la frecuencia" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="daily">Diario</SelectItem>
											<SelectItem value="weekly">Semanal</SelectItem>
											<SelectItem value="monthly">Mensual</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										Con qué frecuencia recibir reportes automáticos de actividad
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit">
							<Save className="mr-2 h-4 w-4" />
							Guardar Preferencias
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

function BusinessSettings() {
	const form = useForm<BusinessFormValues>({
		defaultValues: {
			address: "Av. Corrientes 1234, CABA, Argentina",
			companyName: "Glasify Solutions SRL",
			currency: "ARS",
			defaultMargin: DEFAULT_BUSINESS_MARGIN,
			taxId: "30-12345678-9",
			timezone: "America/Argentina/Buenos_Aires",
		},
		resolver: zodResolver(businessFormSchema),
	});

	const onSubmit = (data: BusinessFormValues) => {
		form.reset(data);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Configuración de Negocio</CardTitle>
				<CardDescription>
					Configuraciones generales del negocio y preferencias operativas
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="companyName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nombre de la Empresa</FormLabel>
									<FormControl>
										<Input placeholder="Mi Empresa SRL" {...field} />
									</FormControl>
									<FormDescription>
										Nombre legal de la empresa que aparece en las cotizaciones
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="taxId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>CUIT/CUIL</FormLabel>
									<FormControl>
										<Input placeholder="30-12345678-9" {...field} />
									</FormControl>
									<FormDescription>
										Número de identificación fiscal de la empresa
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Dirección</FormLabel>
									<FormControl>
										<Textarea
											className="resize-none"
											placeholder="Av. Principal 1234, Ciudad, Provincia"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Dirección comercial que aparece en las cotizaciones
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="defaultMargin"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Margen de Ganancia por Defecto (%)</FormLabel>
										<FormControl>
											<Input
												placeholder="25"
												type="number"
												{...field}
												onChange={(e) =>
													field.onChange(Number.parseFloat(e.target.value) || 0)
												}
											/>
										</FormControl>
										<FormDescription>
											Margen aplicado automáticamente a nuevos productos
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="currency"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Moneda</FormLabel>
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="ARS">
													Peso Argentino (ARS)
												</SelectItem>
												<SelectItem value="USD">
													Dólar Estadounidense (USD)
												</SelectItem>
												<SelectItem value="EUR">Euro (EUR)</SelectItem>
											</SelectContent>
										</Select>
										<FormDescription>
											Moneda por defecto para las cotizaciones
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="timezone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Zona Horaria</FormLabel>
									<Select
										defaultValue={field.value}
										onValueChange={field.onChange}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="America/Argentina/Buenos_Aires">
												Buenos Aires
											</SelectItem>
											<SelectItem value="America/Argentina/Cordoba">
												Córdoba
											</SelectItem>
											<SelectItem value="America/Argentina/Mendoza">
												Mendoza
											</SelectItem>
											<SelectItem value="America/Montevideo">
												Montevideo
											</SelectItem>
											<SelectItem value="America/Sao_Paulo">
												São Paulo
											</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										Zona horaria para fechas y reportes del sistema
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit">
							<Save className="mr-2 h-4 w-4" />
							Guardar Configuración
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

function SystemSettings() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Sistema</CardTitle>
				<CardDescription>
					Configuraciones avanzadas del sistema y mantenimiento
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<Label className="text-base">
								<Database className="mr-2 inline h-4 w-4" />
								Respaldo de Base de Datos
							</Label>
							<p className="text-muted-foreground text-sm">
								Crear respaldo de seguridad de todos los datos
							</p>
						</div>
						<Button variant="outline">
							<RefreshCcw className="mr-2 h-4 w-4" />
							Crear Respaldo
						</Button>
					</div>

					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<Label className="text-base">
								<Shield className="mr-2 inline h-4 w-4" />
								Limpiar Caché del Sistema
							</Label>
							<p className="text-muted-foreground text-sm">
								Eliminar archivos temporales y optimizar rendimiento
							</p>
						</div>
						<Button variant="outline">
							<RefreshCcw className="mr-2 h-4 w-4" />
							Limpiar Caché
						</Button>
					</div>

					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<Label className="text-base">
								<Globe className="mr-2 inline h-4 w-4" />
								Verificar Actualizaciones
							</Label>
							<p className="text-muted-foreground text-sm">
								Buscar e instalar actualizaciones del sistema
							</p>
						</div>
						<Button variant="outline">
							<RefreshCcw className="mr-2 h-4 w-4" />
							Verificar
						</Button>
					</div>
				</div>

				<Separator />

				<div className="space-y-4">
					<h4 className="font-medium text-sm">Información del Sistema</h4>

					<div className="grid gap-4 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Versión:</span>
							<span>1.0.0-beta</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Último Respaldo:</span>
							<span>15/01/2024 14:30</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Espacio Utilizado:</span>
							<span>2.3 GB de 10 GB</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Usuarios Activos:</span>
							<span>1 de 5 licencias</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function SettingsPageContent() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="font-bold text-2xl">Configuración</h1>
				<p className="text-muted-foreground">
					Administra las preferencias y configuración del sistema
				</p>
			</div>

			{/* Settings Tabs */}
			<Tabs className="space-y-4" defaultValue="profile">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger className="flex items-center gap-2" value="profile">
						<User className="h-4 w-4" />
						<span className="hidden md:inline">Perfil</span>
					</TabsTrigger>
					<TabsTrigger
						className="flex items-center gap-2"
						value="notifications"
					>
						<Bell className="h-4 w-4" />
						<span className="hidden md:inline">Notificaciones</span>
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="business">
						<CreditCard className="h-4 w-4" />
						<span className="hidden md:inline">Negocio</span>
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="system">
						<Settings className="h-4 w-4" />
						<span className="hidden md:inline">Sistema</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="profile">
					<ProfileSettings />
				</TabsContent>

				<TabsContent value="notifications">
					<NotificationSettings />
				</TabsContent>

				<TabsContent value="business">
					<BusinessSettings />
				</TabsContent>

				<TabsContent value="system">
					<SystemSettings />
				</TabsContent>
			</Tabs>
		</div>
	);
}
