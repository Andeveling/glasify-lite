/**
 * Color Selection Hook
 * Manages color selection state and surcharge percentage
 */

import { useState } from "react";

type UseColorSelectionReturn = {
	colorSurchargePercentage: number;
	handleColorChange: (
		colorId: string | undefined,
		surchargePercentage: number,
	) => void;
	selectedColorId: string | undefined;
};

/**
 * Handle color selection state
 *
 * @returns Color selection state and change handler
 *
 * @example
 * const { selectedColorId, colorSurchargePercentage, handleColorChange } = useColorSelection();
 *
 * <ColorSelector onColorChange={handleColorChange} />
 */
export function useColorSelection(): UseColorSelectionReturn {
	const [selectedColorId, setSelectedColorId] = useState<string | undefined>();
	const [colorSurchargePercentage, setColorSurchargePercentage] = useState(0);

	const handleColorChange = (
		colorId: string | undefined,
		surchargePercentage: number,
	) => {
		setSelectedColorId(colorId);
		setColorSurchargePercentage(surchargePercentage);
	};

	return {
		colorSurchargePercentage,
		handleColorChange,
		selectedColorId,
	};
}
