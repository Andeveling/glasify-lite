# Estrategia de Formateo - Dashboard Informativo

**Última actualización**: 24 de octubre de 2025  
**Status**: Actualizado para eliminar duplicidad de dependencias

## 🎯 Objetivo

Centralizar TODOS los formatos de datos en `src/lib/format/index.ts` para garantizar:
- ✅ Consistencia global en UI
- ✅ Respeto a TenantConfig (moneda, locale, zona horaria)
- ✅ Eliminar dependencias duplicadas
- ✅ Facilitar mantenimiento

---

## 📦 Dependencias

### ✅ USAMOS:
- **`@formkit/tempo`** - Ya en package.json, para fechas con soporte de zona horaria
- **`Intl.NumberFormat`** - Nativo del navegador/Node.js para moneda y números
- **`@lib/format`** - Capa de abstracción centralizada

### ❌ NO USAMOS:
- ~~`date-fns-tz`~~ - Eliminado para evitar duplicidad
- ~~Formatting manual~~ - NUNCA `${}` o `%` directamente en componentes

---

## 📋 Formateo Requerido

### 1. Fechas

**Importar de**: `src/lib/format`

```typescript
import { formatDate, formatDateShort, formatDateCustom } from '@lib/format';

// Fecha completa: "19 de enero de 2025"
formatDate(date, 'long', tenantConfig);

// Fecha corta para gráficos: "19 Ene"
formatDateShort(date, tenantConfig);

// Formato personalizado: "19/01/2025"
formatDateCustom(date, 'DD/MM/YYYY', tenantConfig);
```

**⚠️ NUNCA**:
- `date.toLocaleDateString()` sin contexto tenant
- Parsing manual con `date-fns-tz`
- Strings hardcodeados de fechas

---

### 2. Moneda

**Importar de**: `src/lib/format`

```typescript
import { formatCurrency, formatCurrencyCompact } from '@lib/format';

// Moneda completa: "$285.000" (COP) o "$285,000.00" (USD)
formatCurrency(1500000, { context: tenantConfig });

// Notación compacta: "$1,5 M"
formatCurrencyCompact(1500000, { context: tenantConfig });
```

**Casos de uso**:
- Métricas totales: `formatCurrency()`
- Gráficos con valores grandes: `formatCurrencyCompact()`
- Tooltips: `formatCurrency()`

**⚠️ NUNCA**:
- `$${value}` manual
- `new Intl.NumberFormat()` directo
- Hardcodear `COP`, `USD`, etc. - usar `tenantConfig.currency`

---

### 3. Números

**Importar de**: `src/lib/format`

```typescript
import { formatNumber } from '@lib/format';

// Números con separadores: "285.000" (es-CO) o "285,000" (en-US)
formatNumber(285000, { context: tenantConfig });

// Con decimales: "285.000,50"
formatNumber(285000.5, { decimals: 2, context: tenantConfig });
```

**⚠️ NUNCA**:
- `value.toLocaleString()`
- Hardcodear separadores (. o ,)

---

### 4. Porcentajes

**Importar de**: `src/lib/format`

```typescript
import { formatPercent } from '@lib/format';

// Porcentaje: "19%" o "19,00%" según contexto
formatPercent(0.19, { context: tenantConfig });

// Para conversión (0.1923 → 19.23%):
formatPercent(conversionRate, { decimals: 2, context: tenantConfig });
```

**Casos de uso**:
- Tasas de conversión
- Cambios año-a-año
- Porcentajes de distribución

**⚠️ NUNCA**:
- `(value * 100).toFixed(2) + '%'`
- `${Math.round(value * 100)}%`

---

## 🔧 Implementación en Dashboard

### En tRPC Procedures (`src/server/api/routers/dashboard.ts`)

```typescript
import { 
  formatDate, 
  formatCurrency, 
  formatPercent 
} from '@lib/format';

export const dashboard = router({
  getQuotesMetrics: protectedProcedure
    .input(dashboardPeriodSchema)
    .query(async ({ ctx, input }) => {
      const { tenantConfig } = ctx;
      
      // Obtener datos
      const quotes = await db.quote.findMany(/* ... */);
      
      // Formatear ANTES de retornar
      return {
        total: quotes.length,
        value: formatCurrency(totalValue, { context: tenantConfig }),
        conversionRate: formatPercent(rate, { context: tenantConfig }),
        date: formatDateShort(new Date(), tenantConfig),
      };
    }),
});
```

### En Componentes (`src/app/(dashboard)/admin/dashboard/_components/*.tsx`)

```typescript
'use client';

import { formatCurrency, formatPercent, formatDateShort } from '@lib/format';
import type { TenantConfig } from '@prisma/client';

interface MetricCardProps {
  label: string;
  value: number;  // Número sin formato
  type: 'currency' | 'percent' | 'number';
  tenantConfig: TenantConfig;
}

export function MetricCard({ 
  label, 
  value, 
  type, 
  tenantConfig 
}: MetricCardProps) {
  let formatted: string;
  
  switch (type) {
    case 'currency':
      formatted = formatCurrency(value, { context: tenantConfig });
      break;
    case 'percent':
      formatted = formatPercent(value, { context: tenantConfig });
      break;
    default:
      formatted = value.toString();
  }

  return (
    <div>
      <h3>{label}</h3>
      <p>{formatted}</p>
    </div>
  );
}
```

### En Gráficos (Recharts)

```typescript
import { BarChart, Bar, Tooltip } from 'recharts';
import { formatCurrency, formatDateShort } from '@lib/format';

interface ChartProps {
  data: Array<{ date: string; value: number }>;
  tenantConfig: TenantConfig;
}

export function QuotesTrendChart({ data, tenantConfig }: ChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload) return null;
    
    return (
      <div className="rounded bg-white p-2 shadow">
        <p>{formatDateShort(payload[0].payload.date, tenantConfig)}</p>
        <p>{formatCurrency(payload[0].value, { context: tenantConfig })}</p>
      </div>
    );
  };

  return (
    <BarChart data={data}>
      <Bar dataKey="value" />
      <Tooltip content={<CustomTooltip />} />
    </BarChart>
  );
}
```

---

## 🚀 Checklist de Implementación

### Para cada tarea de formateo:

- [ ] Importar formatters de `@lib/format`
- [ ] Pasar `{ context: tenantConfig }` a cada formatter
- [ ] Nunca usar hardcoding de `$`, `%`, separadores
- [ ] En tooltips de gráficos: formatear datos con `@lib/format`
- [ ] En labels de UI: formatear antes de mostrar
- [ ] Verificar NO hay importes de `date-fns-tz` directos

### Antes de mergear:

```bash
# Auditar formateo manual
grep -r "\$\{.*\}" src/app --include="*.tsx" --include="*.ts"
grep -r "toLocaleString" src/app --include="*.tsx" --include="*.ts"
grep -r "toLocaleDateString" src/app --include="*.tsx" --include="*.ts"
grep -r "date-fns-tz" src --include="*.tsx" --include="*.ts"

# Verificar @lib/format disponible
cat src/lib/format/index.ts | grep "export {"
```

---

## 📚 Exportados de `@lib/format`

Verificar que existan estos:

```typescript
export {
  formatDate,              // Fecha completa con estilo
  formatDateShort,         // Fecha corta (ej: "15 Ene")
  formatDateCustom,        // Formato personalizado con tokens
  formatTime,              // Solo hora
  formatDateTime,          // Fecha + hora
  
  formatCurrency,          // Moneda completa
  formatCurrencyCompact,   // Notación compacta (ej: "$1,5 M")
  
  formatNumber,            // Números con separadores
  formatPercent,           // Porcentajes
  
  formatDimensions,        // Para vidrios: "2.500mm × 1.800mm"
  formatArea,              // Para vidrios: "4,50 m²"
  formatThickness,         // Para vidrios: "6mm"
};
```

---

## 🔗 Referencias

- **Tareas actualizadas**: `specs/016-admin-dashboard-charts/tasks.md`
- **Formatters existentes**: `src/lib/format/index.ts`
- **Instrucciones del proyecto**: `.github/copilot-instructions.md`
- **Dependencias**: `package.json` - NO agregar `date-fns-tz`

---

## ⚠️ Cambios Importantes (Este Sprint)

1. **Eliminada consideración de `date-fns-tz`** ✂️
   - Ya tenemos `@formkit/tempo` en package.json
   - Usar `@lib/format` que envuelve Tempo

2. **TODAS las tareas auditadas** ✅
   - T001-T069 actualizadas
   - Énfasis en `@lib/format` como única fuente
   - Auditorías explícitas antes de merge

3. **Formateo centralizado OBLIGATORIO** 📋
   - NO excepciones
   - Audit grep antes de mergear
   - Pull Request debe demostrar 100% compliance
