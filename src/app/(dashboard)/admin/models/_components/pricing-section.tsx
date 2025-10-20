/**
 * Pricing Section
 *
 * Base price, costs per mm, accessory price, and profit margin
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormCurrencyInput, FormPercentageInput } from './form-fields';

export function PricingSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Precios y Costos</CardTitle>
        <CardDescription>Estructura de precios del modelo</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {/* Base Price */}
        <div className="md:col-span-2">
          <FormCurrencyInput
            description="Precio base del modelo sin variaciones"
            label="Precio Base"
            name="basePrice"
            placeholder="0.00"
            required
          />
        </div>

        {/* Variable Costs */}
        <div className="space-y-4 md:col-span-2">
          <h4 className="font-medium text-sm">Costos Variables</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <FormCurrencyInput
              description="Costo adicional por milímetro de ancho"
              label="Costo por mm Ancho"
              name="costPerMmWidth"
              placeholder="0.00"
              required
            />

            <FormCurrencyInput
              description="Costo adicional por milímetro de alto"
              label="Costo por mm Alto"
              name="costPerMmHeight"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Additional Costs */}
        <FormCurrencyInput
          description="Precio de accesorios incluidos (opcional)"
          label="Precio de Accesorios"
          name="accessoryPrice"
          placeholder="0.00"
        />

        <FormPercentageInput
          description="Margen de ganancia sobre el costo total"
          label="Margen de Ganancia"
          max={100}
          min={0}
          name="profitMarginPercentage"
          placeholder="0.00"
        />
      </CardContent>
    </Card>
  );
}
