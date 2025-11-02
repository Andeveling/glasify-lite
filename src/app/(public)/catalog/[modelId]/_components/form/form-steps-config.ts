/**
 * Form Step Configuration
 * Single Responsibility: Defines form steps structure and metadata
 */

export type FormStepId = "dimensions" | "glassType" | "color" | "services";

export type FormStep = {
	id: FormStepId;
	label: string;
	icon: string;
	description: string;
	order: number;
};

/**
 * Form steps in configuration order
 * Represents the logical flow of the quote wizard
 *
 * Order (requested by client):
 * 1. Dimensiones (size)
 * 2. Color (aesthetic choice - second priority)
 * 3. Tipo de Vidrio (technical specs)
 * 4. Servicios (add-ons)
 */
export const FORM_STEPS: FormStep[] = [
	{
		description: "Define el tamaño del vidrio",
		icon: "📏",
		id: "dimensions",
		label: "Dimensiones",
		order: 1,
	},
	{
		description: "Elige un color (opcional)",
		icon: "🎨",
		id: "color",
		label: "Color",
		order: 2,
	},
	{
		description: "Selecciona el tipo de vidrio",
		icon: "🔷",
		id: "glassType",
		label: "Tipo de Vidrio",
		order: 3,
	},
	{
		description: "Agrega servicios adicionales",
		icon: "🛠️",
		id: "services",
		label: "Servicios",
		order: 4,
	},
];

/**
 * Get step by ID
 */
export function getStepById(id: FormStepId): FormStep | undefined {
	return FORM_STEPS.find((step) => step.id === id);
}

/**
 * Get step progress percentage (0-100)
 */
export function getStepProgress(currentStep: number): number {
	const PERCENTAGE_MULTIPLIER = 100;
	return Math.round((currentStep / FORM_STEPS.length) * PERCENTAGE_MULTIPLIER);
}

/**
 * Filter steps based on feature availability
 * Used to hide steps that don't apply to the current model/configuration
 *
 * @param options - Feature flags to determine which steps to show
 * @returns Filtered array of form steps
 */
export function getAvailableSteps(options: {
	hasColors?: boolean;
	hasServices?: boolean;
}): FormStep[] {
	return FORM_STEPS.filter((step) => {
		// Always show dimensions and glass type
		if (step.id === "dimensions" || step.id === "glassType") {
			return true;
		}

		// Only show color step if model has colors
		if (step.id === "color") {
			return options.hasColors ?? false;
		}

		// Only show services step if services are available
		if (step.id === "services") {
			return options.hasServices ?? false;
		}

		return true;
	});
}
