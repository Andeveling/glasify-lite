/**
 * ThermalPropertiesSection Component (Organism)
 *
 * Form section for thermal and optical properties
 *
 * Fields:
 * - U-Value (optional)
 * - Solar Factor (optional)
 * - Light Transmission (optional)
 *
 * @module _components/sections/thermal-properties-section
 */

'use client';

import type { Control } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import type { CreateGlassTypeInput } from '@/lib/validations/admin/glass-type.schema';
import { FormNumberField } from '../form-fields/form-number-field';

interface ThermalPropertiesSectionProps {
  control: Control<CreateGlassTypeInput>;
}

/**
 * Thermal and optical properties section component
 */
export function ThermalPropertiesSection({ control }: ThermalPropertiesSectionProps) {
  return (
    <Card>
      <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
        {/* U-Value */}
        <FormNumberField
          control={control}
          description="Transmitancia térmica (opcional)"
          label="Valor U (W/m²·K)"
          max={10}
          min={0}
          name="uValue"
          step={0.01}
        />

        {/* Solar Factor */}
        <FormNumberField
          control={control}
          description="0.00-1.00 (opcional)"
          label="Factor Solar (g)"
          max={1}
          min={0}
          name="solarFactor"
          step={0.01}
        />

        {/* Light Transmission */}
        <FormNumberField
          control={control}
          description="0.00-1.00 (opcional)"
          label="Transmisión de Luz"
          max={1}
          min={0}
          name="lightTransmission"
          step={0.01}
        />
      </CardContent>
    </Card>
  );
}
