# 🔄 Guía de Conversión: Prisma → Drizzle

## Referencia Rápida para Desarrolladores

### 1. Consultas Básicas

#### Prisma
```typescript
// Obtener todos los usuarios
const users = await prisma.user.findMany();

// Con filtro
const user = await prisma.user.findUnique({
  where: { email: 'test@example.com' }
});

// Con relaciones
const quotes = await prisma.quote.findMany({
  include: { items: true }
});
```

#### Drizzle (Equivalente)
```typescript
// Obtener todos los usuarios
const users = await db.select().from(users);

// Con filtro
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, 'test@example.com'))
  .limit(1);

// Con relaciones (se requiere relaciones definidas)
const quotes = await db.query.quotes.findMany({
  with: { quoteItems: true }
});
```

---

### 2. Crear Registros

#### Prisma
```typescript
const newUser = await prisma.user.create({
  data: {
    email: 'new@example.com',
    name: 'John',
    role: 'user'
  }
});
```

#### Drizzle
```typescript
const [newUser] = await db
  .insert(users)
  .values({
    email: 'new@example.com',
    name: 'John',
    role: 'user'
  })
  .returning();
```

---

### 3. Actualizar Registros

#### Prisma
```typescript
const updated = await prisma.user.update({
  where: { id: userId },
  data: { name: 'Updated Name' }
});
```

#### Drizzle
```typescript
const [updated] = await db
  .update(users)
  .set({ name: 'Updated Name' })
  .where(eq(users.id, userId))
  .returning();
```

---

### 4. Eliminar Registros

#### Prisma
```typescript
await prisma.user.delete({
  where: { id: userId }
});
```

#### Drizzle
```typescript
await db
  .delete(users)
  .where(eq(users.id, userId));
```

---

### 5. Transacciones

#### Prisma
```typescript
await prisma.$transaction(async (tx) => {
  await tx.quote.create({ data: quoteData });
  await tx.quoteItem.createMany({ data: itemsData });
});
```

#### Drizzle
```typescript
await db.transaction(async (tx) => {
  await tx.insert(quotes).values(quoteData);
  await tx.insert(quoteItems).values(itemsData);
});
```

---

### 6. Tipos de Datos

#### Prisma
```typescript
import { User } from '@prisma/client';
import { Quote } from '@prisma/client';
```

#### Drizzle (Automático)
```typescript
// Tipos generados automáticamente
import { typeof users.$inferSelect } as User;
import { typeof quotes.$inferSelect } as Quote;

// O usando helpers
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;
```

---

### 7. Validación con Zod

#### Prisma + Zod (Duplicación)
```typescript
// Fuente 1: Schema Prisma
model User {
  id String @id
  email String @unique
  name String?
}

// Fuente 2: Schema Zod (duplicado)
const userSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().optional()
});
```

#### Drizzle + Zod (Sincronizado)
```typescript
// Fuente única: Schema Drizzle
export const users = pgTable('User', {
  id: varchar('id').primaryKey(),
  email: varchar('email').unique().notNull(),
  name: varchar('name')
});

// Genera Zod automáticamente
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

const insertUserSchema = createInsertSchema(users);
const selectUserSchema = createSelectSchema(users);
```

---

### 8. Consultas Complejas con JOINs

#### Prisma
```typescript
const quotes = await prisma.quote.findMany({
  include: {
    user: true,
    items: {
      include: {
        model: true,
        glassType: true,
        services: true
      }
    },
    adjustments: true
  },
  where: {
    status: 'sent'
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 10
});
```

#### Drizzle (Equivalente)
```typescript
const quotes = await db.query.quotes.findMany({
  with: {
    user: true,
    quoteItems: {
      with: {
        model: true,
        glassType: true,
        services: true
      }
    },
    adjustments: true
  },
  where: eq(quotes.status, 'sent'),
  orderBy: desc(quotes.createdAt),
  limit: 10
});
```

---

### 9. Agregaciones & Grouping

#### Prisma
```typescript
const stats = await prisma.quote.groupBy({
  by: ['status'],
  _count: true,
  _sum: { total: true }
});
```

#### Drizzle
```typescript
import { count, sum } from 'drizzle-orm';

const stats = await db
  .select({
    status: quotes.status,
    count: count(),
    totalAmount: sum(quotes.total)
  })
  .from(quotes)
  .groupBy(quotes.status);
```

---

### 10. Enums en Migraciones

#### Prisma
```prisma
enum UserRole {
  admin
  seller
  user
}

model User {
  role UserRole @default(user)
}
```

#### Drizzle
```typescript
// Definir enum
export const userRoleEnum = pgEnum('UserRole', [
  'admin',
  'seller',
  'user'
]);

// Usar en tabla
export const users = pgTable('User', {
  role: userRoleEnum('role').default('user').notNull()
});
```

---

## 🎯 Patrones Comunes en Glasify

### Obtener Catálogo de Modelos (SSR)
```typescript
// Drizzle
import { db, models, glassTypes } from '@/server/db';
import { inArray } from 'drizzle-orm';

export async function getCatalogModels() {
  "use cache";
  cacheLife('hours');
  
  return db.query.models.findMany({
    where: and(
      eq(models.status, 'published'),
      eq(models.isActive, true)
    ),
    with: {
      profileSupplier: true,
      colors: {
        with: { color: true }
      }
    },
    orderBy: models.name
  });
}
```

### Crear Cotización con Items
```typescript
// Drizzle
import { db, quotes, quoteItems } from '@/server/db';

export async function createQuoteWithItems(
  userId: string,
  quoteData: Record<string, unknown>,
  items: Array<{ modelId: string; glassTypeId: string }>
) {
  "use server";
  
  return db.transaction(async (tx) => {
    // 1. Crear cotización
    const [quote] = await tx
      .insert(quotes)
      .values({
        userId,
        ...quoteData,
        status: 'draft'
      })
      .returning();

    // 2. Crear items
    const quoteItems = await Promise.all(
      items.map(item =>
        tx
          .insert(quoteItems)
          .values({
            quoteId: quote.id,
            ...item
          })
          .returning()
      )
    );

    return { quote, items: quoteItems };
  });
}
```

---

## 🔗 Imports Estándar (Post-Migración)

```typescript
// Tablas y tipos
import {
  users,
  quotes,
  quoteItems,
  models,
  glassTypes,
  // etc...
  typeof users.$inferSelect,
  typeof quotes.$inferInsert
} from '@/server/db/schema';

// ORM utilities
import {
  eq,
  and,
  or,
  gt,
  lt,
  inArray,
  like,
  desc,
  asc,
  count,
  sum,
  avg
} from 'drizzle-orm';

// Validación (sincronizada con Drizzle)
import {
  createInsertSchema,
  createSelectSchema
} from 'drizzle-zod';
```

---

## ⚠️ Cambios Clave a Recordar

1. **Sin `@prisma/client`**: Reemplazado por tipos en `schema.ts`
2. **Sin `prisma.` global**: Usar `db` importado de `@/server/db`
3. **Consultas más explícitas**: `.select().from().where()` vs `.findMany()`
4. **Relaciones explícitas**: Necesita `relations.ts` para consultas `with`
5. **Tipos sincronizados**: Cambiar schema.ts → tipos se actualizan automáticamente
6. **Build script simple**: `next build` (sin `prisma generate`)

---

## ✅ Checklist de Refactorización

Cuando migres un router de Prisma a Drizzle:

- [ ] Cambiar imports (`prisma.*` → `db`)
- [ ] Actualizar queries (`.findMany()` → `.select().from()`)
- [ ] Actualizar mutations (`.create()` → `.insert()`)
- [ ] Cambiar tipos (`User` → `typeof users.$inferSelect`)
- [ ] Validar relaciones (usar `relations.ts` si es necesario)
- [ ] Actualizar tests (fixtures con valores reales)
- [ ] Verificar tipos (`pnpm typecheck`)
- [ ] Prueba local

---

*Referencia rápida para migración. Ver `/docs/migrations/` para guías completas.*
