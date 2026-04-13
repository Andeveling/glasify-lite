import { describe, expect, it } from "vitest"

import { renderWithFormContext } from "../__test-utils__/test-wrapper"
import { ServicesStep } from "../services-step"

describe("ServicesStep", () => {
  it("should display services heading", () => {
    const { getByText } = renderWithFormContext(<ServicesStep />)

    expect(getByText(/servicios adicionales/i)).toBeInTheDocument()
  })

  it("should render service cards", () => {
    const { getAllByRole } = renderWithFormContext(<ServicesStep />)

    const buttons = getAllByRole("button")
    expect(buttons.length).toBeGreaterThan(0)
  })
})
