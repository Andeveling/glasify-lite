/**
 * Zod validation schemas for wizard form
 * Main form schema with all field validations
 */

import { z } from 'zod';
import {
	MAX_DIMENSION,
	MAX_ROOM_LOCATION_LENGTH,
	MIN_DIMENSION,
	WIZARD_MAX_STEP,
} from '../_constants/wizard-config.constants';

/**
 * Main wizard form schema
 * Validates the complete form data across all steps
 */
export const wizardFormSchema = z.object({
	roomLocation: z
		.string()
		.min(1, { message: 'La ubicación es requerida' })
		.max(MAX_ROOM_LOCATION_LENGTH, {
			message: 'La ubicación no puede exceder 100 caracteres',
		}),

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

	colorId: z.string().cuid().nullable(),

	glassSolutionId: z
		.string({ message: 'Debe seleccionar una solución de vidrio' })
		.cuid({ message: 'ID de solución de vidrio inválido' })
		.nullable(),

	selectedServices: z.array(z.string().cuid()).default([]),

	modelId: z.string().cuid(),

	currentStep: z.number().int().min(1).max(WIZARD_MAX_STEP),

	lastUpdated: z.string().datetime(),
});

/**
 * Infer TypeScript type from schema
 */
export type WizardFormSchema = z.infer<typeof wizardFormSchema>;
