import { addressRouter } from "@/server/api/routers/address";
import { adminRouter } from "@/server/api/routers/admin/admin";
import { tenantConfigRouter } from "@/server/api/routers/admin/tenant-config";
import { cartRouter } from "@/server/api/routers/cart";
import { catalogRouter } from "@/server/api/routers/catalog";
import { dashboardRouter } from "@/server/api/routers/dashboard";
import { geocodingRouter } from "@/server/api/routers/geocoding";
import { quoteRouter } from "@/server/api/routers/quote";
import { transportationRouter } from "@/server/api/routers/transportation";
import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for the server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  address: addressRouter,
  admin: adminRouter,
  cart: cartRouter,
  catalog: catalogRouter,
  dashboard: dashboardRouter,
  geocoding: geocodingRouter,
  quote: quoteRouter,
  tenantConfig: tenantConfigRouter,
  transportation: transportationRouter,
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
