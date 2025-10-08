# Refactorización: Services Selector Section

## 📋 Resumen

Se reemplazó completamente el componente `ServicesSelectorSection` por una solución más simple y robusta basada en el patrón oficial de **shadcn/ui** para checkboxes múltiples con React Hook Form.

## ❌ Problemas del Componente Anterior

1. **Complejidad Innecesaria**:
   - Uso de `React.memo` con funciones de comparación personalizadas
   - Múltiples `useCallback` y `useMemo` anidados
   - Componente hijo `ServiceCard` memoizado con lógica compleja
   - Manejo manual del estado con `watch()` y `setValue()`

2. **Problemas de Rendimiento**:
   - Rerenders excesivos por recreación de funciones
   - Dependencias complejas en hooks
   - Estado duplicado entre el formulario y hooks locales

3. **Dificultad de Mantenimiento**:
   - Código difícil de debuggear
   - Múltiples capas de abstracción
   - Lógica esparcida entre varios componentes

## ✅ Nueva Solución

### Patrón Implementado

Basado en el [patrón oficial de shadcn/ui](https://ui.shadcn.com/docs/components/checkbox#form) para checkboxes múltiples:

```tsx
<FormField
  control={control}
  name="items"
  render={() => (
    <FormItem>
      {items.map((item) => (
        <FormField
          key={item.id}
          control={control}
          name="items"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Checkbox
                  checked={field.value?.includes(item.id)}
                  onCheckedChange={(checked) => {
                    return checked
                      ? field.onChange([...field.value, item.id])
                      : field.onChange(
                          field.value?.filter(
                            (value) => value !== item.id
                          )
                        )
                  }}
                />
              </FormControl>
              <FormLabel>{item.label}</FormLabel>
            </FormItem>
          )}
        />
      ))}
    </FormItem>
  )}
/>
```

### Ventajas de la Nueva Implementación

1. **Simplicidad**:
   - Solo 1 componente (antes: 3 componentes + hooks)
   - Sin memoización innecesaria
   - Lógica directa y clara

2. **Patrón Oficial**:
   - Recomendado por shadcn/ui
   - Bien documentado
   - Probado en producción

3. **Mantenibilidad**:
   - Código legible y autodocumentado
   - Fácil de debuggear
   - Sin dependencias complejas

4. **UI Mejorada**:
   - Checkboxes en lista vertical (mejor accesibilidad)
   - Feedback visual claro (border + background cuando seleccionado)
   - Información bien organizada (nombre, tipo, precio, unidad)

## 🎨 Características de UI

### Layout
- Lista vertical con espaciado de `space-y-2`
- Cards con padding de `p-4`
- Transiciones suaves en hover y selección

### Estados Visuales
- **Normal**: Border gris, fondo blanco
- **Seleccionado**: Border primary, fondo primary/5
- **Hover**: Feedback visual en checkbox

### Información Mostrada
- **Nombre del servicio**: En FormLabel con cursor pointer
- **Tipo de servicio**: Badge outline (Superficie, Fijo, Perímetro)
- **Precio**: Formato $XX.XX en negrita
- **Unidad**: Texto secundario (por m², por metro lineal, por unidad)

## 📊 Tipos de Servicios Soportados

Según el schema de Prisma:

### ServiceType
- `area`: Cálculo por superficie (m²)
- `perimeter`: Cálculo por perímetro (metros lineales)
- `fixed`: Costo fijo (por unidad)

### ServiceUnit
- `sqm`: Metro cuadrado
- `ml`: Metro lineal
- `unit`: Unidad

## 🔧 Uso

```tsx
import { ServicesSelectorSection } from './_components/form/sections/services-selector-section';

// En tu formulario
<ServicesSelectorSection services={services} />
```

### Props

```typescript
type ServicesSelectorSectionProps = {
  services: ServiceOutput[];
};
```

### Form Schema

```typescript
const formSchema = z.object({
  additionalServices: z.array(z.string()).default([]),
  // ... otros campos
});
```

## 📝 Notas Técnicas

1. **Sin Memoización**: React es suficientemente rápido para este caso de uso
2. **Patrón FormField Anidado**: Recomendado por React Hook Form para arrays
3. **TypeScript Seguro**: Tipos inferidos desde ServiceOutput del router
4. **Accesibilidad**: Labels asociados correctamente, focus states, keyboard navigation

## 🗂️ Archivos

- **Nuevo**: `services-selector-section.tsx`
- **Backup**: `services-selector-section.tsx.bak`

## 🚀 Migración

No se requieren cambios en otros componentes. La API del componente permanece igual:

```tsx
<ServicesSelectorSection services={services} />
```

El valor retornado en el formulario es el mismo:
```typescript
additionalServices: string[] // Array de IDs de servicios
```
