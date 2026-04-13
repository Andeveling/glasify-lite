import { describe, expect, it } from "vitest"

import { mockValidFormValues } from "../__test-utils__/mock-data"
import { renderWithFormContext } from "../__test-utils__/test-wrapper"
import { ConfirmStep } from "../confirm-step"

describe("ConfirmStep", () => {
  const defaultProps = {
    mode: "draft" as const,
    onSuccess: () => {},
  }

  it("should display confirm heading", () => {
    const { getByText } = renderWithFormContext(<ConfirmStep {...defaultProps} />)

    expect(getByText(/confirmar ítem/i)).toBeInTheDocument()
  })

  it("should display summary with dimensions", () => {
    const { getByText } = renderWithFormContext(<ConfirmStep {...defaultProps} />)

    expect(getByText(/dimensiones y cantidad/i)).toBeInTheDocument()
  })

  it("should display configuration summary", () => {
    const { getByText } = renderWithFormContext(<ConfirmStep {...defaultProps} />)

    expect(getByText(/configuración/i)).toBeInTheDocument()
  })

  it("should render a confirm button", () => {
    const { getByRole } = renderWithFormContext(<ConfirmStep {...defaultProps} />)

    expect(getByRole("button", { name: /confirmar/i })).toBeInTheDocument()
  })

  it("should show room location when provided", () => {
    const { getByText } = renderWithFormContext(<ConfirmStep {...defaultProps} />, {
      defaultValues: mockValidFormValues,
    })

    expect(getByText("Sala")).toBeInTheDocument()
  })
})
