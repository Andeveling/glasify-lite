import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const calculateItemInput = z.object({
  modelId: z.string(),
  widthMm: z.number().min(1),
  heightMm: z.number().min(1),
  glassTypeId: z.string(),
  services: z.array(z.string()).default([]),
});

export const calculateItemOutput = z.object({
  subtotal: z.number(),
});

export const addItemInput = calculateItemInput;
export const addItemOutput = z.object({
  quoteId: z.string(),
  itemId: z.string(),
  subtotal: z.number(),
});

export const submitInput = z.object({
  quoteId: z.string(),
  contact: z.object({
    phone: z.string().min(1),
    address: z.string().min(1),
  }),
});

export const submitOutput = z.object({
  status: z.literal("sent"),
  quoteId: z.string(),
});

export const quoteRouter = createTRPCRouter({
  calculateItem: publicProcedure
    .input(calculateItemInput)
    .output(calculateItemOutput)
    .mutation(async () => ({ subtotal: 0 })),

  addItem: publicProcedure
    .input(addItemInput)
    .output(addItemOutput)
    .mutation(async () => ({ quoteId: "test", itemId: "test", subtotal: 0 })),

  submit: publicProcedure
    .input(submitInput)
    .output(submitOutput)
    .mutation(async ({ input }) => ({
      status: "sent" as const,
      quoteId: input.quoteId,
    })),
});
