# Currency Formatting Utility

Utilidad robusta para formatear precios usando la API de Internacionalización (`Intl.NumberFormat`) de JavaScript.

## Características

- ✅ Formateo de divisas con soporte multi-idioma
- ✅ Configuración por defecto optimizada para Colombia (COP)
- ✅ Formato compacto para números grandes
- ✅ Parser de strings de divisa a número
- ✅ Type-safe con TypeScript
- ✅ Fallback automático si `Intl` falla

## API

### `formatCurrency(value, options?)`

Función principal para formatear divisas.

```typescript
formatCurrency(285000) // "$285.000" (COP por defecto)
formatCurrency(285000, { currency: 'USD', locale: 'en-US' }) // "$285,000"
formatCurrency(285000, { decimals: 2 }) // "$285.000,00"
formatCurrency(285000, { display: 'code' }) // "285.000 COP"
```

#### Opciones

| Opción        | Tipo                           | Default    | Descripción               |
| ------------- | ------------------------------ | ---------- | ------------------------- |
| `currency`    | `string`                       | `'COP'`    | Código de divisa ISO 4217 |
| `locale`      | `string`                       | `'es-CO'`  | Locale para formateo      |
| `decimals`    | `number`                       | `0`        | Decimales a mostrar       |
| `display`     | `'symbol' \| 'code' \| 'name'` | `'symbol'` | Modo de visualización     |
| `useGrouping` | `boolean`                      | `true`     | Usar separadores de miles |

### `formatCOP(value, showDecimals?)`

Atajo optimizado para Pesos Colombianos.

```typescript
formatCOP(285000) // "$285.000"
formatCOP(285000.50, true) // "$285.000,50"
```

### `formatCurrencyCompact(value, options?)`

Formato compacto para números grandes.

```typescript
formatCurrencyCompact(1500000) // "$1,5 M"
formatCurrencyCompact(2500) // "$2,5 mil"
formatCurrencyCompact(500000000) // "$500 M"
```

### `parseCurrency(formattedValue, locale?)`

Convierte string formateado a número.

```typescript
parseCurrency("$285.000") // 285000
parseCurrency("$285,000", "en-US") // 285000
parseCurrency("€1.234,56", "es-ES") // 1234.56
```

### Constantes

```typescript
// Códigos de divisa
CurrencyCodes.cop // 'COP'
CurrencyCodes.usd // 'USD'
CurrencyCodes.eur // 'EUR'
CurrencyCodes.mxn // 'MXN'

// Códigos de locale
LocaleCodes.esCo // 'es-CO'
LocaleCodes.enUs // 'en-US'
LocaleCodes.esMx // 'es-MX'
LocaleCodes.esEs // 'es-ES'
```

## Uso en Componentes

### React Component

```tsx
import { formatCurrency } from '@/app/_utils/format-currency.util';

function QuoteSummary({ price, currency = 'COP' }: Props) {
  return (
    <div>
      <span>{formatCurrency(price, { currency })}</span>
    </div>
  );
}
```

### Con opciones dinámicas

```tsx
const formattedPrice = formatCurrency(displayPrice, {
  currency: userCurrency,
  locale: userLocale,
  decimals: showDecimals ? 2 : 0,
});
```

### En tablas y listas

```tsx
{items.map(item => (
  <tr key={item.id}>
    <td>{item.name}</td>
    <td>{formatCOP(item.price)}</td>
  </tr>
))}
```

## Casos de Uso

### 1. Precios en diferentes divisas

```typescript
const prices = {
  cop: formatCurrency(285000, { currency: 'COP' }), // "$285.000"
  usd: formatCurrency(75, { currency: 'USD', locale: 'en-US' }), // "$75"
  eur: formatCurrency(65, { currency: 'EUR', locale: 'es-ES' }), // "65 €"
};
```

### 2. Mostrar totales con decimales

```typescript
const total = formatCurrency(totalPrice, {
  currency: 'COP',
  decimals: 2,
}); // "$285.000,50"
```

### 3. Formato compacto en gráficos

```typescript
const chartLabel = formatCurrencyCompact(5000000); // "$5 M"
```

### 4. Parser para inputs controlados

```typescript
const handlePriceChange = (value: string) => {
  const numericValue = parseCurrency(value);
  updatePrice(numericValue);
};
```

## Beneficios vs Formateo Manual

### ❌ Antes (hardcoded)

```typescript
`$ ${displayPrice.toFixed(0)} ${currency}` // "$285000 COP"
```

**Problemas:**
- ❌ Sin separadores de miles
- ❌ Sin soporte multi-idioma
- ❌ No respeta formato local
- ❌ Difícil de mantener

### ✅ Después (con utilidad)

```typescript
formatCurrency(displayPrice, { currency }) // "$285.000"
```

**Ventajas:**
- ✅ Separadores correctos según locale
- ✅ Símbolo de divisa apropiado
- ✅ Soporte multi-idioma automático
- ✅ Mantenible y testeable

## Testing

```typescript
import { formatCurrency, parseCurrency } from '@/app/_utils/format-currency.util';

describe('formatCurrency', () => {
  it('formats Colombian Pesos correctly', () => {
    expect(formatCurrency(285000)).toBe('$285.000');
  });

  it('formats with decimals', () => {
    expect(formatCurrency(285000.50, { decimals: 2 })).toBe('$285.000,50');
  });

  it('handles different currencies', () => {
    expect(formatCurrency(100, { currency: 'USD', locale: 'en-US' })).toBe('$100');
  });
});

describe('parseCurrency', () => {
  it('parses Colombian format', () => {
    expect(parseCurrency('$285.000')).toBe(285000);
  });

  it('parses US format', () => {
    expect(parseCurrency('$285,000', 'en-US')).toBe(285000);
  });
});
```

## Mejoras Futuras

- [ ] Soporte para más divisas (ARS, BRL, CLP, etc.)
- [ ] Detección automática de locale del navegador
- [ ] Formato de rangos de precios
- [ ] Comparación de precios con indicador visual
- [ ] Hook de React personalizado `useCurrencyFormat`

## Referencias

- [MDN: Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [ISO 4217 Currency Codes](https://en.wikipedia.org/wiki/ISO_4217)
