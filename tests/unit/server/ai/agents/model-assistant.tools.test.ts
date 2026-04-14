import { describe, expect, it, vi } from "vitest"

describe("Model Assistant Tools", () => {
  it("exposes clone and publish tools for the agent layer", async () => {
    const { modelCalibrationTools, modelCreationTools } = await import(
      "@/server/ai/agents/model-assistant.tools"
    )

    expect(modelCreationTools.cloneModel).toBeDefined()
    expect(modelCalibrationTools.cloneModel).toBeDefined()
    expect(modelCalibrationTools.publishModel).toBeDefined()
  })

  it("exposes updateModel for calibration workflows", async () => {
    const { modelCalibrationTools, modelCreationTools } = await import(
      "@/server/ai/agents/model-assistant.tools"
    )

    expect(modelCreationTools.updateModel).toBeDefined()
    expect(modelCalibrationTools.updateModel).toBeDefined()
  })
})
