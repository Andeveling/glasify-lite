/**
 * Unit Tests: CartItem Component
 *
 * Tests cart item row with inline name editing, quantity adjustment,
 * and remove functionality.
 *
 * @module tests/unit/components/cart-item
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CartItem } from '../../../src/app/(public)/cart/_components/cart-item';
import type { CartItem as CartItemType } from '../../../src/types/cart.types';
import '@testing-library/jest-dom';

// ============================================================================
// Test Data
// ============================================================================

const MAX_NAME_LENGTH = 50;
const LONG_MODEL_NAME_PATTERN = /VEKA Slide System 82/;
const DIMENSIONS_PATTERN = /1200 × 1500 mm/;

const mockCartItem: CartItemType = {
  additionalServiceIds: [],
  createdAt: '2025-01-15T10:30:00.000Z',
  dimensions: {
    heightMm: 1500,
    widthMm: 1200,
  },
  glassTypeId: 'clx_glass_456',
  glassTypeName: 'Templado',
  heightMm: 1500,
  id: 'clx1234567890abcdef',
  modelId: 'clx_model_123',
  modelName: 'VEKA Slide 82',
  name: 'VEKA-001',
  quantity: 2,
  solutionId: 'clx_solution_789',
  solutionName: 'DVH',
  subtotal: 30_001.0,
  unitPrice: 15_000.5,
  widthMm: 1200,
};

// ============================================================================
// Unit Tests
// ============================================================================

describe('CartItem Component', () => {
  describe('Rendering', () => {
    it('should render item details correctly', () => {
      render(<CartItem item={mockCartItem} />);

      expect(screen.getByText('VEKA-001')).toBeInTheDocument();
      expect(screen.getByText('VEKA Slide 82 - Templado')).toBeInTheDocument();
      expect(screen.getByText('Dimensiones:')).toBeInTheDocument();
      expect(screen.getByText(DIMENSIONS_PATTERN)).toBeInTheDocument();
      expect(screen.getByText('Solución: DVH')).toBeInTheDocument();
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('2');
    });

    it('should render pricing correctly', () => {
      render(<CartItem currency="USD" item={mockCartItem} />);

      expect(screen.getByText('Precio unitario: USD $15000.50')).toBeInTheDocument();
      expect(screen.getByTestId('subtotal')).toHaveTextContent('USD $30001.00');
    });

    it('should use default currency (MXN) when not provided', () => {
      render(<CartItem item={mockCartItem} />);

      expect(screen.getByText('Precio unitario: MXN $15000.50')).toBeInTheDocument();
    });

    it('should render without optional solution', () => {
      const itemWithoutSolution = { ...mockCartItem, solutionId: undefined, solutionName: undefined };
      render(<CartItem item={itemWithoutSolution} />);

      expect(screen.getByText('VEKA Slide 82 - Templado')).toBeInTheDocument();
      expect(screen.queryByText('Solución:')).not.toBeInTheDocument();
    });
  });

  describe('Inline Name Editing', () => {
    it('should enter edit mode when name is clicked', async () => {
      render(<CartItem item={mockCartItem} />);

      const nameButton = screen.getByLabelText('Nombre del artículo');
      await userEvent.click(nameButton);

      const nameInput = screen.getByLabelText('Editar nombre del artículo');
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveValue('VEKA-001');
    });

    it('should call onUpdateName when name is edited and blurred', async () => {
      const mockUpdateName = vi.fn();
      render(<CartItem item={mockCartItem} onUpdateName={mockUpdateName} />);

      // Enter edit mode
      const nameButton = screen.getByLabelText('Nombre del artículo');
      await userEvent.click(nameButton);

      // Edit name
      const nameInput = screen.getByLabelText('Editar nombre del artículo');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'VEKA-002');

      // Blur (exit edit mode)
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(mockUpdateName).toHaveBeenCalledWith('clx1234567890abcdef', 'VEKA-002');
      });
    });

    it('should call onUpdateName when Enter key is pressed', async () => {
      const mockUpdateName = vi.fn();
      render(<CartItem item={mockCartItem} onUpdateName={mockUpdateName} />);

      // Enter edit mode
      const nameButton = screen.getByLabelText('Nombre del artículo');
      await userEvent.click(nameButton);

      // Edit name
      const nameInput = screen.getByLabelText('Editar nombre del artículo');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Custom Name');

      // Press Enter
      fireEvent.keyDown(nameInput, { key: 'Enter' });

      await waitFor(() => {
        expect(mockUpdateName).toHaveBeenCalledWith('clx1234567890abcdef', 'Custom Name');
      });
    });

    it('should not call onUpdateName if name unchanged', async () => {
      const mockUpdateName = vi.fn();
      render(<CartItem item={mockCartItem} onUpdateName={mockUpdateName} />);

      // Enter edit mode
      const nameButton = screen.getByLabelText('Nombre del artículo');
      await userEvent.click(nameButton);

      // Blur without changes
      const nameInput = screen.getByLabelText('Editar nombre del artículo');
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(mockUpdateName).not.toHaveBeenCalled();
      });
    });

    it('should enforce max length of 50 characters', async () => {
      render(<CartItem item={mockCartItem} />);

      // Enter edit mode
      const nameButton = screen.getByLabelText('Nombre del artículo');
      await userEvent.click(nameButton);

      const nameInput = screen.getByLabelText('Editar nombre del artículo') as HTMLInputElement;
      expect(nameInput).toHaveAttribute('maxLength', String(MAX_NAME_LENGTH));
    });
  });

  describe('Quantity Adjustment', () => {
    it('should call onUpdateQuantity when + button is clicked', async () => {
      const mockUpdateQuantity = vi.fn();
      render(<CartItem item={mockCartItem} onUpdateQuantity={mockUpdateQuantity} />);

      const increaseButton = screen.getByLabelText('Aumentar cantidad');
      await userEvent.click(increaseButton);

      const expectedQuantity = mockCartItem.quantity + 1;
      expect(mockUpdateQuantity).toHaveBeenCalledWith('clx1234567890abcdef', expectedQuantity);
    });

    it('should call onUpdateQuantity when - button is clicked', async () => {
      const mockUpdateQuantity = vi.fn();
      render(<CartItem item={mockCartItem} onUpdateQuantity={mockUpdateQuantity} />);

      const decreaseButton = screen.getByLabelText('Disminuir cantidad');
      await userEvent.click(decreaseButton);

      const expectedQuantity = mockCartItem.quantity - 1;
      expect(mockUpdateQuantity).toHaveBeenCalledWith('clx1234567890abcdef', expectedQuantity);
    });

    it('should disable - button when quantity is 1', () => {
      const itemWithMinQuantity = { ...mockCartItem, quantity: 1 };
      render(<CartItem item={itemWithMinQuantity} />);

      const decreaseButton = screen.getByLabelText('Disminuir cantidad') as HTMLButtonElement;
      expect(decreaseButton).toBeDisabled();
    });

    it('should disable + button when quantity is 100', () => {
      const itemWithMaxQuantity = { ...mockCartItem, quantity: 100 };
      render(<CartItem item={itemWithMaxQuantity} />);

      const increaseButton = screen.getByLabelText('Aumentar cantidad') as HTMLButtonElement;
      expect(increaseButton).toBeDisabled();
    });

    it('should not call onUpdateQuantity if would exceed max (100)', async () => {
      const mockUpdateQuantity = vi.fn();
      const itemAtMax = { ...mockCartItem, quantity: 100 };
      render(<CartItem item={itemAtMax} onUpdateQuantity={mockUpdateQuantity} />);

      const increaseButton = screen.getByLabelText('Aumentar cantidad');
      await userEvent.click(increaseButton);

      expect(mockUpdateQuantity).not.toHaveBeenCalled();
    });

    it('should not call onUpdateQuantity if would go below min (1)', async () => {
      const mockUpdateQuantity = vi.fn();
      const itemAtMin = { ...mockCartItem, quantity: 1 };
      render(<CartItem item={itemAtMin} onUpdateQuantity={mockUpdateQuantity} />);

      const decreaseButton = screen.getByLabelText('Disminuir cantidad');
      await userEvent.click(decreaseButton);

      expect(mockUpdateQuantity).not.toHaveBeenCalled();
    });
  });

  describe('Remove Functionality', () => {
    it('should call onRemove when remove button is clicked', async () => {
      const mockRemove = vi.fn();
      render(<CartItem item={mockCartItem} onRemove={mockRemove} />);

      const removeButton = screen.getByTestId('remove-button');
      await userEvent.click(removeButton);

      expect(mockRemove).toHaveBeenCalledWith('clx1234567890abcdef');
    });

    it('should have accessible remove button label with item name', () => {
      render(<CartItem item={mockCartItem} />);

      const removeButton = screen.getByLabelText('Eliminar VEKA-001');
      expect(removeButton).toBeInTheDocument();
    });

    it('should not call onRemove if callback not provided', async () => {
      const { container } = render(<CartItem item={mockCartItem} />);

      const removeButton = screen.getByTestId('remove-button');
      await userEvent.click(removeButton);

      // Should not throw error when callback is undefined
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible quantity controls', () => {
      render(<CartItem item={mockCartItem} />);

      expect(screen.getByRole('group', { name: 'Controles de cantidad' })).toBeInTheDocument();
      expect(screen.getByLabelText('Aumentar cantidad')).toBeInTheDocument();
      expect(screen.getByLabelText('Disminuir cantidad')).toBeInTheDocument();
    });

    it('should have accessible name edit field', async () => {
      render(<CartItem item={mockCartItem} />);

      const nameButton = screen.getByLabelText('Nombre del artículo');
      await userEvent.click(nameButton);

      const nameInput = screen.getByLabelText('Editar nombre del artículo');
      expect(nameInput).toBeInTheDocument();
    });

    it('should support keyboard navigation for name editing', async () => {
      const mockUpdateName = vi.fn();
      render(<CartItem item={mockCartItem} onUpdateName={mockUpdateName} />);

      // Focus and activate name button with keyboard
      const nameButton = screen.getByLabelText('Nombre del artículo');
      nameButton.focus();
      await userEvent.click(nameButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Editar nombre del artículo');
        expect(nameInput).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long model names gracefully', () => {
      const longNameItem = {
        ...mockCartItem,
        modelName: 'VEKA Slide System 82 Premium Edition with Extra Features',
      };
      render(<CartItem item={longNameItem} />);

      expect(screen.getByText(LONG_MODEL_NAME_PATTERN)).toBeInTheDocument();
    });

    it('should handle zero unit price', () => {
      const freeItem = { ...mockCartItem, subtotal: 0, unitPrice: 0 };
      render(<CartItem currency="MXN" item={freeItem} />);

      expect(screen.getByText('Precio unitario: MXN $0.00')).toBeInTheDocument();
      expect(screen.getByTestId('subtotal')).toHaveTextContent('MXN $0.00');
    });

    it('should handle fractional prices correctly', () => {
      const fractionalItem = { ...mockCartItem, subtotal: 2469.134, unitPrice: 1234.567 };
      render(<CartItem item={fractionalItem} />);

      // Should display 2 decimal places
      expect(screen.getByText('Precio unitario: MXN $1234.57')).toBeInTheDocument();
      expect(screen.getByTestId('subtotal')).toHaveTextContent('MXN $2469.13');
    });
  });
});
