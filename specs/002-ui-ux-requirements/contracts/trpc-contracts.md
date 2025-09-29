# Contratos tRPC — UI/UX

## catalog.list-models
 input: { manufacturerId?: string; type?: string; q?: string }
 output: Array<{ id: string; name: string; manufacturer: string; range: { width: [number,number]; height: [number,number] }; basePrice: string }>
 SLA: <500ms

 input: { modelId: string; widthMm: number; heightMm: number; glassId: string; services: Array<{ serviceId: string; quantity: number }>; quantity: number }
 output: { subtotal: string; details: Record<string,string> }
 SLA: <200ms
- SLA: <200ms
 input: { ...calculateItemInput }
 output: { ok: true, itemId: string }
- input: { ...calculateItemInput }
 input: { quoteId: string; contact: { phone: string }; address: string }
 output: { ok: true; quoteId: string }
## quote.submit
- input: { quoteId: string; contacto: { phone: string }; address: string }
- output: { ok: true; quoteId: string }
