import {
  boolean,
  index,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { userRoleEnum } from "./enums.schema";

/**
 * Field length limits for User table
 */
const USER_FIELD_LENGTHS = {
  ID: 36, // CUID length
  NAME: 255,
  EMAIL: 320, // RFC 5321 limit
  IMAGE_URL: 2048,
} as const;

/**
 * User table
 * Stores user account information and role-based access control
 */
export const users = pgTable(
  "User",
  {
    id: varchar("id", { length: USER_FIELD_LENGTHS.ID }).primaryKey(),
    name: varchar("name", { length: USER_FIELD_LENGTHS.NAME }),
    email: varchar("email", { length: USER_FIELD_LENGTHS.EMAIL }).unique(),
    emailVerified: boolean("emailVerified").default(false).notNull(),
    image: varchar("image", { length: USER_FIELD_LENGTHS.IMAGE_URL }),
    role: userRoleEnum("role").default("user").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("User_role_idx").on(table.role)]
);

/**
 * Zod Schemas for User
 * Auto-generated from the Drizzle schema using drizzle-zod
 */
export const userSelectSchema = createSelectSchema(users, {
  email: z.email().max(USER_FIELD_LENGTHS.EMAIL).optional(),
  name: z.string().max(USER_FIELD_LENGTHS.NAME).optional(),
});
export const userInsertSchema = createInsertSchema(users, {
  id: z.cuid(),
  email: z.email().max(USER_FIELD_LENGTHS.EMAIL).optional(),
  name: z.string().max(USER_FIELD_LENGTHS.NAME).optional(),
}).omit({ createdAt: true, updatedAt: true });

export const userUpdateSchema = createUpdateSchema(users, {
  email: z.email().max(USER_FIELD_LENGTHS.EMAIL).optional(),
  name: z.string().max(USER_FIELD_LENGTHS.NAME).optional(),
}).omit({ createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
