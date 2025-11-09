/**
 * Quote Mutations - Write Operations
 *
 * tRPC procedures for creating and updating quotes.
 *
 * @module server/api/routers/quote/quote.mutations
 */
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { generateQuoteFromCartInput, sendToVendorInput } from "./quote.schemas";
import { generateQuoteFromCart, sendQuoteToVendor } from "./quote.service";

export const quoteMutations = createTRPCRouter({
  /**
   * Generate quote from cart items
   *
   * @procedure generate-from-cart
   * @access Protected (authenticated users)
   * @input GenerateQuoteFromCartInput
   * @returns Quote ID on success
   */
  "generate-from-cart": protectedProcedure
    .input(generateQuoteFromCartInput)
    .mutation(async ({ ctx, input }) => {
      // Transform tRPC input to service input format
      const serviceInput = {
        cartItems: input.cartItems.map((item) => ({
          id: crypto.randomUUID(), // Generate temporary ID for processing
          glassTypeId: item.glassTypeId,
          glassTypeName: item.glassTypeName,
          modelId: item.modelId,
          modelName: item.modelName,
          name: item.name,
          quantity: item.quantity,
          dimensions: {
            widthMm: item.widthMm,
            heightMm: item.heightMm,
          },
          widthMm: item.widthMm,
          heightMm: item.heightMm,
          solutionId: item.solutionId,
          solutionName: item.solutionName,
          additionalServiceIds: item.additionalServiceIds,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
          createdAt: new Date().toISOString(),
        })),
        manufacturerId: input.manufacturerId,
        projectAddress: input.projectAddress,
        contactPhone: input.contactPhone,
        deliveryAddress: input.deliveryAddress,
      };

      return await generateQuoteFromCart(
        ctx.db,
        ctx.session.user.id,
        serviceInput
      );
    }),

  /**
   * Send quote to vendor
   *
   * @procedure send-to-vendor
   * @access Protected (authenticated users)
   * @input SendToVendorInput
   * @returns Updated quote with sent status
   */
  "send-to-vendor": protectedProcedure
    .input(sendToVendorInput)
    .mutation(async ({ ctx, input }) =>
      sendQuoteToVendor(ctx.db, {
        quoteId: input.quoteId,
        userId: ctx.session.user.id,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
      })
    ),
});
