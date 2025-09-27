import type { inferProcedureInput } from "@trpc/server";
import { describe, expect, it } from "vitest";
import type { AppRouter } from "../../src/server/api/root";
import {
  addItemInput,
  addItemOutput,
} from "../../src/server/api/routers/quote";

describe("Contract: quote.addItem", () => {
  it("should have the correct input schema", () => {
    const validInput: inferProcedureInput<AppRouter["quote"]["addItem"]> = {
      quoteId: "quote_abc",
      modelId: "model_123",
      widthMm: 500,
      heightMm: 1000,
      glassTypeId: "glass_456",
      services: [{ serviceId: "service_789", quantity: 2 }],
    };

    expect(() => addItemInput.parse(validInput)).not.toThrow();

    // Test without optional quoteId
    const validInputWithoutQuote: inferProcedureInput<
      AppRouter["quote"]["addItem"]
    > = {
      modelId: "model_123",
      widthMm: 500,
      heightMm: 1000,
      glassTypeId: "glass_456",
    };
    expect(() => addItemInput.parse(validInputWithoutQuote)).not.toThrow();

    const invalidInput = {
      widthMm: 500,
      // Missing required fields
    };

    expect(() => addItemInput.parse(invalidInput)).toThrow();
  });

  it("should have the correct output schema", () => {
    const validOutput: ReturnType<typeof addItemOutput.parse> = {
      quoteId: "quote_def",
      itemId: "item_xyz",
      subtotal: 350.5,
    };

    expect(() => addItemOutput.parse(validOutput)).not.toThrow();

    const invalidOutput = {
      quoteId: "quote_def",
      // Missing itemId and subtotal
    };

    expect(() => addItemOutput.parse(invalidOutput)).toThrow();
  });
});
