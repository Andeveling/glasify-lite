import { pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { FIELD_LENGTHS } from "./constants/constants";

export const verificationTokens = pgTable(
  "VerificationToken",
  {
    identifier: varchar("identifier", {
      length: FIELD_LENGTHS.VERIFICATION_TOKEN.IDENTIFIER,
    }).notNull(),
    token: varchar("token", {
      length: FIELD_LENGTHS.VERIFICATION_TOKEN.TOKEN,
    }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("VerificationToken_identifier_token_key").on(
      table.identifier,
      table.token
    ),
  ]
);

export const verificationTokenSelectSchema = createSelectSchema(
  verificationTokens,
  {
    identifier: z.string().max(FIELD_LENGTHS.VERIFICATION_TOKEN.IDENTIFIER),
    token: z.string().max(FIELD_LENGTHS.VERIFICATION_TOKEN.TOKEN),
  }
);

export const verificationTokenInsertSchema = createInsertSchema(
  verificationTokens,
  {
    identifier: z.string().max(FIELD_LENGTHS.VERIFICATION_TOKEN.IDENTIFIER),
    token: z.string().max(FIELD_LENGTHS.VERIFICATION_TOKEN.TOKEN),
  }
);

export const verificationTokenUpdateSchema = createUpdateSchema(
  verificationTokens,
  {
    identifier: z.string().max(FIELD_LENGTHS.VERIFICATION_TOKEN.IDENTIFIER),
    token: z.string().max(FIELD_LENGTHS.VERIFICATION_TOKEN.TOKEN),
  }
).partial();

/**
 * TypeScript types inferred from schemas
 */
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
