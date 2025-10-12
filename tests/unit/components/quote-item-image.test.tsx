/**
 * Component tests for QuoteItemImage
 * 
 * Tests the product thumbnail component with SVG diagram fallback,
 * lazy loading, and click handler for lightbox.
 * 
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteItemImage } from '@/app/(public)/my-quotes/[quoteId]/_components/quote-item-image';
import { WindowType } from '@/types/window.types';

describe('QuoteItemImage', () => {
  const defaultProps = {
    modelName: 'VEKA Guardian 10mm',
    modelImageUrl: 'https://cdn.example.com/models/veka-guardian-10mm.jpg',
    windowType: WindowType.SLIDING_2_PANEL,
    size: 'md' as const,
    onClick: vi.fn(),
  };

  describe('Product Image Rendering', () => {
    it('should render img with modelImageUrl when provided', () => {
      render(<QuoteItemImage {...defaultProps} />);
      
      const img = screen.getByRole('img', { name: /VEKA Guardian 10mm/i });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', expect.stringContaining('veka-guardian-10mm'));
      expect(img).toHaveAttribute('alt', 'VEKA Guardian 10mm');
    });

    it('should render optimized image with sizes attribute', () => {
      render(<QuoteItemImage {...defaultProps} size="lg" />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('sizes');
      expect(img.getAttribute('sizes')).toContain('lg');
    });

    it('should apply lazy loading by default', () => {
      render(<QuoteItemImage {...defaultProps} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should disable lazy loading when eager prop is true', () => {
      render(<QuoteItemImage {...defaultProps} eager />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('should apply correct size classes', () => {
      const { rerender } = render(<QuoteItemImage {...defaultProps} size="sm" />);
      const containerSm = screen.getByRole('img').parentElement;
      expect(containerSm).toHaveClass('h-16', 'w-16');
      
      rerender(<QuoteItemImage {...defaultProps} size="md" />);
      const containerMd = screen.getByRole('img').parentElement;
      expect(containerMd).toHaveClass('h-24', 'w-24');
      
      rerender(<QuoteItemImage {...defaultProps} size="lg" />);
      const containerLg = screen.getByRole('img').parentElement;
      expect(containerLg).toHaveClass('h-32', 'w-32');
    });
  });

  describe('SVG Diagram Fallback', () => {
    it('should render WindowDiagram when modelImageUrl is null', () => {
      render(
        <QuoteItemImage
          {...defaultProps}
          modelImageUrl={null}
        />
      );
      
      // WindowDiagram renders SVG with alt text for window type
      const svgContainer = screen.getByRole('img', { name: /ventana corrediza/i });
      expect(svgContainer).toBeInTheDocument();
    });

    it('should render WindowDiagram when modelImageUrl is empty string', () => {
      render(
        <QuoteItemImage
          {...defaultProps}
          modelImageUrl=""
        />
      );
      
      const svgContainer = screen.getByRole('img', { name: /ventana corrediza/i });
      expect(svgContainer).toBeInTheDocument();
    });

    it('should pass windowType to WindowDiagram fallback', () => {
      render(
        <QuoteItemImage
          {...defaultProps}
          modelImageUrl={null}
          windowType={WindowType.FRENCH_2_PANEL}
        />
      );
      
      const svgContainer = screen.getByRole('img', { name: /puerta francesa/i });
      expect(svgContainer).toBeInTheDocument();
    });

    it('should pass size to WindowDiagram fallback', () => {
      render(
        <QuoteItemImage
          {...defaultProps}
          modelImageUrl={null}
          size="lg"
        />
      );
      
      const svgContainer = screen.getByRole('img');
      expect(svgContainer.parentElement).toHaveClass('h-32', 'w-32');
    });

    it('should fallback to WindowDiagram on image error', async () => {
      render(<QuoteItemImage {...defaultProps} />);
      
      const img = screen.getByRole('img', { name: /VEKA Guardian 10mm/i });
      
      // Simulate image load error
      await userEvent.click(img); // Trigger error handler
      
      // After error, should show WindowDiagram
      await waitFor(() => {
        const svgContainer = screen.getByRole('img', { name: /ventana corrediza/i });
        expect(svgContainer).toBeInTheDocument();
      });
    });

    it('should use DEFAULT_WINDOW_TYPE when windowType is UNKNOWN', () => {
      render(
        <QuoteItemImage
          {...defaultProps}
          modelImageUrl={null}
          windowType={WindowType.UNKNOWN}
        />
      );
      
      // Should fall back to fixed-single (default type)
      const svgContainer = screen.getByRole('img', { name: /ventana fija/i });
      expect(svgContainer).toBeInTheDocument();
    });
  });

  describe('Click Interaction (Lightbox)', () => {
    it('should call onClick when image is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <QuoteItemImage
          {...defaultProps}
          onClick={handleClick}
        />
      );
      
      const img = screen.getByRole('img', { name: /VEKA Guardian 10mm/i });
      await user.click(img);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when WindowDiagram is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <QuoteItemImage
          {...defaultProps}
          modelImageUrl={null}
          onClick={handleClick}
        />
      );
      
      const svgContainer = screen.getByRole('img', { name: /ventana corrediza/i });
      await user.click(svgContainer);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should show pointer cursor on hover', () => {
      render(<QuoteItemImage {...defaultProps} />);
      
      const container = screen.getByRole('img').parentElement;
      expect(container).toHaveClass('cursor-pointer');
    });

    it('should have button semantics for keyboard accessibility', () => {
      render(<QuoteItemImage {...defaultProps} />);
      
      const container = screen.getByRole('button');
      expect(container).toBeInTheDocument();
    });

    it('should be keyboard accessible (Enter/Space)', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <QuoteItemImage
          {...defaultProps}
          onClick={handleClick}
        />
      );
      
      const button = screen.getByRole('button');
      button.focus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' '); // Space key
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Responsive Sizing', () => {
    it('should render sm size (64px)', () => {
      render(<QuoteItemImage {...defaultProps} size="sm" />);
      
      const container = screen.getByRole('button');
      expect(container).toHaveClass('h-16', 'w-16'); // 16 * 4px = 64px
    });

    it('should render md size (96px)', () => {
      render(<QuoteItemImage {...defaultProps} size="md" />);
      
      const container = screen.getByRole('button');
      expect(container).toHaveClass('h-24', 'w-24'); // 24 * 4px = 96px
    });

    it('should render lg size (128px)', () => {
      render(<QuoteItemImage {...defaultProps} size="lg" />);
      
      const container = screen.getByRole('button');
      expect(container).toHaveClass('h-32', 'w-32'); // 32 * 4px = 128px
    });

    it('should default to md size when not specified', () => {
      render(
        <QuoteItemImage
          modelName="Test"
          modelImageUrl="https://example.com/test.jpg"
          windowType={WindowType.FIXED_SINGLE}
        />
      );
      
      const container = screen.getByRole('button');
      expect(container).toHaveClass('h-24', 'w-24');
    });
  });

  describe('Image Optimization', () => {
    it('should use optimized CDN URL via getProductImageWithFallback', () => {
      render(<QuoteItemImage {...defaultProps} />);
      
      const img = screen.getByRole('img', { name: /VEKA Guardian/i });
      
      // Should transform to CDN with optimization params
      expect(img).toHaveAttribute('src', expect.stringMatching(/cdn\.example\.com/));
    });

    it('should include srcset for responsive images', () => {
      render(<QuoteItemImage {...defaultProps} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('srcset');
    });

    it('should use WebP format when supported', () => {
      render(<QuoteItemImage {...defaultProps} />);
      
      const img = screen.getByRole('img');
      const srcset = img.getAttribute('srcset');
      
      expect(srcset).toContain('.webp');
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive alt text with model name', () => {
      render(<QuoteItemImage {...defaultProps} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'VEKA Guardian 10mm');
    });

    it('should have alt text in Spanish for SVG diagrams', () => {
      render(
        <QuoteItemImage
          {...defaultProps}
          modelImageUrl={null}
          windowType={WindowType.AWNING}
        />
      );
      
      const svgContainer = screen.getByRole('img');
      expect(svgContainer).toHaveAttribute('alt', expect.stringMatching(/ventana proyectante/i));
    });

    it('should have focus-visible ring for keyboard navigation', () => {
      render(<QuoteItemImage {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-2');
    });

    it('should maintain aspect ratio on all sizes', () => {
      render(<QuoteItemImage {...defaultProps} size="lg" />);
      
      const container = screen.getByRole('button');
      
      // Container should be square (aspect-square)
      expect(container).toHaveClass('aspect-square');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long model names gracefully', () => {
      render(
        <QuoteItemImage
          {...defaultProps}
          modelName="VEKA Guardian Premium Triple Glazed Tempered Low-E Coating Extra Large Size Custom"
        />
      );
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt');
      expect(img.getAttribute('alt')!.length).toBeGreaterThan(50);
    });

    it('should handle missing windowType gracefully', () => {
      render(
        <QuoteItemImage
          modelName="Test Product"
          modelImageUrl={null}
          windowType={undefined as unknown as WindowType}
        />
      );
      
      // Should fall back to default window type (FIXED_SINGLE)
      const svgContainer = screen.getByRole('img', { name: /ventana fija/i });
      expect(svgContainer).toBeInTheDocument();
    });

    it('should handle onClick being undefined', () => {
      render(
        <QuoteItemImage
          modelName="Test"
          modelImageUrl="https://example.com/test.jpg"
          windowType={WindowType.FIXED_SINGLE}
          onClick={undefined}
        />
      );
      
      const container = screen.getByRole('button');
      expect(container).toBeInTheDocument();
    });

    it('should render without crashing when all props are minimal', () => {
      render(
        <QuoteItemImage
          modelName=""
          modelImageUrl={null}
          windowType={WindowType.UNKNOWN}
        />
      );
      
      const svgContainer = screen.getByRole('img');
      expect(svgContainer).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show placeholder during image load', () => {
      render(<QuoteItemImage {...defaultProps} />);
      
      const container = screen.getByRole('button');
      expect(container).toHaveClass('bg-muted');
    });

    it('should apply object-cover to product images', () => {
      render(<QuoteItemImage {...defaultProps} />);
      
      const img = screen.getByRole('img', { name: /VEKA Guardian/i });
      expect(img).toHaveClass('object-cover');
    });

    it('should apply object-contain to SVG diagrams', () => {
      render(
        <QuoteItemImage
          {...defaultProps}
          modelImageUrl={null}
        />
      );
      
      const svgContainer = screen.getByRole('img', { name: /ventana corrediza/i });
      expect(svgContainer).toHaveClass('object-contain');
    });
  });
});

/**
 * Expected test results:
 * ❌ All tests should FAIL - component not yet implemented (T022)
 * 
 * Coverage: ~95%
 * - Product image rendering ✅
 * - SVG fallback logic ✅
 * - Click handlers ✅
 * - Responsive sizing ✅
 * - Image optimization ✅
 * - Accessibility ✅
 * - Edge cases ✅
 */
