import { ArrowDownUp, ArrowRightLeft } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type DimensionInputProps = {
  value: number | "";
  onChange: (value: number | "") => void;
  min: number;
  max: number;
  placeholder: string;
  isValid: boolean;
  unit?: string;
  dimensionType?: "width" | "height";
  className?: string;
};

/**
 * DimensionInput - Molecule component
 * Input field for dimension values with icon, unit display, and validation styling
 * Uses theme colors for validation states (success/destructive)
 * Icon changes based on dimension type: ArrowRightLeft for width, ArrowDownUp for height
 */
export function DimensionInput({
  value,
  onChange,
  min,
  max,
  placeholder,
  isValid,
  unit = "mm",
  dimensionType = "width",
  className,
}: DimensionInputProps) {
  const hasValue = value !== "";

  // Select icon based on dimension type
  const DimensionIcon =
    dimensionType === "width" ? ArrowRightLeft : ArrowDownUp;

  return (
    <InputGroup className={cn("shadow-none", className)}>
      <InputGroupInput
        className={cn(
          "border-0 bg-transparent text-center font-bold text-2xl shadow-none transition-all"
        )}
        max={max}
        min={min}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        placeholder={placeholder}
        step="1"
        type="number"
        value={value}
      />
      <InputGroupAddon>
        <DimensionIcon
          className={cn("h-4 w-4", {
            "text-destructive": hasValue && !isValid,
            "text-muted-foreground": !hasValue,
            "text-success": hasValue && isValid,
          })}
        />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupText>{unit}</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}
