# Data Model — UI/UX Glasify MVP

Derivado de la especificación funcional. El modelo físico se mantiene en Prisma; aquí se listan entidades UI/servicio relevantes y reglas.

## Entidades

### Modelo
- id: string (UUID)
- nombre: string
- fabricanteId: string
- rangoAncho: { min: number; max: number } // mm
- rangoAlto: { min: number; max: number } // mm
- precioBase: decimal(12,2)
- compatibilidadesVidrio: GlassType[] // por espesor, uso

Validaciones:
- min <= max en ambos ejes
- precioBase >= 0

### GlassType (Vidrio)
- id: string
- nombre: string
- tipo: 'templado' | 'laminado' | 'float' | 'low-e' | 'dvh' | 'triple'
- espesorMm: number
- atributos: { termico?: boolean; acustico?: boolean; seguridad?: boolean }

### Service (Servicio)
- id: string
- nombre: string
- tipo: 'area' | 'perimetro' | 'fijo'
- precioUnitario: decimal(12,2)

### Quote (Cotización)
- id: string
- estado: 'borrador' | 'enviada' | 'confirmada'
- clienteId?: string
- items: QuoteItem[]
- ajustes: { porcentaje?: number; fijo?: number }
- total: decimal(12,2)

### QuoteItem
- id: string
- modeloId: string
- anchoMm: number
- altoMm: number
- vidrioId: string
- servicios: Array<{ serviceId: string; cantidad: number }>
- cantidad: number
- subtotal: decimal(12,2)

Validaciones:
- ancho/altoo dentro de rango del Modelo
- vidrio compatible con Modelo
- cantidad >= 1

## Reglas de cálculo

P_item = basePrice + costPerMmWidth × deltaWidth + costPerMmHeight × deltaHeight + sum(servicios) + accesorios
- Todos los montos en DECIMAL(12,2)
- Tiempos objetivo: <200ms

## Relaciones
- Fabricante 1..N Modelos
- Modelo N..N GlassType (compatibilidad)
- Quote 1..N QuoteItem