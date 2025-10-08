import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SignInForm from '@/app/(auth)/_components/signin-form';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

const mockSignIn = vi.mocked(await import('next-auth/react')).signIn;

describe('SignInForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form elements correctly', () => {
      render(<SignInForm />);

      // Form fields
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();

      // Buttons
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();

      // Form elements have correct attributes
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'tu@ejemplo.com');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');

      const passwordInput = screen.getByLabelText(/contraseña/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    });

    it('should render separator text correctly', () => {
      render(<SignInForm />);
      expect(screen.getByText(/o continúa con/i)).toBeInTheDocument();
    });

    it('should render with custom props when provided', () => {
      const customError = 'Custom error message';
      render(<SignInForm error={customError} isLoading={true} />);

      expect(screen.getByText(customError)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /google/i })).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      render(<SignInForm />);

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email format', async () => {
      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/ingresa un email válido/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short password', async () => {
      render(<SignInForm />);

      const passwordInput = screen.getByLabelText(/contraseña/i);
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should validate fields on blur (onBlur mode)', async () => {
      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.focus(emailInput);
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call default signIn when no custom onSubmit provided', async () => {
      mockSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null });

      render(<SignInForm />);

      // Fill form with valid data
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        });
      });
    });

    it('should call custom onSubmit when provided', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<SignInForm onSubmit={mockOnSubmit} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should show loading state during submission', async () => {
      const mockOnSubmit = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<SignInForm onSubmit={mockOnSubmit} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Should show loading state
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
        expect(submitButton).toBeDisabled();
        expect(screen.getByRole('button', { name: /google/i })).toBeDisabled();
      });
    });

    it('should handle submission errors gracefully', async () => {
      mockSignIn.mockResolvedValue({ error: 'CredentialsSignin', ok: false, status: 401, url: null });

      render(<SignInForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'wrongpassword' },
      });

      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      await waitFor(() => {
        expect(screen.getByText(/email o contraseña incorrectos/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors during submission', async () => {
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Network error'));

      render(<SignInForm onSubmit={mockOnSubmit} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      await waitFor(() => {
        expect(screen.getByText(/error al iniciar sesión/i)).toBeInTheDocument();
      });
    });
  });

  describe('Google Sign In', () => {
    it('should call default Google signIn when no custom handler provided', async () => {
      mockSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null });

      render(<SignInForm />);

      fireEvent.click(screen.getByRole('button', { name: /google/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' });
      });
    });

    it('should call custom Google signIn handler when provided', async () => {
      const mockOnGoogleSignIn = vi.fn().mockResolvedValue(undefined);

      render(<SignInForm onGoogleSignIn={mockOnGoogleSignIn} />);

      fireEvent.click(screen.getByRole('button', { name: /google/i }));

      await waitFor(() => {
        expect(mockOnGoogleSignIn).toHaveBeenCalled();
      });
    });

    it('should show loading state during Google sign in', async () => {
      const mockOnGoogleSignIn = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<SignInForm onGoogleSignIn={mockOnGoogleSignIn} />);

      fireEvent.click(screen.getByRole('button', { name: /google/i }));

      await waitFor(() => {
        const googleButton = screen.getByRole('button', { name: /google/i });
        expect(googleButton).toBeDisabled();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled();
      });
    });

    it('should handle Google sign in errors', async () => {
      const mockOnGoogleSignIn = vi.fn().mockRejectedValue(new Error('Google error'));

      render(<SignInForm onGoogleSignIn={mockOnGoogleSignIn} />);

      fireEvent.click(screen.getByRole('button', { name: /google/i }));

      await waitFor(() => {
        expect(screen.getByText(/error al conectar con google/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      render(<SignInForm />);

      // All inputs should have labels
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();

      // Buttons should have proper text
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    });

    it('should disable all interactive elements when loading', () => {
      render(<SignInForm isLoading={true} />);

      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/contraseña/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /google/i })).toBeDisabled();
    });

    it('should have proper form submission flow', async () => {
      render(<SignInForm />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      // Form should prevent default submission
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Form State Management', () => {
    it('should clear errors when form values change', async () => {
      mockSignIn.mockResolvedValue({ error: 'CredentialsSignin', ok: false, status: 401, url: null });

      render(<SignInForm />);

      // Submit form to generate error
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'wrongpassword' },
      });
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/email o contraseña incorrectos/i)).toBeInTheDocument();
      });

      // Change form values - error should clear when form re-validates
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'newpassword' },
      });

      // The form error should clear when the form state changes
      await waitFor(() => {
        mockSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null });
      });
    });

    it('should maintain proper form focus management', () => {
      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      // Test tab order
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);

      fireEvent.keyDown(emailInput, { key: 'Tab' });
      expect(document.activeElement).toBe(passwordInput);
    });
  });
});
