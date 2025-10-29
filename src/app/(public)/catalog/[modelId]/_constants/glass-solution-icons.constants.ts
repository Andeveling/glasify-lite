/**
 * Glass solution category icon mappings
 * Maps glass solution categories to Lucide React icons with labels and colors
 */

import { Flame, Shield, Sun, Volume2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type GlassSolutionIconConfig = {
	icon: LucideIcon;
	label: string;
	color: string;
};

/**
 * Icon configuration for each glass solution category
 * Colors use Tailwind CSS classes for consistency
 */
export const GLASS_SOLUTION_ICONS: Record<string, GlassSolutionIconConfig> = {
	thermal: {
		icon: Flame,
		label: 'Térmico',
		color: 'text-orange-500',
	},
	acoustic: {
		icon: Volume2,
		label: 'Acústico',
		color: 'text-blue-500',
	},
	solar: {
		icon: Sun,
		label: 'Solar',
		color: 'text-yellow-500',
	},
	security: {
		icon: Shield,
		label: 'Seguridad',
		color: 'text-green-500',
	},
} as const;

/**
 * Default icon configuration for unknown categories
 */
export const DEFAULT_GLASS_ICON: GlassSolutionIconConfig = {
	icon: Shield,
	label: 'Vidrio',
	color: 'text-gray-500',
};
