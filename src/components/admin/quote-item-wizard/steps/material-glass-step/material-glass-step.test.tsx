import { describe, expect, it } from "vitest"

import { mockValidFormValues } from "../__test-utils__/mock-data"
import { renderWithFormContext } from "../__test-utils__/test-wrapper"
import { MaterialGlassStep } from "../material-glass-step"

describe("MaterialGlassStep", () => {
  it("should prompt user to select a model first when no model selected", () => {
    const { getByText } = renderWithFormContext(<MaterialGlassStep />, {
      defaultValues: { ...mockValidFormValues, modelId: "" },
    })

    expect(getByText(/seleccioná un modelo primero/i)).toBeInTheDocument()
  })

  it("should display color and glass type sections when model is selected", () => {
    const { getByText } = renderWithFormContext(<MaterialGlassStep />)

    expect(getByText("Color (opcional)")).toBeInTheDocument()
    expect(getByText("Tipo de Vidrio")).toBeInTheDocument()
  })

  it("should render glass type cards", () => {
    const { getAllByRole } = renderWithFormContext(<MaterialGlassStep />)

    const buttons = getAllByRole("button")
    expect(buttons.length).toBeGreaterThan(0)
  })
})
