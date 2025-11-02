"use client";

import {
	Activity,
	AlertTriangle,
	Aperture,
	Award,
	BadgeCheck,
	Box,
	Boxes,
	Building,
	Building2,
	CheckCircle2,
	Circle,
	ClipboardCheck,
	CloudRain,
	Contrast,
	Crosshair,
	Diamond,
	Droplet,
	Eye,
	EyeOff,
	Factory,
	Fingerprint,
	Flame,
	Gauge,
	GlassWater,
	Grid3x3,
	Hammer,
	Hexagon,
	Home,
	Layers,
	Layers2,
	Layers3,
	Lightbulb,
	Lock,
	type LucideIcon,
	Maximize2,
	Minimize2,
	Moon,
	Music,
	Package,
	Palette,
	Ruler,
	Scan,
	Shield,
	ShieldAlert,
	ShieldCheck,
	Snowflake,
	Sparkles,
	Square,
	Star,
	Sun,
	SunDim,
	Target,
	Thermometer,
	ThermometerSnowflake,
	ThermometerSun,
	TrendingUp,
	Unlock,
	Volume2,
	VolumeX,
	Warehouse,
	Waves,
	Wind,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

// Iconos curados para soluciones de vidrio (40 opciones relevantes)
const GLASS_SOLUTION_ICONS: {
	name: string;
	icon: LucideIcon;
	category: string;
}[] = [
	{ category: "Seguridad", icon: ShieldCheck, name: "ShieldCheck" },
	{ category: "Seguridad", icon: Shield, name: "Shield" },
	{ category: "Seguridad", icon: ShieldAlert, name: "ShieldAlert" },
	{ category: "Estructura", icon: Layers, name: "Layers" },
	{ category: "Estructura", icon: Layers2, name: "Layers2" },
	{ category: "Estructura", icon: Layers3, name: "Layers3" },
	{ category: "Aislamiento", icon: Snowflake, name: "Snowflake" },
	{ category: "Resistencia", icon: Flame, name: "Flame" },
	{ category: "Protección", icon: Droplet, name: "Droplet" },
	{ category: "Solar", icon: Sun, name: "Sun" },
	{ category: "Oscurecimiento", icon: Moon, name: "Moon" },
	{ category: "Decorativo", icon: Sparkles, name: "Sparkles" },
	{ category: "Energía", icon: Zap, name: "Zap" },
	{ category: "Visibilidad", icon: Eye, name: "Eye" },
	{ category: "Privacidad", icon: EyeOff, name: "EyeOff" },
	{ category: "Seguridad", icon: Lock, name: "Lock" },
	{ category: "Acceso", icon: Unlock, name: "Unlock" },
	{ category: "Residencial", icon: Home, name: "Home" },
	{ category: "Comercial", icon: Building, name: "Building" },
	{ category: "Comercial", icon: Building2, name: "Building2" },
	{ category: "Industrial", icon: Warehouse, name: "Warehouse" },
	{ category: "Industrial", icon: Factory, name: "Factory" },
	{ category: "Ventilación", icon: Wind, name: "Wind" },
	{ category: "Protección", icon: CloudRain, name: "CloudRain" },
	{ category: "Temperatura", icon: Thermometer, name: "Thermometer" },
	{ category: "Temperatura", icon: ThermometerSun, name: "ThermometerSun" },
	{
		category: "Temperatura",
		icon: ThermometerSnowflake,
		name: "ThermometerSnowflake",
	},
	{ category: "Acústico", icon: Music, name: "Music" },
	{ category: "Sonido", icon: Volume2, name: "Volume2" },
	{ category: "Insonorización", icon: VolumeX, name: "VolumeX" },
	{ category: "Forma", icon: Square, name: "Square" },
	{ category: "Forma", icon: Circle, name: "Circle" },
	{ category: "Forma", icon: Diamond, name: "Diamond" },
	{ category: "Forma", icon: Hexagon, name: "Hexagon" },
	{ category: "Decorativo", icon: Star, name: "Star" },
	{ category: "Color", icon: Palette, name: "Palette" },
	{ category: "Contraste", icon: Contrast, name: "Contrast" },
	{ category: "Control Solar", icon: SunDim, name: "SunDim" },
	{ category: "Textura", icon: Waves, name: "Waves" },
	{ category: "Patrón", icon: Grid3x3, name: "Grid3x3" },
	{ category: "Herramienta", icon: Hammer, name: "Hammer" },
	{ category: "Líquido", icon: GlassWater, name: "GlassWater" },
	{ category: "Óptico", icon: Aperture, name: "Aperture" },
	{ category: "Medición", icon: Ruler, name: "Ruler" },
	{ category: "Iluminación", icon: Lightbulb, name: "Lightbulb" },
	{ category: "Inspección", icon: Scan, name: "Scan" },
	{ category: "Control", icon: ClipboardCheck, name: "ClipboardCheck" },
	{ category: "Validación", icon: CheckCircle2, name: "CheckCircle2" },
	{ category: "Advertencia", icon: AlertTriangle, name: "AlertTriangle" },
	{ category: "Empaque", icon: Box, name: "Box" },
	{ category: "Empaque", icon: Boxes, name: "Boxes" },
	{ category: "Empaque", icon: Package, name: "Package" },
	{ category: "Identificación", icon: Fingerprint, name: "Fingerprint" },
	{ category: "Medición", icon: Gauge, name: "Gauge" },
	{ category: "Actividad", icon: Activity, name: "Activity" },
	{ category: "Rendimiento", icon: TrendingUp, name: "TrendingUp" },
	{ category: "Precisión", icon: Target, name: "Target" },
	{ category: "Calidad", icon: Award, name: "Award" },
	{ category: "Certificación", icon: BadgeCheck, name: "BadgeCheck" },
	{ category: "Enfoque", icon: Crosshair, name: "Crosshair" },
	{ category: "Compacto", icon: Minimize2, name: "Minimize2" },
	{ category: "Expandido", icon: Maximize2, name: "Maximize2" },
];

type IconSelectorProps = {
	value?: string | null;
	onChangeAction: (value: string) => void;
	disabled?: boolean;
};

export function IconSelector({
	value,
	onChangeAction,
	disabled,
}: IconSelectorProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredIcons = GLASS_SOLUTION_ICONS.filter(({ name }) =>
		name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="icon-search">Buscar icono</Label>
				<Input
					disabled={disabled}
					id="icon-search"
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Buscar por nombre..."
					type="search"
					value={searchQuery}
				/>
			</div>

			<Card className="p-4">
				<RadioGroup
					disabled={disabled}
					onValueChange={onChangeAction}
					value={value ?? undefined}
				>
					<div className="flex flex-wrap gap-4">
						{filteredIcons.map(({ name, icon: IconComponent }) => (
							<div className="flex flex-col items-center gap-1" key={name}>
								<Label
									className={cn(
										"flex cursor-pointer flex-col items-center gap-1 rounded-md border-2 p-3 transition-colors hover:border-primary hover:bg-accent",
										value === name && "border-primary bg-accent",
										disabled && "cursor-not-allowed opacity-50",
									)}
									htmlFor={`icon-${name}`}
								>
									<IconComponent className="size-6" />
									<RadioGroupItem
										className="sr-only"
										id={`icon-${name}`}
										value={name}
									/>
								</Label>
								{/* <span className="text-center text-xs">{name}</span> */}
							</div>
						))}
					</div>
				</RadioGroup>

				{filteredIcons.length === 0 && (
					<div className="flex h-[300px] items-center justify-center text-muted-foreground">
						<p>No se encontraron iconos</p>
					</div>
				)}
			</Card>

			{value && (
				<div className="flex items-center gap-2 rounded-md border p-3">
					<span className="text-muted-foreground text-sm">
						Icono seleccionado:
					</span>
					<div className="flex items-center gap-2">
						{(() => {
							const selectedIcon = GLASS_SOLUTION_ICONS.find(
								(icon) => icon.name === value,
							);
							if (selectedIcon) {
								const IconComponent = selectedIcon.icon;
								return (
									<>
										<IconComponent className="size-5" />
										<span className="font-medium text-sm">{value}</span>
									</>
								);
							}
							return <span className="text-sm">{value}</span>;
						})()}
					</div>
				</div>
			)}
		</div>
	);
}
