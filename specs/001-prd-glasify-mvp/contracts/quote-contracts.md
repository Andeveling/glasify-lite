# API Contracts — Glasify MVP

Formato: tRPC procedures con Zod schemas (referencia). Endpoints equivalentes REST documentados para claridad.

## catalog.listModels
- Input: { manufacturerId: string }
- Output: Array<ModelSummary>

## quote.calculateItem
- Input: { modelId: string, widthMm: int, heightMm: int, glassTypeId: string, services: Array<{serviceId:string, quantity?: number}>, adjustments?: Array<{scope:"item", concept:string, unit:"unit"|"sqm"|"ml", sign:"positive"|"negative", value:number}> }
- Output: { dimPrice: number, accPrice: number, services: Array<{serviceId:string, unit:string, quantity:number, amount:number}>, adjustments: Array<{amount:number}>, subtotal:number }

## quote.addItem
- Input: calculateItem input + { quoteId?: string }
- Output: { quoteId:string, itemId:string, subtotal:number }

## quote.submit
- Input: { quoteId:string, contact:{phone:string, address:string} }
- Output: { quoteId:string, status:"sent" }

## admin.model.upsert
- Input: Model payload con límites, costos y compatibilidades
- Output: { modelId:string }

Notas:
- Todos los inputs/outputs validados con Zod; mensajes en es-LA.
- Performance: catálogos <500ms; cálculo <200ms.
