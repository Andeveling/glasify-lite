import type { inferProcedureInput } from "@trpc/server";
import { describe, expect, it } from "vitest";
import type { AppRouter } from "../../src/server/api/root";
import {
  listModelsInput,
  listModelsOutput,
} from "../../src/server/api/routers/catalog";

describe("Contract: catalog.listModels", () => {
  it("should have the correct input schema", () => {
    // Mock input that satisfies the schema
    const validInput: inferProcedureInput<AppRouter["catalog"]["listModels"]> =
      {
        manufacturerId: "cl_12345",
      };

    // Validation should pass
    expect(() => listModelsInput.parse(validInput)).not.toThrow();

    // Mock input that does NOT satisfy the schema
    const invalidInput = {
      // manufacturerId is missing
    };

    // Validation should throw an error
    expect(() => listModelsInput.parse(invalidInput)).toThrow();
  });

  it("should have the correct output schema", () => {
    // Mock output that satisfies the schema
    const validOutput: ReturnType<typeof listModelsOutput.parse> = [
      {
        id: "model_1",
        name: "Model A",
        status: "published",
        minWidthMm: 100,
        maxWidthMm: 1000,
        minHeightMm: 100,
        maxHeightMm: 2000,
      },
    ];

    // Validation should pass
    expect(() => listModelsOutput.parse(validOutput)).not.toThrow();

    // Mock output that does NOT satisfy the schema
    const invalidOutput = [
      {
        id: "model_1",
        // name is missing
      },
    ];

    // Validation should throw an error
    expect(() => listModelsOutput.parse(invalidOutput)).toThrow();
  });
});
