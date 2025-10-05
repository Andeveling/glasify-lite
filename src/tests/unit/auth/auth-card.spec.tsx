import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AuthCard from '@/app/(auth)/_components/auth-card';

describe('AuthCard Component', () => {
  describe('Rendering', () => {
    it('should render title correctly', () => {
      const title = 'Test Title';
      render(
        <AuthCard title={title}>
          <div>Test Content</div>
        </AuthCard>
      );

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      const title = 'Test Title';
      const description = 'Test description for the auth card';

      render(
        <AuthCard description={description} title={title}>
          <div>Test Content</div>
        </AuthCard>
      );

      expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const title = 'Test Title';

      render(
        <AuthCard title={title}>
          <div>Test Content</div>
        </AuthCard>
      );

      // Should not have description element
      expect(screen.queryByText(/test description/i)).not.toBeInTheDocument();
    });

    it('should render children correctly', () => {
      const title = 'Test Title';
      const childContent = 'Test child content';

      render(
        <AuthCard title={title}>
          <div>{childContent}</div>
        </AuthCard>
      );

      expect(screen.getByText(childContent)).toBeInTheDocument();
    });

    it('should apply custom className when provided', () => {
      const title = 'Test Title';
      const customClass = 'custom-test-class';

      const { container } = render(
        <AuthCard className={customClass} title={title}>
          <div>Test Content</div>
        </AuthCard>
      );

      const cardElement = container.querySelector(`.${customClass}`);
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe('Structure and Styling', () => {
    it('should have proper card structure', () => {
      const title = 'Test Title';
      const description = 'Test description';

      render(
        <AuthCard description={description} title={title}>
          <div>Test Content</div>
        </AuthCard>
      );

      // Check for card components
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply correct text styling classes', () => {
      const title = 'Test Title';
      const description = 'Test description';

      render(
        <AuthCard description={description} title={title}>
          <div>Test Content</div>
        </AuthCard>
      );

      const titleElement = screen.getByRole('heading', { name: title });
      expect(titleElement).toHaveClass('text-center', 'font-semibold', 'text-2xl', 'tracking-tight');
    });

    it('should center align title and description', () => {
      const title = 'Test Title';
      const description = 'Test description';

      render(
        <AuthCard description={description} title={title}>
          <div>Test Content</div>
        </AuthCard>
      );

      const titleElement = screen.getByRole('heading', { name: title });
      const descriptionElement = screen.getByText(description);

      expect(titleElement).toHaveClass('text-center');
      expect(descriptionElement).toHaveClass('text-center');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const title = 'Iniciar Sesión';

      render(
        <AuthCard title={title}>
          <div>Content</div>
        </AuthCard>
      );

      const heading = screen.getByRole('heading', { name: title });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1'); // Should be main heading for auth pages
    });

    it('should maintain proper heading hierarchy with description', () => {
      const title = 'Iniciar Sesión';
      const description = 'Ingresa a tu cuenta';

      render(
        <AuthCard description={description} title={title}>
          <div>Content</div>
        </AuthCard>
      );

      const heading = screen.getByRole('heading', { name: title });
      const desc = screen.getByText(description);

      expect(heading).toBeInTheDocument();
      expect(desc).toBeInTheDocument();

      // Description should not be a heading
      expect(desc.tagName).not.toBe('H1');
      expect(desc.tagName).not.toBe('H2');
    });
  });

  describe('Content Flexibility', () => {
    it('should handle complex children components', () => {
      const title = 'Test Title';

      render(
        <AuthCard title={title}>
          <form>
            <input placeholder="Email" type="email" />
            <input placeholder="Password" type="password" />
            <button type="submit">Submit</button>
          </form>
        </AuthCard>
      );

      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should handle multiple child elements', () => {
      const title = 'Test Title';

      render(
        <AuthCard title={title}>
          <div>First child</div>
          <div>Second child</div>
          <span>Third child</span>
        </AuthCard>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText('Third child')).toBeInTheDocument();
    });

    it('should handle empty children gracefully', () => {
      const title = 'Test Title';

      render(<AuthCard title={title}>{null}</AuthCard>);

      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });
  });

  describe('Integration with UI Framework', () => {
    it('should render as a proper card component', () => {
      const title = 'Test Title';

      const { container } = render(
        <AuthCard title={title}>
          <div>Content</div>
        </AuthCard>
      );

      // Should have card structure (depends on your card component implementation)
      const cardElement = container.firstChild;
      expect(cardElement).toBeInTheDocument();
    });

    it('should apply width class correctly', () => {
      const title = 'Test Title';

      const { container } = render(
        <AuthCard title={title}>
          <div>Content</div>
        </AuthCard>
      );

      const cardElement = container.firstChild;
      expect(cardElement).toHaveClass('w-full');
    });

    it('should merge custom className with default classes', () => {
      const title = 'Test Title';
      const customClass = 'max-w-md';

      const { container } = render(
        <AuthCard className={customClass} title={title}>
          <div>Content</div>
        </AuthCard>
      );

      const cardElement = container.firstChild;
      expect(cardElement).toHaveClass('w-full', customClass);
    });
  });
});
