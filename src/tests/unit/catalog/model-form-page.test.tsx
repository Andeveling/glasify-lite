import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/';
import { ModelForm } from '@/app/(public)/catalog/_components/model-form';

// Regex constants for performance (Biome rule)
const MODEL_NAME_REGEX = /Ventana VEKA 70/i;
const MANUFACTURER_REGEX = /VEKA/i;
const WIDTH_LABEL_REGEX = /Ancho \(mm\)/i;
const HEIGHT_LABEL_REGEX = /Alto \(mm\)/i;
const QUANTITY_LABEL_REGEX = /Cantidad/i;
const SERVICES_LABEL_REGEX = /Servicios adicionales/i;
const ADD_TO_QUOTE_BUTTON_REGEX = /añadir a cotización/i;
const MODEL_NOT_FOUND_REGEX = /El modelo solicitado no existe/i;

// Mock tRPC hook (simula datos del modelo) - MUST be before imports
vi.mock('@/trpc/react', () => ({
  api: {
    catalog: {
      'get-model-by-id': {
        useQuery: vi.fn(),
      },
    },
  },
}));

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

  it('debe renderizar el nombre del modelo y fabricante', () => {
    render(<ModelForm modelId="model-123" />);
    expect(screen.getByText(MODEL_NAME_REGEX)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: MODEL_NAME_REGEX })).toBeInTheDocument();
    // Verifica que el fabricante aparece al menos una vez
    expect(screen.getAllByText(MANUFACTURER_REGEX).length).toBeGreaterThan(0);
  });

  it('debe renderizar los campos del formulario de parametrización', () => {
    render(<ModelForm modelId="model-123" />);
    expect(screen.getByLabelText(WIDTH_LABEL_REGEX)).toBeInTheDocument();
    expect(screen.getByLabelText(HEIGHT_LABEL_REGEX)).toBeInTheDocument();
    expect(screen.getByLabelText(QUANTITY_LABEL_REGEX)).toBeInTheDocument();
    expect(screen.getByLabelText(SERVICES_LABEL_REGEX)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADD_TO_QUOTE_BUTTON_REGEX })).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error si el modelo no existe', () => {
    // Override mock for this test to simulate error
    mockUseQuery.mockReturnValueOnce({
      data: null,
      isError: true,
      isLoading: false,
    });

    render(<ModelForm modelId="model-123" />);
    expect(screen.getByText(MODEL_NOT_FOUND_REGEX)).toBeInTheDocument();
  });
});
