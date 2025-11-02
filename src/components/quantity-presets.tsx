import { Button } from "@/components/ui/button";

type QuantityPresetsProps = {
	presets: readonly number[];
	onSelect: (value: number) => void;
	className?: string;
};

/**
 * QuantityPresets - Molecule component
 * Grid of preset quantity buttons for quick selection
 * Provides common quantity shortcuts for better UX
 */
export function QuantityPresets({
	presets,
	onSelect,
	className,
}: QuantityPresetsProps) {
	return (
		<div className={className}>
			<div className="flex flex-wrap gap-2">
				{presets.map((preset) => (
					<Button
						key={preset}
						onClick={() => onSelect(preset)}
						size="icon"
						type="button"
					>
						{preset}
					</Button>
				))}
			</div>
		</div>
	);
}
