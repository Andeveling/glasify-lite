import type { inferProcedureInput } from "@trpc/server";
import { describe, expect, it } from "vitest";
import type { AppRouter } from "../../src/server/api/root";
import {
  adminRouter,
  upsertModelInput,
  upsertModelOutput,
} from "../../src/server/api/routers/admin";

describe("Contract: admin.model.upsert", () => {
  it("should have the correct input schema for creating a model", () => {
    const validInput: inferProcedureInput<
      AppRouter["admin"]["model"]["upsert"]
    > = {
      name: "New Model",
      status: "draft",
      minWidthMm: 100,
      maxWidthMm: 2000,
      minHeightMm: 100,
      maxHeightMm: 3000,
      basePrice: 150.0,
      costPerMmWidth: 0.1,
      costPerMmHeight: 0.15,
      accessoryPrice: 25.0,
      compatibleGlassTypeIds: ["glass_1", "glass_2"],
    };

    expect(() => upsertModelInput.parse(validInput)).not.toThrow();
  });

  it("should have the correct input schema for updating a model", () => {
    const validInput: inferProcedureInput<
      AppRouter["admin"]["model"]["upsert"]
    > = {
      id: "model_xyz",
      name: "Updated Model Name",
      status: "published",
    };

    expect(() => upsertModelInput.parse(validInput)).not.toThrow();
  });

  it("should fail validation for invalid input", () => {
    const invalidInput = {
      name: "Incomplete Model",
      // Missing other required fields
    };

    expect(() => upsertModelInput.parse(invalidInput)).toThrow();
  });

  it("should have the correct output schema", () => {
    const validOutput: ReturnType<typeof upsertModelOutput.parse> = {
      modelId: "model_abc_123",
    };

    expect(() => upsertModelOutput.parse(validOutput)).not.toThrow();

    const invalidOutput = {
      // Missing modelId
    };

    expect(() => upsertModelOutput.parse(invalidOutput)).toThrow();
  });
});
