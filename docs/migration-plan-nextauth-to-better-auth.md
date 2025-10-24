# Plan de Migración: NextAuth.js → Better Auth

**Fecha**: 23 de Octubre 2025  
**Estado**: En Planificación  
**Versiones Target**: Better Auth 1.2.7+, Next.js 15.5.4

---

## 1. Resumen Ejecutivo

Migración completa de **NextAuth.js 5.0.0-beta.25** a **Better Auth 1.2.7+** manteniendo:
- ✅ Autenticación con Google OAuth
- ✅ Role-Based Access Control (RBAC): `admin`, `seller`, `user`
- ✅ Datos de usuario en Prisma PostgreSQL
- ✅ Middleware para protección de rutas
- ✅ Session management en Server Components y Client Components

**Cambio arquitectónico clave**:
- **NextAuth**: Middleware con `handlers` → **Better Auth**: Middleware ligero con verificación de cookie

---

## 2. Cambios en Base de Datos

### 2.1 Schema Mapping NextAuth → Better Auth

**User Table**:
```
NextAuth          → Better Auth
emailVerified     → emailVerified (boolean, sin cambios)
```

**Session Table**:
```
NextAuth          → Better Auth
expires           → expiresAt (RENAME via @map)
sessionToken      → token (RENAME via @map)
(ADD)             → createdAt (DateTime)
(ADD)             → updatedAt (DateTime)
```

**Account Table**:
```
NextAuth          → Better Auth
provider          → providerId (string type)
providerAccountId → accountId (string)
access_token      → accessToken (string, @map)
refresh_token     → refreshToken (string, @map)
access_token_expires → accessTokenExpiresAt (DateTime, @map)
id_token          → idToken (string, @map)
(REMOVE)          → session_state, type, token_type
(ADD)             → createdAt (DateTime)
(ADD)             → updatedAt (DateTime)
```

### 2.2 Migración Prisma

**Step 1**: Crear migración Prisma
```bash
prisma migrate create --name migrate_nextauth_to_better_auth
```

**Step 2**: Actualizar `prisma/schema.prisma` con field mappings

---

## 3. Cambios en Código

### 3.1 Dependencies

**Remover**:
```json
"next-auth": "5.0.0-beta.25",
"@auth/prisma-adapter": "2.10.0"
```

**Agregar**:
```json
"better-auth": "^1.2.7",
"@better-fetch/fetch": "^0.1.0",  // Para middleware
"next-cookies": "2.0.0"
```

### 3.2 Estructura de Archivos

#### Actualizar: `src/server/auth/config.ts`
- Cambiar `authConfig` a `auth` instance con `betterAuth()`
- Configurar Google OAuth provider
- Agregar plugin `nextCookies()`

#### Reemplazar: `src/server/auth/index.ts`
- Cambiar `NextAuth(authConfig)` a export directo de `auth`
- Cambiar exports: `auth`, `handlers` → solo `auth`

#### Actualizar: `src/app/api/auth/[...nextauth]/route.ts`
- Renombrar carpeta: `[...nextauth]` → `[...all]`
- Cambiar handler: `toNextJsHandler(auth)`

#### Crear: `src/lib/auth-client.ts`
- Cliente Better Auth para componentes React
- Exports: `signIn`, `signOut`, `useSession`

#### Actualizar: `src/middleware.ts` (proxy.ts)
- Cambiar lógica: usa `getSessionCookie()` o `getCookieCache()`
- Para Next.js 15.2.0+: usar `runtime: 'nodejs'` + `auth.api.getSession()`

#### Actualizar: Componentes cliente
- `src/components/auth/sign-in-button.tsx`: cambiar `signIn('google')` a Better Auth
- Cualquier hook `useSession()`: cambiar a Better Auth client

#### Actualizar: Server Actions & tRPC
- Cambiar `auth()` calls a `auth.api.getSession()`
- Cambiar headers handling

---

## 4. Cambios por Archivo

### 4.1 `src/server/auth/config.ts` → Reescribir completamente

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
  database: prismaAdapter(db),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BASE_URL,
  
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      // Para always get refresh token:
      accessType: "offline",
      prompt: "select_account consent",
    },
  },
  
  callbacks: {
    // Hook after successful sign in
    async signIn({ user, account }) {
      // Setear role default
      if (!user.role) {
        // Verificar si es admin por email
        if (user.email?.toLowerCase() === env.ADMIN_EMAIL?.toLowerCase()) {
          // Actualizar user en DB
        }
      }
      return true;
    },
  },
  
  plugins: [
    nextCookies(), // MUST be last
  ],
});
```

### 4.2 `src/server/auth/index.ts` → Cambiar exports

```typescript
export { auth } from "./config";
```

### 4.3 `src/app/api/auth/[...nextauth]` → Renombrar a `[...all]`

Crear: `src/app/api/auth/[...all]/route.ts`

```typescript
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/auth";

export const { GET, POST } = toNextJsHandler(auth);
```

### 4.4 `src/lib/auth-client.ts` → Crear nueva

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL,
});

export const { signIn, signOut, useSession } = authClient;
```

### 4.5 `src/proxy.ts` (Middleware) → Actualizar

**Para Next.js 15.2.0+** (recomendado):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { shouldSkipMiddleware, /* ... */ } from "@/lib/middleware-utils";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get session for protected routes
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // ... rest of logic
}

export const config = {
  runtime: "nodejs", // REQUIRED for Node.js runtime
  matcher: [/* ... */],
};
```

**Alternative (optimized)**: Usar `getSessionCookie()` para fast path:

```typescript
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  // Fast path: Solo verificar cookie (UX, no security)
  const sessionCookie = getSessionCookie(request);
  
  if (!sessionCookie && isProtectedRoute(pathname)) {
    return NextResponse.redirect(catalogUrl);
  }

  // Para security-critical: still validate on Server Components
  return NextResponse.next();
}

export const config = {
  matcher: [/* ... */],
};
```

### 4.6 `src/components/auth/sign-in-button.tsx` → Actualizar

```typescript
import { authClient } from "@/lib/auth-client";

export function SignInButton({ callbackUrl }: SignInButtonProps) {
  const handleSignIn = async () => {
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    });
  };

  return (
    <button onClick={handleSignIn}>
      {children}
    </button>
  );
}
```

### 4.7 `src/server/api/trpc.ts` → Actualizar context

```typescript
import { auth } from "@/server/auth";
import { headers } from "next/headers";

export const createTRPCContext = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    session,
    // ...
  };
};
```

---

## 5. Variables de Entorno

### Agregar a `.env.local`

```env
# Better Auth
BETTER_AUTH_SECRET=<generate-with-openssl-rand-hex-32>
BASE_URL=http://localhost:3000

# Google OAuth (ya existen)
GOOGLE_CLIENT_ID=<...>
GOOGLE_CLIENT_SECRET=<...>

# Admin
ADMIN_EMAIL=<admin@example.com>
```

### Remover
- Cualquier variable específica de NextAuth

---

## 6. Cambios en Prisma Schema

### User Model

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          String    @default("user")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  accounts      Account[]
}
```

### Session Model

```prisma
model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime @map("expires")
  token     String   @unique @map("sessionToken")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Account Model

```prisma
model Account {
  id                 String   @id @default(cuid())
  accountId          String   @map("providerAccountId")
  providerId         String   @map("provider")
  accessToken        String?  @map("access_token")
  refreshToken       String?  @map("refresh_token")
  accessTokenExpiresAt DateTime? @map("access_token_expires")
  idToken            String?  @map("id_token")
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  userId             String
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
}
```

---

## 7. Plan de Implementación

### Phase 1: Preparación (15 min)
- [ ] Crear migración Prisma
- [ ] Actualizar variables de entorno
- [ ] Instalar nuevas dependencies

### Phase 2: Backend (30 min)
- [ ] Reescribir `src/server/auth/config.ts`
- [ ] Actualizar `src/server/auth/index.ts`
- [ ] Renombrar y actualizar `/api/auth` route
- [ ] Actualizar `src/server/api/trpc.ts`

### Phase 3: Frontend (25 min)
- [ ] Crear `src/lib/auth-client.ts`
- [ ] Actualizar `src/components/auth/sign-in-button.tsx`
- [ ] Actualizar `src/middleware.ts` (proxy.ts)
- [ ] Revisar y actualizar componentes con `useSession()`

### Phase 4: Testing (20 min)
- [ ] Tests unitarios de auth
- [ ] E2E: Sign in con Google
- [ ] Verificar RBAC (admin, seller, user)
- [ ] Verificar session en Server Components

### Phase 5: Deploy (10 min)
- [ ] Run migrations: `prisma migrate deploy`
- [ ] Build y test local
- [ ] Deploy a staging/production

**Total Estimated Time**: ~100 minutos

---

## 8. Consideraciones de Seguridad

### Importante:
1. **Session Cookie Validation**: Siempre validar sesión en Server Components/Actions
2. **Secret Generation**: `openssl rand -hex 32` para `BETTER_AUTH_SECRET`
3. **CORS**: Configurar correctamente en Better Auth
4. **Rate Limiting**: Considerar agregar con `better-auth/rate-limit`

### Migration Safety:
1. Hacer backup de base de datos antes
2. Correr migración en staging primero
3. Mantener ambos sistemas en paralelo durante transición
4. Rollback plan: revert migración + redeploy NextAuth

---

## 9. Recursos

- [Better Auth Docs](https://www.better-auth.com/docs)
- [NextAuth Migration Guide](https://www.better-auth.com/docs/guides/next-auth-migration-guide)
- [Better Auth + Next.js 15+](https://www.better-auth.com/docs/integrations/next#nextjs-16-compatibility)
- [Google OAuth Setup](https://www.better-auth.com/docs/authentication/google)

