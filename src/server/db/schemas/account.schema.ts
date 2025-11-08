import {
  foreignKey,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { FIELD_LENGTHS } from "./constants/constants";
import { users } from "./user.schema";

/**
 * Account table (NextAuth)
 * Stores OAuth provider connections and tokens for a user
 */
export const accounts = pgTable(
  "Account",
  {
    id: varchar("id", { length: FIELD_LENGTHS.ACCOUNT.ID }).primaryKey(),
    accountId: varchar("providerAccountId", {
      length: FIELD_LENGTHS.ACCOUNT.ACCOUNT_ID,
    }).notNull(),
    providerId: varchar("provider", {
      length: FIELD_LENGTHS.ACCOUNT.PROVIDER_ID,
    }).notNull(),
    accessToken: varchar("access_token", {
      length: FIELD_LENGTHS.ACCOUNT.ACCESS_TOKEN,
    }),
    refreshToken: varchar("refresh_token", {
      length: FIELD_LENGTHS.ACCOUNT.REFRESH_TOKEN,
    }),
    accessTokenExpiresAt: timestamp("expires_at", { mode: "date" }),
    idToken: varchar("id_token", { length: FIELD_LENGTHS.ACCOUNT.ID_TOKEN }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { mode: "date" }),
    scope: varchar("scope", { length: FIELD_LENGTHS.ACCOUNT.SCOPE }),
    password: varchar("password", { length: FIELD_LENGTHS.ACCOUNT.PASSWORD }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
    userId: varchar("userId", { length: FIELD_LENGTHS.USER.ID }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "Account_userId_fkey",
    }).onDelete("cascade"),
    uniqueIndex("Account_provider_accountId_key").on(
      table.providerId,
      table.accountId
    ),
  ]
);

/**
 * Zod Schemas for Account
 */
export const accountSelectSchema = createSelectSchema(accounts);
export const accountInsertSchema = createInsertSchema(accounts, {
  id: z.cuid(),
  accountId: z.string().max(FIELD_LENGTHS.ACCOUNT.ACCOUNT_ID),
  providerId: z.string().max(FIELD_LENGTHS.ACCOUNT.PROVIDER_ID),
  accessToken: z.string().max(FIELD_LENGTHS.ACCOUNT.ACCESS_TOKEN).optional(),
  refreshToken: z.string().max(FIELD_LENGTHS.ACCOUNT.REFRESH_TOKEN).optional(),
  idToken: z.string().max(FIELD_LENGTHS.ACCOUNT.ID_TOKEN).optional(),
  scope: z.string().max(FIELD_LENGTHS.ACCOUNT.SCOPE).optional(),
  password: z.string().max(FIELD_LENGTHS.ACCOUNT.PASSWORD).optional(),
  userId: z.string().cuid(),
}).omit({ createdAt: true, updatedAt: true });

export const accountUpdateSchema = createUpdateSchema(accounts, {
  accountId: z.string().max(FIELD_LENGTHS.ACCOUNT.ACCOUNT_ID),
  providerId: z.string().max(FIELD_LENGTHS.ACCOUNT.PROVIDER_ID),
  accessToken: z.string().max(FIELD_LENGTHS.ACCOUNT.ACCESS_TOKEN).optional(),
  refreshToken: z.string().max(FIELD_LENGTHS.ACCOUNT.REFRESH_TOKEN).optional(),
  idToken: z.string().max(FIELD_LENGTHS.ACCOUNT.ID_TOKEN).optional(),
  scope: z.string().max(FIELD_LENGTHS.ACCOUNT.SCOPE).optional(),
  password: z.string().max(FIELD_LENGTHS.ACCOUNT.PASSWORD).optional(),
})
  .partial()
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  });

/**
 * TypeScript types inferred from schemas
 */
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
