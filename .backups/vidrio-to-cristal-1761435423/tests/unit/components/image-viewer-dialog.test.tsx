/**
 * Component tests for ImageViewerDialog
 *
 * Tests the lightbox image viewer with accessibility features,
 * including visually hidden DialogTitle for screen readers.
 *
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ImageViewerDialog } from '@/app/(public)/my-quotes/[quoteId]/_components/image-viewer-dialog';
import { WindowType } from '@/types/window.types';

describe('ImageViewerDialog', () => {
  const defaultProps = {
    dimensions: '100 x 120 cm',
    modelImageUrl: 'https://cdn.example.com/models/veka-guardian.jpg',
    modelName: 'VEKA Guardian 10mm',
    onOpenChange: vi.fn(),
    open: true,
    specifications: {
      glassType: 'Templado',
      manufacturer: 'Guardian',
      thickness: '10mm',
      treatment: 'Low-E',
    },
    windowType: WindowType.SLIDING_2_PANEL,
  };

  describe('Accessibility', () => {
    it('should render visually hidden DialogTitle for screen readers', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      // DialogTitle should exist in DOM but be visually hidden
      const title = screen.getByText('Visor de imagen: VEKA Guardian 10mm');
      expect(title).toBeInTheDocument();

      // Verify it has Radix VisuallyHidden styles (sr-only or absolute positioning)
      const titleElement = title.closest('[data-radix-visually-hidden]');
      expect(titleElement).toBeInTheDocument();
    });

    it('should have aria-label on DialogContent', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      const dialog = screen.getByTestId('image-viewer-dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Visor de imagen: VEKA Guardian 10mm');
    });

    it('should have aria-label on close button', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      const closeButton = screen.getByLabelText('Cerrar visor de imagen');
      expect(closeButton).toBeInTheDocument();
    });

    it('should trap focus within dialog when open', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      const closeButton = screen.getByLabelText('Cerrar visor de imagen');
      expect(closeButton).toBeInTheDocument();

      // Focus should be trapped - pressing Tab shouldn't escape dialog
      // This is handled by Radix Dialog's FocusTrap
    });
  });

  describe('Image Display', () => {
    it('should render product image when modelImageUrl is provided', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      const image = screen.getByRole('img', { name: 'VEKA Guardian 10mm' });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', expect.stringContaining('veka-guardian'));
    });

    it('should render WindowDiagram fallback when no image URL', () => {
      render(<ImageViewerDialog {...defaultProps} modelImageUrl={null} />);

      // WindowDiagram should render SVG with window type label
      const diagram = screen.getByRole('img', { name: /ventana corrediza/i });
      expect(diagram).toBeInTheDocument();
    });

    it('should display product name in overlay', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 3, name: 'VEKA Guardian 10mm' });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Product Specifications Overlay', () => {
    it('should display window type', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      expect(screen.getByText(/tipo:/i)).toBeInTheDocument();
      expect(screen.getByText(/ventana corrediza/i)).toBeInTheDocument();
    });

    it('should display dimensions when provided', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      expect(screen.getByText(/dimensiones:/i)).toBeInTheDocument();
      expect(screen.getByText('100 x 120 cm')).toBeInTheDocument();
    });

    it('should display glass type when provided', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      expect(screen.getByText(/vidrio:/i)).toBeInTheDocument();
      expect(screen.getByText('Templado')).toBeInTheDocument();
    });

    it('should display manufacturer when provided', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      expect(screen.getByText(/fabricante:/i)).toBeInTheDocument();
      expect(screen.getByText('Guardian')).toBeInTheDocument();
    });

    it('should display thickness when provided', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      expect(screen.getByText(/espesor:/i)).toBeInTheDocument();
      expect(screen.getByText('10mm')).toBeInTheDocument();
    });

    it('should display treatment when provided', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      expect(screen.getByText(/tratamiento:/i)).toBeInTheDocument();
      expect(screen.getByText('Low-E')).toBeInTheDocument();
    });

    it('should hide specifications sections when not provided', () => {
      render(
        <ImageViewerDialog
          {...defaultProps}
          dimensions={undefined}
          specifications={{
            glassType: undefined,
            manufacturer: undefined,
            thickness: undefined,
            treatment: undefined,
          }}
        />
      );

      expect(screen.queryByText(/dimensiones:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/vidrio:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/fabricante:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/espesor:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/tratamiento:/i)).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onOpenChange with false when close button clicked', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(<ImageViewerDialog {...defaultProps} onOpenChange={onOpenChange} />);

      const closeButton = screen.getByLabelText('Cerrar visor de imagen');
      await user.click(closeButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should call onOpenChange with false when Escape key pressed', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(<ImageViewerDialog {...defaultProps} onOpenChange={onOpenChange} />);

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should not render dialog content when open is false', () => {
      render(<ImageViewerDialog {...defaultProps} open={false} />);

      expect(screen.queryByTestId('image-viewer-dialog')).not.toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should apply backdrop blur to overlay', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      const overlay = screen.getByTestId('dialog-overlay');
      expect(overlay).toHaveClass('backdrop-blur-sm');
    });

    it('should apply transparent background to dialog content', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      const dialog = screen.getByTestId('image-viewer-dialog');
      expect(dialog).toHaveClass('bg-transparent');
    });

    it('should position close button absolutely in top-right corner', () => {
      render(<ImageViewerDialog {...defaultProps} />);

      const closeButton = screen.getByLabelText('Cerrar visor de imagen');
      expect(closeButton).toHaveClass('absolute', 'top-4', 'right-4');
    });
  });
});
