# Plan: Migrar page.tsx al patrón Transporter de AI SDK v6

## Objetivo

Refactorizar `src/app/(dashboard)/admin/assistant/page.tsx` para usar `DefaultChatTransport` con el patrón de v6, eliminando el estado controlado `messages: chatMessages` y la carga manual via `fetch` a `/api/chat/${id}`.

---

## Contexto y problema actual

### Arquitectura actual (v4/v5 híbrido)

```tsx
// page.tsx — problema
const [chatMessages, setChatMessages] = useState<UIMessage[]>([])

const { messages, status, error, sendMessage } = useChat({
  id: selectedId,            // ← prop id de useChat (no es para el transport)
  messages: chatMessages,     // ← patrón v4: estado controlado externo
})

// sendMessage hace POST manual (no se usa —sendMessage del hook hace el POST)
// loadChat llama GET /api/chat/${id} para cargar historial
// saveChat se llama en onFinish del server
```

**Problemas:**

1. `messages: chatMessages` es el patrón v4 de "estado controlado". En v6 con `DefaultChatTransport`, el hook gestiona sus propios mensajes internamente.
2. `DefaultChatTransport` está importado pero no se usa.
3. La prop `id` de `useChat` en v6 sirve para identificar el componente de chat en el DOM, no para mandar al backend. El ID del chat va en `body` del transport.
4. En v6, `useChat` ya no acepta `body` como opción de nivel superior (cambio de v5→v6). El `body` se configura en el constructor de `DefaultChatTransport`.

### API v6 descubierta (de los tipos instalados)

```ts
// useChatOptions en v6
type UseChatOptions<UI_MESSAGE> = (
  | { chat: Chat<UI_MESSAGE> }
  | ChatInit<UI_MESSAGE>
) & { experimental_throttle?: number; resume?: boolean }

// ChatInit tiene:
interface ChatInit<UI_MESSAGE> {
  id?: string
  messages?: UI_MESSAGE[]
  transport?: ChatTransport<UI_MESSAGE>
  onError?: ...
  onFinish?: ...
  // etc
}

// DefaultChatTransport se configura con HttpChatTransportInitOptions:
new DefaultChatTransport({
  api: '/api/chat',
  body: { id: selectedId },  // ← el id va AQUÍ, no en useChat
})
```

**El flujo correcto en v6:**
1. Crear `DefaultChatTransport` con `{ api: '/api/chat', body: { id: selectedId } }`
2. Pasar `messages` (historial cargado) en `ChatInit`
3. `useChat({ transport, messages })` — el transport hace el POST con `body.id`
4. El server responde con stream que incluye `originalMessages` mergeados
5. El hook actualiza `messages` automáticamente

---

## Plan paso a paso

### Paso 1: Crear el transport con `useMemo`

**Agregar import de `Chat` y `DefaultChatTransport`:**

```ts
import { DefaultChatTransport, type Chat } from 'ai'
```

**Crear el transport:**
```tsx
const transport = useMemo(
  () =>
    new DefaultChatTransport({
      api: '/api/chat',
      body: { id: selectedId ?? '' },
    }),
  [selectedId],
)
```

> En v6, `body` va en el constructor del transport, no como opción de `useChat`.

### Paso 2: Reemplazar `useChat`

**Eliminar** las líneas actuales:
```tsx
const [chatMessages, setChatMessages] = useState<UIMessage[]>([])
const { messages, status, error, sendMessage } = useChat({
  id: selectedId,
  messages: chatMessages,
})
```

**Reemplazar por:**
```tsx
const [messages, setMessages] = useState<UIMessage[]>([])

const { status, error, sendMessage } = useChat({
  transport,
  messages,
})
```

> En v6, `useChat` con `ChatInit` (sin `chat:`) retorna `UseChatHelpers` que incluye `messages`. Pero la prop `messages` aquí es para **inicializar** el estado del Chat, no para estado controlado bidireccional.
>
> **Problema**: cuando `selectedId` cambia, `useMemo` crea un nuevo `transport` con diferente `body.id`. Esto hace que `useChat` se re-inicialice con los nuevos mensajes del stream.
>
> Para cargar historial existente, necesitamos pasar `messages` con el contenido del GET `/api/chat/${id}`. Esto se hace con `setMessages` en un `useEffect`.

### Paso 3: Cargar mensajes al seleccionar chat

**Eliminar** `loadChat` callback (líneas 74-80) y su efecto (líneas 111-115).

**Reemplazar con:**
```tsx
useEffect(() => {
  if (!selectedId) {
    setMessages([])
    return
  }
  fetch(`/api/chat/${selectedId}`)
    .then((r) => r.json())
    .then((data: UIMessage[]) => setMessages(data))
    .catch(() => setMessages([]))
}, [selectedId])
```

### Paso 4: Ajustar `onSubmit`

**Antes:**
```tsx
const onSubmit = (message: PromptInputMessage) => {
  if (!message.text && !message.files?.length) return
  setCurrentState("thinking")
  sendMessage(message).then(() => setCurrentState("idle"))
  return Promise.resolve()
}
```

**Después:**
```tsx
const onSubmit = (message: PromptInputMessage) => {
  if (!message.text && !message.files?.length) return
  sendMessage({ text: message.text, files: message.files })
}
```

> En v6, `sendMessage` retorna `Promise<void>`. El `onFinish` callback en `useChat` o en el transport se puede usar para sincronizar el estado `thinking`/`idle`.
>
> Alternativa para `currentState`:
> ```tsx
> useEffect(() => {
>   if (status === 'streaming' || status === 'submitted') setCurrentState('thinking')
>   else if (status === 'ready') setCurrentState('idle')
> }, [status])
> ```

### Paso 5: Limpiar imports y estado

**Eliminar:**
- `chatMessages` state
- `setChatMessages` en `deleteChat`, `createChat`
- `useCallback` si `loadChat` se eliminó

**Actualizar imports:**
- Agregar `Chat` de `ai`
- `DefaultChatTransport` ya está importado (línea 5)

---

## Archivos que cambian

| Archivo | Cambio |
|---------|--------|
| `src/app/(dashboard)/admin/assistant/page.tsx` | Refactor principal — `DefaultChatTransport` con `body.id`, carga de `messages` via GET |
| `src/app/api/chat/route.ts` | **Sin cambios** — ya compatible con `DefaultChatTransport` via `toUIMessageStreamResponse({ originalMessages })` |
| `src/app/api/chat/[id]/route.ts` | **Sin cambios** — usado para carga inicial |

---

## Decisión de diseño abierta

### ¿`messages` como estado o se deja que `useChat` lo gestione?

En v6, `useChat` internamente tiene `AbstractChat.messages` como estado. Cuando se pasa `messages` en `ChatInit`, esos mensajes inicializan el estado interno del `Chat`. Cuando `selectedId` cambia:

**Opción A (recomendada)**: Usar `useState` + `useEffect` para cargar y mantener `messages` localmente, pasándola a `useChat` como inicialización:

```tsx
const [messages, setMessages] = useState<UIMessage[]>([])

useEffect(() => {
  if (!selectedId) { setMessages([]); return }
  fetch(`/api/chat/${selectedId}`)
    .then(r => r.json())
    .then(setMessages)
}, [selectedId])

const { messages: chatMessages, ... } = useChat({
  transport,
  messages,  // inicializa el Chat con el historial
})
```

**Opción B**: Dejar que `useChat` gestione todo — cuando cambia `selectedId`, se crea un nuevo `Chat` con `messages: []`. El GET a `/api/chat/${id}` se sigue usando para mostrar historial antes de enviar un mensaje.

La Opción A es más limpia porque muestra el historial inmediatamente al seleccionar un chat, sin necesidad de enviar un mensaje para dispararlo.

---

## Verificación

1. `pnpm typecheck` — sin errores de tipos
2. `pnpm lint:errors` — sin errores de Biome
3. Probar manualmente:
   - Crear chat nuevo → aparece en sidebar
   - Enviar mensaje → aparece en conversación
   - Seleccionar chat existente → muestra historial sin mezclar con anterior
   - Eliminar chat → desaparece de sidebar
   - Recargar con chat seleccionado → carga historial correctamente
