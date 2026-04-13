# Plan: Asistente AI de Creacion y Calibracion de Modelos

**Goal**: Extender el asistente de calibracion para que Juan pueda crear modelos de 0 de manera asistida por AI, asociarlos a proveedores especificos, y luego calibrarlos con los precios de ese proveedor. El mismo diseño (OX, XOX) puede existir para multiples proveedores.

**Supuestos**:
- Los `DesignTemplate` ya existen en el sistema (patrones como OX, XX, XOX)
- Los `ProfileSupplier` ya existen (Extralum, Rehau, Azembla)
- El asistente tiene tools para crear todos estos recursos
- La memoria SQLite guarda el contexto completo de la sesion de creacion

---

## Concepto: Modelo como Combinacion Diseno + Proveedor + Calibracion

Un "modelo" en Glasify es la combinacion de:

```
Modelo = Diseno (plantilla) + Proveedor (perfil) + Calibracion (precios)
```

El mismo diseño "Corredera 2 Hojas" (OX) puede tener:

| Modelo | Proveedor | Descripcion |
|--------|-----------|-------------|
| VC Panama 2P OX | Extralum | Corredera basica para mercado Panama |
| Europa 2P OX | Rehau | Corredera premium PVC para Colombia |
| Acero 2P OX | Azembla | Corredera acero para proyecto industrial |

Cada uno tiene:
- El mismo patron de diseno (OX)
- Diferente proveedor de perfiles
- Diferentes precios de calibracion

---

## Arquitectura Expandida del Asistente

### Flujo completo que el asistente debe poder guiar

```
Juan: Quiero crear una ventana corrediza de 2 hojas para Panama
AI:   Perfecto! Eso seria el modelo "VC Panama 2P" con diseno OX.
      Ya tengo a Extralum como proveedor. 
      Las dimensiones tipicas son 600-2000mm ancho y 400-2400mm alto.
      Esta bien si usamos esas dimensiones?
      
Juan: Si, pero la maxima altura quiero 2200mm
AI:   Perfecto! Entonces: VC Panama 2P, OX, Extralum, 600-2000 x 400-2200mm.
      Ya cree el modelo en el sistema (estado: draft).
      Ahora vamos a calibrar los precios con Extralum.
      Tiene a la mano los precios de las barras de aluminio?

... continua con el flujo de calibracion ...
```

### Modelo de datos que se crea/actualiza

```
1. DesignTemplate (ya existe): "OX" (corredera 2 hojas, 2 moviles, 1 fijo)
   - El asistente lo selecciona de una lista

2. ProfileSupplier: "Extralum" (ya existe o se crea)
   - El asistente lo selecciona o crea

3. Model: NUEVO
   - name: "VC Panama 2P"
   - designTemplateId: "ox-template-id"
   - profileSupplierId: "extralum-id"
   - status: "draft"
   - minWidthMm: 600, maxWidthMm: 2000
   - minHeightMm: 400, maxHeightMm: 2200
   - compatibleGlassTypeIds: [...] (seleccion de vidrios)

4. ModelCostBreakdown: se llena despues de calibrar

5. ModelPriceHistory: se llena despues de calibrar
```

---

## Extended Toolset

### Tools de Consulta (leer)

```typescript
// Tool: list_design_templates
// Lista plantillas de diseno disponibles (OX, XX, XOX, etc.)
{
  name: 'list_design_templates',
  description: 'Lista todas las plantillas de diseno disponibles en el catalogo',
  parameters: z.object({})
}

// Tool: get_design_template
// Detalle de una plantilla de diseno
{
  name: 'get_design_template',
  description: 'Obtiene los detalles de una plantilla de diseno',
  parameters: z.object({
    templateId: z.string(),
  })
}

// Tool: list_profile_suppliers
// Lista proveedores de perfiles disponibles
{
  name: 'list_profile_suppliers',
  description: 'Lista todos los proveedores de perfiles de aluminio',
  parameters: z.object({})
}

// Tool: list_models
// Lista modelos existentes, optionally filtered
{
  name: 'list_models',
  description: 'Lista los modelos del catalogo, optionally filtered by supplier or status',
  parameters: z.object({
    supplierId: z.string().optional(),
    status: z.enum(['all', 'draft', 'published']).optional(),
    search: z.string().optional(),
  })
}

// Tool: get_model
{
  name: 'get_model',
  description: 'Obtiene un modelo con todos sus detalles incluyendo calibracion',
  parameters: z.object({
    modelId: z.string(),
  })
}
```

### Tools de Creacion (escribir)

```typescript
// Tool: create_model
// Crea un nuevo modelo (draft)
{
  name: 'create_model',
  description: 'Crea un nuevo modelo de ventana en el sistema con diseno, proveedor y dimensiones',
  parameters: z.object({
    name: z.string().describe('Nombre comercial del modelo'),
    designTemplateId: z.string().describe('ID de la plantilla de diseno'),
    profileSupplierId: z.string().describe('ID del proveedor de perfiles'),
    minWidthMm: z.number().describe('Ancho minimo en mm'),
    maxWidthMm: z.number().describe('Ancho maximo en mm'),
    minHeightMm: z.number().describe('Alto minimo en mm'),
    maxHeightMm: z.number().describe('Alto maximo en mm'),
    compatibleGlassTypeIds: z.array(z.string()).describe('IDs de tipos de vidrio compatibles'),
    imageUrl: z.string().optional().describe('URL de imagen del modelo'),
  })
}

// Tool: update_model_dimensions
// Actualiza las dimensiones de un modelo existente
{
  name: 'update_model_dimensions',
  description: 'Actualiza las dimensiones min/max de un modelo existente',
  parameters: z.object({
    modelId: z.string(),
    minWidthMm: z.number().optional(),
    maxWidthMm: z.number().optional(),
    minHeightMm: z.number().optional(),
    maxHeightMm: z.number().optional(),
  })
}

// Tool: set_model_glass_types
// Establece los tipos de vidrio compatibles con un modelo
{
  name: 'set_model_glass_types',
  description: 'Establece los tipos de vidrio compatibles con el modelo',
  parameters: z.object({
    modelId: z.string(),
    glassTypeIds: z.array(z.string()),
  })
}

// Tool: list_glass_types
// Lista tipos de vidrio disponibles
{
  name: 'list_glass_types',
  description: 'Lista todos los tipos de vidrio disponibles en el catalogo',
  parameters: z.object({
    search: z.string().optional(),  // filtrar por nombre
  })
}
```

### Tools de Calibracion (del plan anterior, heredadas)

```typescript
// Tool: calculate_parameters (del plan anterior)
// Tool: save_calibration (del plan anterior)
// Tool: get_calibration_status (del plan anterior)
// Tool: get_supplier_prices (del plan anterior)
```

### Tools de Publicacion

```typescript
// Tool: publish_model
// Publica un modelo (cambia status de draft a published)
{
  name: 'publish_model',
  description: 'Publica un modelo, cambiandolo de draft a published. Requiere que este calibrado.',
  parameters: z.object({
    modelId: z.string(),
  })
}

// Tool: clone_model
// Clona un modelo existente con nuevo proveedor
{
  name: 'clone_model',
  description: 'Crea una copia de un modelo existente con un proveedor diferente. Copia el diseno y dimensiones pero no los precios.',
  parameters: z.object({
    sourceModelId: z.string(),
    newName: z.string(),
    newProfileSupplierId: z.string(),
  })
}
```

---

## System Prompt Expandido

```typescript
const ASSISTANT_PROMPT = `Eres un asistente especializado en ayudar a fabricas de ventanas de aluminio en LATAM a crear y configurar sus modelos en Glasify.

TU PERSONALIDAD:
- Amable y paciente
- Hablas en espanol natural, informal
- Usas analogias del mundo real (barras, metros, talleres)
- NUNCA usas terminologia tecnica con el cliente
- Explicas las cosas de forma simple

DOS MODOS DE OPERACION:

MODO 1: CREAR MODELO NUEVO
Ayudas al cliente a crear un modelo desde cero. El flujo es:

Paso 1: Nombre del modelo
  "Como quieres llamar a este modelo?"

Paso 2: Diseno
  Muestras las opciones de diseno (le dices: "Es corrediza, abatible o fija?")

Paso 3: Proveedor
  "Cual es tu proveedor de aluminio para este modelo?"

Paso 4: Dimensiones
  Sugieres dimensiones tipicas y preguntas si quiere ajustarlas

Paso 5: Vidrios
  "Que tipos de vidrio manejas con este modelo?"

Paso 6: Confirmar y crear
  Resumes todo y pides confirmacion antes de crear

MODO 2: CALIBRAR MODELO EXISTENTE  
(Descrito en la seccion de calibracion)

REGLAS FUNDAMENTALES:
- Si el cliente quiere crear un modelo para un proveedor que no existe, primero lo creas
- Si el cliente quiere clonar un modelo existente para otro proveedor, usas clone_model
- Antes de crear, SIEMPRE muestras un resumen y pides confirmacion
- Nunca creas nada sin confirmar con el cliente
- Si el modelo requiere calibracion, lo sabes y lo indicationas
- NUNCA inventes IDs, precios o datos — siempre usas tools
- Si no tienes claro algo, preguntas con opciones concretas

EJEMPLO DE DIALOGO:

Cliente: Quiero una ventana corrediza de 2 hojas
AI: Una corrediza de 2 hojas se llama diseno "OX" en el sistema. 
    Tiene 2 paneles moviles y 1 fijo, que es lo standard.
    Ya tenemos a Extralum como proveedor. Este modelo es para ellos?
    
Cliente: Si
AI: Perfecto! Las dimensiones standard para una OX son:
    - Ancho: 600mm a 2000mm
    - Alto: 400mm a 2400mm
    Estas dimensiones te sirven o quieres ajustarlas?
    
Cliente: El alto maximo quiero 2200
AI: Perfecto! Entonces:
    - Nombre: VC Panama 2P
    - Diseno: OX (corrediza 2 hojas)
    - Proveedor: Extralum
    - Ancho: 600 - 2000mm
    - Alto: 400 - 2200mm
    Lo creo asi?
    
Cliente: Si
AI: [Llama create_model]
    Listo! Ya esta creado como borrador.
    Ahora para que este listo para cotizar, necesitamos calibrate los precios con Extralum.
    Tiene los precios de las barras de aluminio a la mano?
`
```

---

## Memory: Session con Contexto de Creacion + Calibracion

La session metadata ahora soporta ambos flujos:

```sql
CREATE TABLE calibration_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL,  -- 'create' | 'calibrate'
  current_model_id TEXT,       -- Modelo en proceso
  current_step TEXT,            -- Paso actual del flujo
  supplier_prices_collected BOOLEAN DEFAULT FALSE,
  reference_window_a JSONB,    -- {width, height, cost}
  reference_window_b JSONB,
  parameters_calculated BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
);
```

### Contextos de sesion segun el modo

**Modo CREATE**:

```typescript
{
  mode: 'create',
  currentStep: 'confirm_dimensions',
  modelBeingCreated: {
    name: 'VC Panama 2P',
    designTemplate: 'OX',
    supplier: 'Extralum',
    dimensions: { minWidth: 600, maxWidth: 2000, minHeight: 400, maxHeight: 2200 },
    glassTypes: ['Vidrio 6mm', 'Vidrio Laminado'],
  }
}
```

**Modo CALIBRATE**:

```typescript
{
  mode: 'calibrate',
  currentStep: 'collect_reference_windows',
  modelBeingCalibrated: {
    modelId: 'model_xyz',
    name: 'VC Panama 2P',
    supplier: 'Extralum',
    barLengthMeters: 5.8,
    profiles: { marco: 45, hoja: 35, traslape: 15 },
    accessories: { ruedas: 3, cerradura: 3 },
  }
}
```

El AI puede interleavar ambos modos — por ejemplo: "Primero crea el modelo, luego calibralo". El session context mantiene el modelo que se esta creando y sabe que despues viene la calibracion.

---

## Flujo Completo Interactivo: Crear + Clonar + Calibrar

### Escenario 1: Crear modelo nuevo para proveedor existente

```
Juan: Quiero una ventana corrediza 2 hojas para Extralum
AI: El diseno seria OX (2 paneles moviles + 1 fijo).
    Tenemos 2 paneles con Extralum. Los precios son los mismos?
    
Juan: Si, son los mismos
AI: Perfecto! Entonces copio el modelo "VC Panama 2P" para Extralum?
    Sera identico pero con los precios que me des ahora.
    Lo clono?

Juan: Si, clonalo
AI: [Llama clone_model con sourceModelId de VC Panama 2P]
    Listo! Ya tienes el modelo clonado para Extralum.
    Ahora vamos a calibrate los precios.
    Cuanto te cuesta la barra de marco de 5.8m?
    
...continua con calibracion...
```

### Escenario 2: Crear modelo para nuevo proveedor

```
Juan: Quiero un modelo corredizo para Rehau
AI: No tenemos a Rehau todavia. Lo agrego?
    
Juan: Si
AI: [Llama create_profile_supplier o usa el existente]
    Rehau agregado!
    Ahora, el diseno de la ventana es igual al de Extralum (OX)?
    
Juan: Si pero mas grande
AI: Entonces tomamos el modelo "VC Panama 2P" como base y clonamos con las dimensiones de Rehau.
    Cuales son las dimensiones maximas que maneja Rehau?
    
Juan: Ancho hasta 2400 y alto hasta 2800
AI: Perfecto! Entonces:
    - Nombre: Europa 2P
    - Diseno: OX
    - Proveedor: Rehau
    - Ancho: 600 - 2400mm
    - Alto: 400 - 2800mm
    Lo creo?
    
...continua con calibracion...
```

### Escenario 3: Solo calibrar modelo existente

```
Juan: Quiero calibrate el modelo Europa 2P
AI: El modelo Europa 2P (OX, Rehau) esta en modo borrador.
    Necesito los precios de Rehau para calibrarlo.
    Cuanto cuesta la barra de marco de 5.8m?
    
...continua con calibracion...
```

---

## Archivos a Modificar del Plan Anterior

### Agregar al toolset existente

**`src/server/ai/tools/calibration-tools.ts`** — AGREGAR:

```typescript
// CRUD de modelos
const createModelTool = { ... }
const updateModelDimensionsTool = { ... }
const cloneModelTool = { ... }
const publishModelTool = { ... }

// Consultas
const listDesignTemplatesTool = { ... }
const listProfileSuppliersTool = { ... }
const listGlassTypesTool = { ... }

// Combinar todos
export const modelAssistantTools = [
  ...calibrationTools,         // herramientas de calibracion
  ...modelCrudTools,           // herramientas de creacion de modelos
]
```

### Actualizar el Assistant Service

**`src/server/ai/calibration-assistant.service.ts`** — MODIFICAR:

```typescript
// Antes: solo calibracion
// Ahora: dos modos (create + calibrate)
async function runModelAssistant(
  messages: Message[],
  sessionId: string,
  mode: 'create' | 'calibrate',
)
```

### Actualizar la Memory Service

**`src/server/services/calibration-memory.service.ts`** — MODIFICAR:

```typescript
// AGREGAR: modo en la sesion
interface Session {
  id: string
  mode: 'create' | 'calibrate'
  modelBeingCreated?: ModelDraft
  modelBeingCalibrated?: CalibrationDraft
  currentStep: string
}

// AGREGAR: funciones de gestion de modo
async function setMode(sessionId: string, mode: 'create' | 'calibrate')
async function setModelDraft(sessionId: string, draft: ModelDraft)
async function getModelDraft(sessionId: string): Promise<ModelDraft | null>
```

### Actualizar el System Prompt

**`src/server/ai/prompts/calibration-assistant-prompt.ts`** — REEMPLAZAR con el prompt expandido (dos modos).

---

## API Routes Adicionales

### `POST /api/chat/sessions` — Crear sesion con modo

```typescript
{
  userId: string
  mode: 'create' | 'calibrate'
  modelId?: string  // Para calibrate, el modelo a calibrar
}
// Devuelve: { sessionId: string }
```

### `GET /api/chat/sessions/[sessionId]/context` — Obtener contexto

```typescript
// Devuelve: { messages, session }
// El AI usa esto para saber en que paso esta
```

---

## UI: Chat Interface

### Pagina de chat

```
src/app/(dashboard)/admin/models/
  assistant/
    page.tsx                    # Pagina principal del asistente
    [sessionId]/page.tsx        # Sesion especifica
  calibrate/
    chat/page.tsx               # Tab de chat en el wizard
```

### Componentes de chat

```
src/components/admin/
  model-assistant-chat/
    chat-container.tsx
    mode-selector.tsx           # "Crear modelo" vs "Calibrar modelo"
    create-mode/
      step-*.tsx               # Pasos del flujo de creacion
    calibrate-mode/
      step-*.tsx               # Pasos del flujo de calibracion
    message-bubble.tsx
```

### Integracion en la pagina del modelo

En `src/app/(dashboard)/admin/models/[id]/page.tsx`:
- Agregar pestana "Hablar con Asistente"
- Si el modelo esta en draft, sugiere: "Este modelo necesita calibracion. Quieres que el asistente te guie?"

---

## Testing

### E2E: Creacion asistida completa

```
e2e/model-assistant-create.spec.ts:

1. Iniciar sesion en modo "create"
2. Decir "ventana corrediza 2 hojas para Extralum"
3. AI propone diseno OX
4. Juan confirma
5. AI clona el modelo VC Panama 2P existente
6. Juan confirma las dimensiones
7. AI llama create_model con los datos
8. Modelo se crea en la DB en estado draft
9. Sesion continua en modo "calibrate"
10. Juan ingresa precios del proveedor
11. Juan ingresa dos ventanas de referencia
12. AI calcula parametros
13. AI guarda la calibracion
14. AI pregunta si quiere publicar
15. Juan dice que si
16. Modelo pasa a published
```

### E2E: Clonacion para nuevo proveedor

```
e2e/model-assistant-clone.spec.ts:

1. Sesion modo "create"
2. Juan: "Quiero el mismo modelo pero para Rehau"
3. AI detecta que el modelo existe y pregunta si quiere clonar
4. Juan confirma
5. AI clona con nuevo proveedor
6. Flujo continua a calibracion
```

---

## Roadmap Actualizado

### Fase 1: Fundacion AI (2-3 dias)
- Provider Minimax
- Memory service con modo create/calibrate
- Tools basicas de modelos
- API route de chat
- Prompt de dos modos

### Fase 2: Flujo de Creacion (2 dias)
- Tools de create_model, clone_model, update_model
- Flujo guiado de creacion
- Integracion con DesignTemplate
- Integracion con ProfileSupplier

### Fase 3: Flujo de Calibracion (heredado del plan anterior) (2 dias)
- Tools de calibrate (calculate_parameters, save_calibration)
- Validacion con dos ventanas de referencia
- Publicacion del modelo

### Fase 4: UI y Testing (2 dias)
- Chat container con mode selector
- Integracion en paginas de admin
- E2E tests completos

---

## Resumen de Changes vs Plan Anterior

| Concepto | Plan Anterior | Plan Actualizado |
|----------|--------------|-----------------|
| Alcance | Solo calibracion | Creacion + Calibracion |
| Modos | Unico (calibrar) | Dos modos: create y calibrate |
| Tools | Solo calibracion | Full CRUD de modelos |
| Flujo | Lineal 5 pasos | Intercalado (crear -> calibrate -> publicar) |
| Memory | Solo calibracion | Session con ModelDraft + CalibrationDraft |
| Clonacion | No existe | clone_model tool para crear variantes |
| Proveedores | Ya existentes | Se pueden crear nuevos durante la conversacion |
