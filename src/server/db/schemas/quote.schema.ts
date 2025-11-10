import {
  char,
  decimal,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import {
  QUOTE_DECIMAL_PRECISION,
  QUOTE_FIELD_LENGTHS,
} from "./constants/quote.constants";
import { QUOTE_STATUS_VALUES, quoteStatusEnum } from "./enums.schema";
import { users } from "./user.schema";

export const quotes = pgTable(
  "Quote",
  {
    id: varchar("id", { length: QUOTE_FIELD_LENGTHS.ID })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("userId", { length: QUOTE_FIELD_LENGTHS.USER_ID }),
    status: quoteStatusEnum("status")
      .notNull()
      .$defaultFn(() => "draft"),
    currency: char("currency", {
      length: QUOTE_FIELD_LENGTHS.CURRENCY,
    }).notNull(),
    total: decimal("total", {
      precision: QUOTE_DECIMAL_PRECISION.TOTAL.precision,
      scale: QUOTE_DECIMAL_PRECISION.TOTAL.scale,
    })
      .notNull()
      .$defaultFn(() => "0"),
    validUntil: timestamp("validUntil", { mode: "date" }),
    contactPhone: text("contactPhone"),
    /**
     * @deprecated Use structured project fields instead. Will be removed in v2.0.
     */
    contactAddress: text("contactAddress"),
    projectName: varchar("projectName", {
      length: QUOTE_FIELD_LENGTHS.PROJECT_NAME,
    }),
    /**
     * @deprecated Use ProjectAddress relationship instead. Maintained for backward compatibility.
     */
    projectStreet: varchar("projectStreet", {
      length: QUOTE_FIELD_LENGTHS.PROJECT_STREET,
    }),
    /**
     * @deprecated Use ProjectAddress relationship instead. Maintained for backward compatibility.
     */
    projectCity: varchar("projectCity", {
      length: QUOTE_FIELD_LENGTHS.PROJECT_CITY,
    }),
    /**
     * @deprecated Use ProjectAddress relationship instead. Maintained for backward compatibility.
     */
    projectState: varchar("projectState", {
      length: QUOTE_FIELD_LENGTHS.PROJECT_STATE,
    }),
    /**
     * @deprecated Use ProjectAddress relationship instead. Maintained for backward compatibility.
     */
    projectPostalCode: varchar("projectPostalCode", {
      length: QUOTE_FIELD_LENGTHS.PROJECT_POSTAL_CODE,
    }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
    /**
     * Timestamp when quote was sent to vendor (Feature 005)
     */
    sentAt: timestamp("sentAt", { mode: "date" }),
  },
  (table) => [
    // Foreign key to users table (nullable, set null on delete)
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "Quote_userId_fkey",
    }).onDelete("set null"),
    // Performance indexes for quote queries (TASK-013)
    // Original index
    index("Quote_userId_idx").on(table.userId),
    // Composite index for filtering by user + status
    index("Quote_userId_status_idx").on(table.userId, table.status),
    // Optimized for sorting by createdAt DESC
    index("Quote_userId_createdAt_idx").on(table.userId, table.createdAt),
    // Optimized for expired quotes filtering
    index("Quote_userId_validUntil_idx").on(table.userId, table.validUntil),
    // Search by project name
    index("Quote_projectName_idx").on(table.projectName),
    // Filter by status (draft/sent/canceled)
    index("Quote_status_idx").on(table.status),
    // Sort by creation date (all quotes)
    index("Quote_createdAt_idx").on(table.createdAt),
  ]
);

/**
 * Zod schemas for Quote validation
 */
export const quoteSelectSchema = createSelectSchema(quotes, {
  userId: z.string().uuid().nullable(),
  status: z.enum(QUOTE_STATUS_VALUES),
  currency: z.string().length(QUOTE_FIELD_LENGTHS.CURRENCY),
  total: z.number().nonnegative(),
  validUntil: z.date().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  projectName: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_NAME).optional(),
  projectStreet: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_STREET).optional(),
  projectCity: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_CITY).optional(),
  projectState: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_STATE).optional(),
  projectPostalCode: z
    .string()
    .max(QUOTE_FIELD_LENGTHS.PROJECT_POSTAL_CODE)
    .optional(),
  sentAt: z.date().optional(),
});

export const quoteInsertSchema = createInsertSchema(quotes, {
  id: z.uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.enum(QUOTE_STATUS_VALUES).optional(),
  currency: z.string().length(QUOTE_FIELD_LENGTHS.CURRENCY),
  total: z.number().nonnegative().optional(),
  validUntil: z.date().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  projectName: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_NAME).optional(),
  projectStreet: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_STREET).optional(),
  projectCity: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_CITY).optional(),
  projectState: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_STATE).optional(),
  projectPostalCode: z
    .string()
    .max(QUOTE_FIELD_LENGTHS.PROJECT_POSTAL_CODE)
    .optional(),
  sentAt: z.date().optional(),
}).omit({ createdAt: true, updatedAt: true });

export const quoteUpdateSchema = createUpdateSchema(quotes, {
  userId: z.string().uuid(),
  status: z.enum(QUOTE_STATUS_VALUES),
  currency: z.string().length(QUOTE_FIELD_LENGTHS.CURRENCY),
  total: z.number().nonnegative(),
  validUntil: z.date(),
  contactPhone: z.string(),
  contactAddress: z.string(),
  projectName: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_NAME),
  projectStreet: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_STREET),
  projectCity: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_CITY),
  projectState: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_STATE),
  projectPostalCode: z.string().max(QUOTE_FIELD_LENGTHS.PROJECT_POSTAL_CODE),
  sentAt: z.date(),
})
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

/**
 * TypeScript types inferred from schemas
 */
export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
