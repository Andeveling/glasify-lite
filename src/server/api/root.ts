import { adminRouter } from '@/server/api/routers/admin/admin';
import { glassSolutionRouter } from '@/server/api/routers/admin/glass-solution';
import { glassSupplierRouter } from '@/server/api/routers/admin/glass-supplier';
import { glassTypeRouter } from '@/server/api/routers/admin/glass-type';
import { modelRouter } from '@/server/api/routers/admin/model';
import { profileSupplierRouter } from '@/server/api/routers/admin/profile-supplier';
import { serviceRouter } from '@/server/api/routers/admin/service';
import { tenantConfigRouter } from '@/server/api/routers/admin/tenant-config';
import { catalogRouter } from '@/server/api/routers/catalog';
import { quoteRouter } from '@/server/api/routers/quote/quote';
import { userRouter } from '@/server/api/routers/user';
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: createTRPCRouter({
    ...adminRouter._def.record,
    'glass-solution': glassSolutionRouter,
    'glass-supplier': glassSupplierRouter,
    'glass-type': glassTypeRouter,
    model: modelRouter,
    'profile-supplier': profileSupplierRouter,
    service: serviceRouter,
  }),
  catalog: catalogRouter,
  quote: quoteRouter,
  tenantConfig: tenantConfigRouter,
  user: userRouter,
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
