import { pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { FIELD_LENGTHS } from "./constants";

export const verifications = pgTable(
  "Verification",
  {
    id: varchar("id", { length: FIELD_LENGTHS.VERIFICATION.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    identifier: varchar("identifier", {
      length: FIELD_LENGTHS.VERIFICATION.IDENTIFIER,
    }).notNull(),
    value: varchar("value", {
      length: FIELD_LENGTHS.VERIFICATION.VALUE,
    }).notNull(),
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("Verification_identifier_value_key").on(
      table.identifier,
      table.value
    ),
  ]
);

export const verificationSelectSchema = createSelectSchema(verifications, {
  identifier: z.string().max(FIELD_LENGTHS.VERIFICATION.IDENTIFIER),
  value: z.string().max(FIELD_LENGTHS.VERIFICATION.VALUE),
});

export const verificationInsertSchema = createInsertSchema(verifications, {
  id: z.cuid().optional(),
  identifier: z.string().max(FIELD_LENGTHS.VERIFICATION.IDENTIFIER),
  value: z.string().max(FIELD_LENGTHS.VERIFICATION.VALUE),
}).omit({ createdAt: true, updatedAt: true });

export const verificationUpdateSchema = createUpdateSchema(verifications, {
  identifier: z.string().max(FIELD_LENGTHS.VERIFICATION.IDENTIFIER),
  value: z.string().max(FIELD_LENGTHS.VERIFICATION.VALUE),
})
  .partial()
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

/**
 * TypeScript types inferred from schemas
 */
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
