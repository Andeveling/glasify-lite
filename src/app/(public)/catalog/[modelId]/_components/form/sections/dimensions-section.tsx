import { Package, Ruler } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { FieldContent, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import type { ModelDimensions } from '../../../_types/model.types';

type DimensionsSectionProps = {
  dimensions: ModelDimensions;
};

export function DimensionsSection({ dimensions }: DimensionsSectionProps) {
  const { control } = useFormContext();

  return (
    <FieldSet>
      <FieldLegend>Dimensiones</FieldLegend>
      <FieldDescription>Especifica las dimensiones del vidrio requerido.</FieldDescription>
      <FieldContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ancho</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupInput placeholder="1200" type="number" {...field} />
                    <InputGroupAddon>
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>mm</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <FormDescription>
                  {dimensions.minWidth}-{dimensions.maxWidth}mm
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alto</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupInput placeholder="1800" type="number" {...field} />
                    <InputGroupAddon>
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>mm</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <FormDescription>
                  {dimensions.minHeight}-{dimensions.maxHeight}mm
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput min="1" placeholder="1" type="number" {...field} />
                  <InputGroupAddon>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormDescription>Número de unidades que deseas cotizar</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FieldContent>
    </FieldSet>
  );
}
