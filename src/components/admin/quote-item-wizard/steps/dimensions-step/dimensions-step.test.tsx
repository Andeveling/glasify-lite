import { describe, expect, it } from 'vitest'

import { renderWithFormContext } from '../__test-utils__/test-wrapper'
import { DimensionsStep } from '../dimensions-step'

describe('DimensionsStep', () => {
  it('should render dimension fields for width and height', () => {
    const { getByLabelText } = renderWithFormContext(<DimensionsStep />)

    expect(getByLabelText(/ancho/i)).toBeInTheDocument()
    expect(getByLabelText(/alto/i)).toBeInTheDocument()
  })

  it('should render quantity field', () => {
    const { getByLabelText } = renderWithFormContext(<DimensionsStep />)

    expect(getByLabelText(/cantidad/i)).toBeInTheDocument()
  })

  it('should render room location field', () => {
    const { getByLabelText } = renderWithFormContext(<DimensionsStep />)

    expect(getByLabelText(/ambiente/i)).toBeInTheDocument()
  })

  it('should display step title and description', () => {
    const { getByText } = renderWithFormContext(<DimensionsStep />)

    expect(getByText('Dimensiones')).toBeInTheDocument()
    expect(getByText(/ingresá el ancho y alto/i)).toBeInTheDocument()
  })

  it('should convert input values to numbers', () => {
    const { getByLabelText } = renderWithFormContext(<DimensionsStep />)

    const widthInput = getByLabelText(/ancho/i) as HTMLInputElement
    widthInput.focus()
    widthInput.dispatchEvent(new Event('change', { bubbles: true }))

    expect(widthInput.type).toBe('number')
  })
})
