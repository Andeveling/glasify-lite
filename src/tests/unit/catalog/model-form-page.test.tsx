import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock tRPC hook (simula datos del modelo) - MUST be FIRST, before any imports that use it
vi.mock('@/trpc/react', () => ({
  api: {
    catalog: {
      'get-model-by-id': {
        useQuery: vi.fn(),
      },
    },
  },
}));

// Import after mocks to ensure the mock is applied
import { ModelForm } from '@/app/(public)/catalog/[modelId]/_components/form/model-form';
import { api } from '@/trpc/react';

// Regex constants for performance (Biome rule)
const MODEL_NAME_REGEX = /Ventana VEKA 70/i;
const MANUFACTURER_REGEX = /VEKA/i;
const WIDTH_LABEL_REGEX = /Ancho \(mm\)/i;
const HEIGHT_LABEL_REGEX = /Alto \(mm\)/i;
const QUANTITY_LABEL_REGEX = /Cantidad/i;
const SERVICES_LABEL_REGEX = /Servicios adicionales/i;
const ADD_TO_QUOTE_BUTTON_REGEX = /añadir a cotización/i;
const MODEL_NOT_FOUND_REGEX = /El modelo solicitado no existe/i;

// Type the mock properly
const mockUseQuery = api.catalog['get-model-by-id'].useQuery as ReturnType<typeof vi.fn>;

describe('ModelFormPage', () => {
  beforeEach(() => {
    // Reset mock to default successful state
    mockUseQuery.mockReturnValue({
      data: {
        basePrice: 120_000,
        compatibleGlassTypeIds: ['glass-5mm', 'glass-6mm-low-e'],
        id: 'model-123',
        manufacturer: { name: 'VEKA' },
        maxHeightMm: 2200,
        maxWidthMm: 2000,
        minHeightMm: 500,
        minWidthMm: 500,
        name: 'Ventana VEKA 70',
      },
      isError: false,
      isLoading: false,
    });
  });
  // English: messages
  it('should render model name and manufacturer', () => {
    render(<ModelForm modelId="model-123" />);
    expect(screen.getByText(MODEL_NAME_REGEX)).toBeInstanceOf(HTMLElement);
    expect(screen.getByRole('heading', { name: MODEL_NAME_REGEX })).toBeInstanceOf(HTMLElement);
    // Check that the manufacturer appears at least once
    expect(screen.getAllByText(MANUFACTURER_REGEX).length).toBeGreaterThan(0);
  });

  it('should render the parameterization form fields', () => {
    render(<ModelForm modelId="model-123" />);
    expect(screen.getByLabelText(WIDTH_LABEL_REGEX)).toBeInstanceOf(HTMLElement);
    expect(screen.getByLabelText(HEIGHT_LABEL_REGEX)).toBeInstanceOf(HTMLElement);
    expect(screen.getByLabelText(QUANTITY_LABEL_REGEX)).toBeInstanceOf(HTMLElement);
    expect(screen.getByLabelText(SERVICES_LABEL_REGEX)).toBeInstanceOf(HTMLElement);
    expect(screen.getByRole('button', { name: ADD_TO_QUOTE_BUTTON_REGEX })).toBeInstanceOf(HTMLElement);
  });

  it('should show error message if model does not exist', () => {
    // Override mock for this test to simulate error
    mockUseQuery.mockReturnValueOnce({
      data: null,
      isError: true,
      isLoading: false,
    });

    render(<ModelForm modelId="model-123" />);
    expect(screen.getByText(MODEL_NOT_FOUND_REGEX)).toBeInstanceOf(HTMLElement);
  });
});
