/**
 * Database exports
 */
import type { db as dbType } from "./drizzle";

export { db } from "./drizzle";
export type DrizzleClient = typeof dbType;
