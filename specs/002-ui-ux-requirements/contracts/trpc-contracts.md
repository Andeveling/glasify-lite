# Contratos tRPC — UI/UX

## catalog.list-models
- input: { fabricanteId?: string; tipo?: string; q?: string }
- output: Array<{ id: string; nombre: string; fabricante: string; rango: { ancho: [number,number]; alto: [number,number] }; precioBase: string }>
- SLA: <500ms

## quote.calculate-item
- input: { modeloId: string; anchoMm: number; altoMm: number; vidrioId: string; servicios: Array<{ serviceId: string; cantidad: number }>; cantidad: number }
- output: { subtotal: string; detalles: Record<string,string> }
- SLA: <200ms

## quote.add-item
- input: { ...calculateItemInput }
- output: { ok: true, itemId: string }

## quote.submit
- input: { quoteId: string; contacto: { telefono: string }; direccion: string }
- output: { ok: true; quoteId: string }
