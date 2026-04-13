"use client"

import { Trash2 } from "lucide-react"
import { useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/format"
import { parseCompatibleGlassTypeIds } from "@/lib/utils/compatible-glass-types"
import type { AdminQuoteItemValues } from "./schemas/admin-quote-form.schema"

type QuoteItemRowProps = {
  fields: {
    id: string
    glassTypeId: string
    heightMm: number
    modelId: string
    quantity: number
    widthMm: number
  }[]
  glassTypes: {
    id: string
    name: string
    thicknessMm: number
    pricePerSqm: number
  }[]
  index: number
  models: {
    id: string
    name: string
    basePrice: number
    costPerMmWidth: number
    costPerMmHeight: number
    compatibleGlassTypeIds: string[]
  }[]
  onRemove: (index: number) => void
}

const SQUARE_MM_IN_SQM = 1_000_000
const DECIMAL_ROUNDING_FACTOR = 100

export function QuoteItemRow({ fields, glassTypes, index, models, onRemove }: QuoteItemRowProps) {
  const form = useFormContext<{
    items: AdminQuoteItemValues[]
  }>()

  // Watch the modelId for this row to filter compatible glass types
  const selectedModelId = useWatch({
    control: form.control,
    name: `items.${index}.modelId`,
  })

  // Watch other fields for price calculation
  const selectedGlassTypeId = useWatch({
    control: form.control,
    name: `items.${index}.glassTypeId`,
  })
  const widthMm = useWatch({
    control: form.control,
    name: `items.${index}.widthMm`,
  })
  const heightMm = useWatch({
    control: form.control,
    name: `items.${index}.heightMm`,
  })
  const quantity = useWatch({
    control: form.control,
    name: `items.${index}.quantity`,
  })

  // Get compatible glass types based on selected model
  const compatibleGlassTypes = useMemo(() => {
    if (!selectedModelId) {
      return glassTypes
    }

    const model = models.find((m) => m.id === selectedModelId)
    if (!model) {
      return glassTypes
    }

    // compatibleGlassTypeIds may already be parsed or a JSON string
    const compatibleIds = Array.isArray(model.compatibleGlassTypeIds)
      ? model.compatibleGlassTypeIds
      : parseCompatibleGlassTypeIds(model.compatibleGlassTypeIds)

    if (compatibleIds.length === 0) {
      return glassTypes // Show all if no restrictions
    }

    return glassTypes.filter((gt) => compatibleIds.includes(gt.id))
  }, [selectedModelId, models, glassTypes])

  // Calculate price for this item
  const itemPrice = useMemo(() => {
    if (!(selectedModelId && selectedGlassTypeId && widthMm && heightMm && quantity)) {
      return null
    }

    const model = models.find((m) => m.id === selectedModelId)
    const glassType = glassTypes.find((gt) => gt.id === selectedGlassTypeId)

    if (!(model && glassType)) {
      return null
    }

    const areaSqm = (widthMm * heightMm) / SQUARE_MM_IN_SQM
    const widthCost = widthMm * model.costPerMmWidth
    const heightCost = heightMm * model.costPerMmHeight
    const glassCost = areaSqm * glassType.pricePerSqm
    const unitPrice = model.basePrice + widthCost + heightCost + glassCost
    const subtotal = unitPrice * quantity

    return {
      unitPrice: Math.round(unitPrice * DECIMAL_ROUNDING_FACTOR) / DECIMAL_ROUNDING_FACTOR,
      subtotal: Math.round(subtotal * DECIMAL_ROUNDING_FACTOR) / DECIMAL_ROUNDING_FACTOR,
    }
  }, [selectedModelId, selectedGlassTypeId, widthMm, heightMm, quantity, models, glassTypes])

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-13 md:items-end">
      {/* Model Selector */}
      <FormField
        control={form.control}
        name={`items.${index}.modelId`}
        render={({ field }) => (
          <FormItem className="md:col-span-4">
            <FormLabel>Modelo</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Glass Type Selector */}
      <FormField
        control={form.control}
        name={`items.${index}.glassTypeId`}
        render={({ field }) => (
          <FormItem className="md:col-span-3">
            <FormLabel>Tipo de Vidrio</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Vidrio" />
                </SelectTrigger>
                <SelectContent>
                  {compatibleGlassTypes.map((gt) => (
                    <SelectItem key={gt.id} value={gt.id}>
                      {gt.name} ({gt.thicknessMm}mm)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Width */}
      <FormField
        control={form.control}
        name={`items.${index}.widthMm`}
        render={({ field }) => (
          <FormItem className="md:col-span-1">
            <FormLabel>Ancho (mm)</FormLabel>
            <FormControl>
              <Input
                {...field}
                min={1}
                onChange={(e) => field.onChange(Number(e.target.value))}
                type="number"
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Height */}
      <FormField
        control={form.control}
        name={`items.${index}.heightMm`}
        render={({ field }) => (
          <FormItem className="md:col-span-1">
            <FormLabel>Alto (mm)</FormLabel>
            <FormControl>
              <Input
                {...field}
                min={1}
                onChange={(e) => field.onChange(Number(e.target.value))}
                type="number"
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Quantity */}
      <FormField
        control={form.control}
        name={`items.${index}.quantity`}
        render={({ field }) => (
          <FormItem className="md:col-span-1">
            <FormLabel>Cantidad</FormLabel>
            <FormControl>
              <Input
                {...field}
                min={1}
                onChange={(e) => field.onChange(Number(e.target.value))}
                type="number"
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Price Display */}
      <div className="flex items-center justify-end md:col-span-2">
        {itemPrice ? (
          <div className="text-right">
            <span className="text-muted-foreground text-xs">
              {formatCurrency(itemPrice.unitPrice)} c/u
            </span>
            <p className="font-medium">{formatCurrency(itemPrice.subtotal)}</p>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </div>

      {/* Delete Button */}
      <div className="flex justify-end md:col-span-1">
        <Button
          disabled={fields.length === 1}
          onClick={() => onRemove(index)}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}
