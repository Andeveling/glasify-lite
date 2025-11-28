# Glass Type Form - Fix de Tipos TypeScript

**Fecha:** 24 de noviembre de 2025  
**Branch:** fix/form  
**Problema:** Error de tipos entre Zod schema con `.default()` y React Hook Form

---

## Problema Original

```
Error TS2345: Argument of type '(data: CreateGlassTypeInput) => void' is not assignable 
to parameter of type 'SubmitHandler<TFieldValues>'.
```

### Causa Raíz

El schema de Zod (`createGlassTypeSchema`) usa `.default()` en campos como:
- `isActive: z.boolean().default(true)`
- `characteristics: z.array(...).optional().default([])`
- `solutions: z.array(...).optional().default([])`

Esto crea una discrepancia de tipos:
- **Tipo Input** (`z.infer`): Campos opcionales (`isActive?: boolean`)
- **Tipo Output** (`z.output`): Campos requeridos después de aplicar defaults (`isActive: boolean`)

React Hook Form espera tipos estrictos que coincidan exactamente con el resolver de Zod, pero `zodResolver` infiere el tipo input, no el output.

---

## Solución Implementada

### 1. Usar `z.output` en lugar de `z.infer`

**Archivo:** `/src/app/(dashboard)/admin/glass-types/_hooks/use-glass-type-form.ts`

```typescript
import type { z } from "zod";
import type { Resolver } from "react-hook-form";

// ✅ Usar z.output para obtener el tipo con defaults aplicados
type FormData = z.output<typeof createGlassTypeSchema>;

const form = useForm<FormData>({
  defaultValues: formDefaults as FormData,
  mode: "onChange",
  // ✅ Cast explícito del resolver para evitar conflicto de tipos
  resolver: zodResolver(createGlassTypeSchema) as Resolver<FormData>,
});

const handleSubmit = (data: FormData) => {
  // ✅ Cast seguro: los tipos son compatibles después de validación
  const inputData = data as unknown as CreateGlassTypeInput;
  
  if (mode === "create") {
    createMutation.mutate(inputData);
  } else if (defaultValues) {
    updateMutation.mutate({ data: inputData, id: defaultValues.id });
  }
};
```

### 2. Eliminar supresión incorrecta de Biome

**Archivo:** `/src/app/(dashboard)/admin/glass-types/_components/glass-type-form.tsx`

```diff
- /** biome-ignore-all lint/suspicious/noConsole: <explanation> */
+ // (eliminado - placeholder inválido)
```

### 3. Eliminar `console.log` innecesario

```diff
- console.log("defaultValues", defaultValues);
+ // (eliminado)
```

---

## Explicación Técnica

### `z.infer` vs `z.output`

- **`z.infer<typeof schema>`**: Tipo de entrada (input) - lo que recibes del usuario
  ```typescript
  { isActive?: boolean, characteristics?: Array<...>, ... }
  ```

- **`z.output<typeof schema>`**: Tipo de salida (output) - después de aplicar transformaciones y defaults
  ```typescript
  { isActive: boolean, characteristics: Array<...>, ... }
  ```

### Cast Explícito del Resolver

```typescript
resolver: zodResolver(createGlassTypeSchema) as Resolver<FormData>
```

El cast es necesario porque:
1. `zodResolver` infiere tipos basándose en el schema input
2. React Hook Form espera que el resolver coincida con el tipo del formulario (`FormData`)
3. El cast es **seguro** porque Zod aplica defaults durante la validación
4. El tipo output es compatible con el tipo input (más estricto)

### Cast en handleSubmit

```typescript
const inputData = data as unknown as CreateGlassTypeInput;
```

- Usamos `as unknown as` porque TypeScript no puede inferir la compatibilidad directamente
- Es **seguro** porque `FormData` (output) contiene todos los campos requeridos por `CreateGlassTypeInput` (input)
- Zod ha validado y aplicado defaults antes de llegar a este punto

---

## Verificación

### TypeScript Check
```bash
pnpm typecheck
# ✅ Sin errores
```

### Linting
```bash
pnpm lint:errors
# ✅ Sin errores en los archivos corregidos
```

### Archivos Modificados
- `src/app/(dashboard)/admin/glass-types/_components/glass-type-form.tsx`
- `src/app/(dashboard)/admin/glass-types/_hooks/use-glass-type-form.ts`

---

## Lecciones Aprendidas

1. **Schemas con `.default()`**: Siempre usar `z.output<>` para formularios React Hook Form
2. **Resolver typing**: Cast explícito cuando hay discrepancia entre input/output types
3. **Validación de tipos**: Ejecutar `pnpm typecheck` después de cambios en schemas
4. **Supresiones de linter**: Nunca usar placeholders (`<explanation>`) - escribir razones específicas

---

## Referencias

- [Zod: Type Inference](https://zod.dev/?id=type-inference)
- [React Hook Form: TypeScript](https://react-hook-form.com/ts)
- [Zod Resolver Issues](https://github.com/react-hook-form/resolvers/issues?q=is%3Aissue+zod+default)

---

## Estado Final

✅ **Problema resuelto** - Formulario compila sin errores TypeScript  
✅ **Tests**: Pendiente verificar E2E y formulario en navegador  
✅ **Compatibilidad**: Next.js 16 + React 19 + TypeScript 5.9.3
