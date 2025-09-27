import type { inferProcedureInput } from "@trpc/server";
import { describe, expect, it } from "vitest";
import type { AppRouter } from "../../src/server/api/root";
import {
  calculateItemInput,
  calculateItemOutput,
} from "../../src/server/api/routers/quote";

describe("Contract: quote.calculateItem", () => {
  it("should have the correct input schema", () => {
    const validInput: inferProcedureInput<AppRouter["quote"]["calculateItem"]> =
      {
        modelId: "model_123",
        widthMm: 500,
        heightMm: 1000,
        glassTypeId: "glass_456",
        services: [{ serviceId: "service_789", quantity: 2 }],
        adjustments: [
          {
            scope: "item",
            concept: "Discount",
            unit: "unit",
            sign: "negative",
            value: 10,
          },
        ],
      };

    expect(() => calculateItemInput.parse(validInput)).not.toThrow();

    const invalidInput = {
      widthMm: 500,
      heightMm: 1000,
    };

    expect(() => calculateItemInput.parse(invalidInput)).toThrow();
  });

  it("should have the correct output schema", () => {
    const validOutput: ReturnType<typeof calculateItemOutput.parse> = {
      dimPrice: 250,
      accPrice: 50,
      services: [
        {
          serviceId: "service_789",
          unit: "unit",
          quantity: 2,
          amount: 20,
        },
      ],
      adjustments: [{ amount: -10 }],
      subtotal: 310,
    };

    expect(() => calculateItemOutput.parse(validOutput)).not.toThrow();

    const invalidOutput = {
      dimPrice: 250,
      // subtotal is missing
    };

    expect(() => calculateItemOutput.parse(invalidOutput)).toThrow();
  });
});
