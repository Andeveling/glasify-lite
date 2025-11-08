/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import type { Prisma } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import superjson from "superjson";
import { ZodError } from "zod";

import logger from "@/lib/logger";
import { auth } from "@/server/auth";
import { db } from "@/server/db/drizzle";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    db,
    session,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
  transformer: superjson,
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const _start = Date.now();

  if (t._config.isDev && (process.env.NODE_ENV ?? "development") !== "test") {
    // artificial delay in dev
    const MaxDelayMs = 400;
    const MinDelayMs = 100;
    const waitMs = Math.floor(Math.random() * MaxDelayMs) + MinDelayMs;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const _end = Date.now();
  logger.info(`[TRPC] ${path} took ${_end - _start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

/**
 * Server Action procedure (public)
 *
 * Base procedure for tRPC Server Actions that work without JavaScript.
 * Uses experimental_caller API for progressive enhancement.
 *
 * @see https://trpc.io/blog/trpc-actions
 */
export const serverActionProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    // Add Server Action context metadata
    return next({
      ctx: {
        ...ctx,
        actionType: "server-action" as const,
      },
    });
  });

/**
 * Protected Server Action procedure
 *
 * Server Action that requires authentication.
 * Combines auth check with Server Action context.
 */
export const protectedActionProcedure = serverActionProcedure.use(
  ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        ...ctx,
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  }
);

/**
 * Admin-only procedure
 *
 * Restricts procedure execution to users with 'admin' role only.
 * Throws FORBIDDEN error if user role is not 'admin'.
 *
 * @see https://trpc.io/docs/server/authorization
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "admin") {
    logger.warn("Unauthorized admin procedure access attempt", {
      role: ctx.session.user.role,
      timestamp: new Date().toISOString(),
      userId: ctx.session.user.id,
    });
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acceso denegado. Se requiere rol de administrador.",
    });
  }
  return next({ ctx });
});

/**
 * Seller or Admin procedure
 *
 * Restricts procedure execution to users with 'seller' OR 'admin' role.
 * Throws FORBIDDEN error if user role is not in ['admin', 'seller'].
 *
 * @see https://trpc.io/docs/server/authorization
 */
export const sellerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["admin", "seller"].includes(ctx.session.user.role)) {
    logger.warn("Unauthorized seller procedure access attempt", {
      role: ctx.session.user.role,
      timestamp: new Date().toISOString(),
      userId: ctx.session.user.id,
    });
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acceso denegado. Se requiere rol de vendedor o administrador.",
    });
  }
  return next({ ctx });
});

/**
 * Seller or Admin procedure (alternative name for clarity)
 *
 * Restricts procedure execution to users with 'seller' OR 'admin' role.
 * Useful for procedures that both sellers and admins should access.
 *
 * @see https://trpc.io/docs/server/authorization
 */
export const sellerOrAdminProcedure = sellerProcedure;

/**
 * Get role-based filter for quote queries
 *
 * - Admin/Seller: Returns empty object (sees all quotes)
 * - User: Returns filter to see only their own quotes
 *
 * @param session - Better Auth session with user role
 * @returns Prisma where clause for quote filtering
 */
export function getQuoteFilter(
  session: Awaited<ReturnType<typeof auth.api.getSession>>
): Prisma.QuoteWhereInput {
  // Admins and sellers see all quotes
  if (session?.user?.role === "admin" || session?.user?.role === "seller") {
    return {};
  }

  // Regular users see only their own quotes
  if (session?.user?.id) {
    return { userId: session.user.id };
  }

  // No session - no access
  return { userId: "" };
}
