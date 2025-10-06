'use client';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
/**
 * FIXME: el use client solo sera mientras creamos el layout y la página.
 * Luego, la página será RSC y el layout SCC.
 * TODOs para la nueva implementación:
 *
 * 1. Obtener el modelo por ID usando tRPC (get-model-by-id)
 * 2. Mostrar columna izquierda con info del modelo:
 *    - Nombre
 *    - Fabricante
 *    - Tipo de vidrio compatible
 *    - Precio base
 *    - Dimensiones mínimas/máximas
 *    - Imagen (si existe)
 *    - Especificaciones técnicas
 * 3. Mostrar columna derecha con formulario de parametrización:
 *    - Ancho (mm)
 *    - Alto (mm)
 *    - Cantidad
 *    - Servicios adicionales (pulido, corte, etc.)
 *    - Observaciones
 *    - Validación con Zod (modelParametrizationSchema)
 *    - Botón "Añadir a cotización"
 * 4. Manejar loading y error states
 * 5. Mostrar resumen de precio calculado en tiempo real
 * 6. Navegación segura (volver al catálogo si el modelo no existe)
 * 7. Accesibilidad y responsividad
 * 8. Logging de eventos relevantes (Winston)
 *
 * @returns Página de parametrización de modelo para cotización
 */
export default function ModelFormPage() {
  const form = useForm();
  return (
    <div className="container mx-auto max-w-7xl">
      <div>columna 1: info del modelo</div>
      <Form {...form}>
        {/* TODO: Implementar funcion onSubmit real */}
        <form onSubmit={form.handleSubmit((data) => console.log(data))}>
          {/*  seccion de Dimensiones  */}
          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ancho (mm) </FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>
                  {/* Se debe incluir las medidas reales de cada modelo no harcodeadas */}
                  Indica el ancho en milímetros. Mínimo 300mm, máximo 2000mm.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
