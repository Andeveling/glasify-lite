import { describe, expect, it } from 'vitest'

import { mockValidFormValues, mockModels } from '../__test-utils__/mock-data'
import { renderWithFormContext } from '../__test-utils__/test-wrapper'
import { ModelSelectStep } from '../model-select-step'

describe('ModelSelectStep', () => {
  it('should prompt user to enter dimensions first when width/height missing', () => {
    const { getByText } = renderWithFormContext(<ModelSelectStep />, {
      defaultValues: { ...mockValidFormValues, widthMm: 0, heightMm: 0 },
    })

    expect(getByText(/ingresá las dimensiones/i)).toBeInTheDocument()
  })

  it('should display model cards when models are available', () => {
    const { getByText } = renderWithFormContext(<ModelSelectStep />)

    expect(getByText(/seleccioná un modelo/i)).toBeInTheDocument()
  })

  it('should render each model name in the list', () => {
    const { getAllByRole } = renderWithFormContext(<ModelSelectStep />)

    const buttons = getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(mockModels.length)
  })

  it('should show available models count', () => {
    const { getByText } = renderWithFormContext(<ModelSelectStep />)

    expect(getByText(/modelos disponibles/i)).toBeInTheDocument()
  })
})
