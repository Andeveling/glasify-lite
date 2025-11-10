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

export const sessions = pgTable(
  "Session",
  {
    id: varchar("id", { length: FIELD_LENGTHS.SESSION.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    expiresAt: timestamp("expires", { mode: "date" }).notNull(),
    token: varchar("sessionToken", {
      length: FIELD_LENGTHS.SESSION.TOKEN,
    }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
    userId: varchar("userId", { length: FIELD_LENGTHS.USER.ID }).notNull(),
    ipAddress: varchar("ipAddress", {
      length: FIELD_LENGTHS.SESSION.IP_ADDRESS,
    }),
    userAgent: varchar("userAgent", {
      length: FIELD_LENGTHS.SESSION.USER_AGENT,
    }),
  },
  (table) => [
    uniqueIndex("Session_sessionToken_key").on(table.token),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "Session_userId_fkey",
    }).onDelete("cascade"),
  ]
);

export const sessionSelectSchema = createSelectSchema(sessions, {
  token: z.string().max(FIELD_LENGTHS.SESSION.TOKEN),
  ipAddress: z.string().max(FIELD_LENGTHS.SESSION.IP_ADDRESS).optional(),
  userAgent: z.string().max(FIELD_LENGTHS.SESSION.USER_AGENT).optional(),
});

export const sessionInsertSchema = createInsertSchema(sessions, {
  id: z.uuid().optional(),
  token: z.string().max(FIELD_LENGTHS.SESSION.TOKEN),
  userId: z.string().uuid(),
  ipAddress: z.string().max(FIELD_LENGTHS.SESSION.IP_ADDRESS).optional(),
  userAgent: z.string().max(FIELD_LENGTHS.SESSION.USER_AGENT).optional(),
}).omit({ createdAt: true, updatedAt: true });

export const sessionUpdateSchema = createUpdateSchema(sessions, {
  token: z.string().max(FIELD_LENGTHS.SESSION.TOKEN),
  ipAddress: z.string().max(FIELD_LENGTHS.SESSION.IP_ADDRESS).optional(),
  userAgent: z.string().max(FIELD_LENGTHS.SESSION.USER_AGENT).optional(),
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
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
