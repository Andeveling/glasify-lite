import { adminRouter } from '@/server/api/routers/admin/admin';
import { profileSupplierRouter } from '@/server/api/routers/admin/profile-supplier';
import { tenantConfigRouter } from '@/server/api/routers/admin/tenant-config';
import { catalogRouter } from '@/server/api/routers/catalog';
import { quoteRouter } from '@/server/api/routers/quote/quote';
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: adminRouter,
  catalog: catalogRouter,
  profileSupplier: profileSupplierRouter,
  quote: quoteRouter,
  tenantConfig: tenantConfigRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
