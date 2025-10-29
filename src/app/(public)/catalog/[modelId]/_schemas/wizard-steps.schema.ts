/**
 * Step-by-step validation schemas
 * Individual schemas for each wizard step to enable progressive validation
 */

import { z } from 'zod';
import {
	MAX_DIMENSION,
	MAX_ROOM_LOCATION_LENGTH,
	MIN_DIMENSION,
} from '../_constants/wizard-config.constants';

/**
 * Step 1: Room Location
 * Validates room location selection or custom input
 */
export const locationStepSchema = z.object({
	roomLocation: z
		.string()
		.min(1, { message: 'Debe seleccionar o ingresar una ubicación' })
		.max(MAX_ROOM_LOCATION_LENGTH, {
			message: `La ubicación no puede exceder ${MAX_ROOM_LOCATION_LENGTH} caracteres`,
		}),
});

/**
 * Step 2: Dimensions and Color
 * Validates width, height, and optional color selection
 */
export const dimensionsStepSchema = z.object({
	width: z
		.number({ message: 'El ancho es requerido' })
		.int({ message: 'El ancho debe ser un número entero' })
		.min(MIN_DIMENSION, {
			message: `El ancho debe ser al menos ${MIN_DIMENSION}mm`,
		})
		.max(MAX_DIMENSION, {
			message: `El ancho no puede exceder ${MAX_DIMENSION}mm`,
		}),

	height: z
		.number({ message: 'El alto es requerido' })
		.int({ message: 'El alto debe ser un número entero' })
		.min(MIN_DIMENSION, {
			message: `El alto debe ser al menos ${MIN_DIMENSION}mm`,
		})
		.max(MAX_DIMENSION, {
			message: `El alto no puede exceder ${MAX_DIMENSION}mm`,
		}),

	colorId: z.string().cuid().nullable(), // Optional
});

/**
 * Step 3: Glass Solution
 * Validates glass solution selection
 */
export const glassStepSchema = z.object({
	glassSolutionId: z
		.string({ message: 'Debe seleccionar una solución de vidrio' })
		.cuid({ message: 'Selección de vidrio inválida' }),
});

/**
 * Step 4: Services
 * Validates service selection (can be empty array)
 */
export const servicesStepSchema = z.object({
	selectedServices: z
		.array(z.string().cuid({ message: 'ID de servicio inválido' }))
		.default([]),
});

/**
 * Infer TypeScript types from schemas
 */
export type LocationStepData = z.infer<typeof locationStepSchema>;
export type DimensionsStepData = z.infer<typeof dimensionsStepSchema>;
export type GlassStepData = z.infer<typeof glassStepSchema>;
export type ServicesStepData = z.infer<typeof servicesStepSchema>;
