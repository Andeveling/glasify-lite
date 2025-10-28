import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignInPage from "@/app/(auth)/signin/page";

// Mock next-auth
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

// Mock server auth
vi.mock("@/server/auth", () => ({
  auth: vi.fn(),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const mockSignIn = vi.mocked(await import("next-auth/react")).signIn;
const mockAuth = vi.mocked(await import("@/server/auth")).auth;
const mockRedirect = vi.mocked(await import("next/navigation")).redirect;

describe("Authentication Integration Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("SignIn Page Integration", () => {
    it("should render complete signin page when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const SignInPageWrapper = async () => await SignInPage();
      render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
        expect(screen.getByText(/ingresa a tu cuenta/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /iniciar sesión/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /google/i })
        ).toBeInTheDocument();
      });
    });

    it("should redirect to dashboard when user is already authenticated", async () => {
      mockAuth.mockResolvedValue({
        expires: "2024-12-31",
        user: { email: "test@example.com", id: "1", name: "Test User" },
      });

      await SignInPage();

      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("Complete Authentication Flow", () => {
    it("should handle successful credentials login flow", async () => {
      mockAuth.mockResolvedValue(null);
      mockSignIn.mockResolvedValue({
        error: null,
        ok: true,
        status: 200,
        url: "/dashboard",
      });

      const SignInPageWrapper = async () => await SignInPage();
      render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "admin@glasify.com" },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: "admin123" },
      });

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith("credentials", {
          email: "admin@glasify.com",
          password: "admin123",
          redirect: false,
        });
      });
    });

    it("should handle failed credentials login with error display", async () => {
      mockAuth.mockResolvedValue(null);
      mockSignIn.mockResolvedValue({
        error: "CredentialsSignin",
        ok: false,
        status: 401,
        url: null,
      });

      const SignInPageWrapper = async () => await SignInPage();
      render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill in invalid credentials
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "wrong@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: "wrongpassword" },
      });

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/email o contraseña incorrectos/i)
        ).toBeInTheDocument();
      });

      // Form should still be functional after error
      expect(screen.getByLabelText(/email/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/contraseña/i)).not.toBeDisabled();
      expect(
        screen.getByRole("button", { name: /iniciar sesión/i })
      ).not.toBeDisabled();
    });

    it("should handle Google OAuth flow", async () => {
      mockAuth.mockResolvedValue(null);
      mockSignIn.mockResolvedValue({
        error: null,
        ok: true,
        status: 200,
        url: "/dashboard",
      });

      const SignInPageWrapper = async () => await SignInPage();
      render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /google/i })
        ).toBeInTheDocument();
      });

      // Click Google sign in
      fireEvent.click(screen.getByRole("button", { name: /google/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith("google", {
          callbackUrl: "/dashboard",
        });
      });
    });

    it("should handle network errors gracefully", async () => {
      mockAuth.mockResolvedValue(null);
      mockSignIn.mockRejectedValue(new Error("Network error"));

      const SignInPageWrapper = async () => await SignInPage();
      render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: "password123" },
      });

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/error al iniciar sesión/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation Integration", () => {
    it("should prevent submission with invalid data", async () => {
      mockAuth.mockResolvedValue(null);

      const SignInPageWrapper = async () => await SignInPage();
      render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /iniciar sesión/i })
        ).toBeInTheDocument();
      });

      // Try to submit empty form
      fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      await waitFor(() => {
        expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
        expect(
          screen.getByText(/la contraseña es requerida/i)
        ).toBeInTheDocument();
      });

      // signIn should not be called with invalid data
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("should validate email format before submission", async () => {
      mockAuth.mockResolvedValue(null);

      const SignInPageWrapper = async () => await SignInPage();
      render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Enter invalid email
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "invalid-email" },
      });
      fireEvent.blur(screen.getByLabelText(/email/i));

      await waitFor(() => {
        expect(
          screen.getByText(/ingresa un email válido/i)
        ).toBeInTheDocument();
      });

      // Fill password and try to submit
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      // Should not call signIn with invalid email
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("should validate password length before submission", async () => {
      mockAuth.mockResolvedValue(null);

      const SignInPageWrapper = async () => await SignInPage();
      render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
      });

      // Enter valid email but short password
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: "123" },
      });
      fireEvent.blur(screen.getByLabelText(/contraseña/i));

      await waitFor(() => {
        expect(
          screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)
        ).toBeInTheDocument();
      });

      // Try to submit
      fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      // Should not call signIn with short password
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe("Loading States Integration", () => {
    it("should show loading state during authentication", async () => {
      mockAuth.mockResolvedValue(null);

      // Mock slow signIn
      mockSignIn.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  error: null,
                  ok: true,
                  status: 200,
                  url: "/dashboard",
                }),
              100
            )
          )
      );

      const SignInPageWrapper = async () => await SignInPage();
      render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: "password123" },
      });

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      // Should show loading state
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /iniciar sesión/i })
        ).toBeDisabled();
        expect(screen.getByRole("button", { name: /google/i })).toBeDisabled();
        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByLabelText(/contraseña/i)).toBeDisabled();
      });
    });

    it("should show loading state for Google authentication", async () => {
      mockAuth.mockResolvedValue(null);

      // Mock slow Google signIn
      mockSignIn.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  error: null,
                  ok: true,
                  status: 200,
                  url: "/dashboard",
                }),
              100
            )
          )
      );

      const SignInPageWrapper = async () => await SignInPage();
      render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /google/i })
        ).toBeInTheDocument();
      });

      // Click Google button
      fireEvent.click(screen.getByRole("button", { name: /google/i }));

      // Should disable all form elements during Google auth
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /google/i })).toBeDisabled();
        expect(
          screen.getByRole("button", { name: /iniciar sesión/i })
        ).toBeDisabled();
      });
    });
  });

  describe("Security Integration", () => {
    it("should not expose sensitive information in DOM", async () => {
      mockAuth.mockResolvedValue(null);

      const SignInPageWrapper = async () => await SignInPage();
      const { container } = render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
      });

      // Password input should have type="password"
      const passwordInput = screen.getByLabelText(/contraseña/i);
      expect(passwordInput).toHaveAttribute("type", "password");

      // Check that password value is not visible in DOM when typed
      fireEvent.change(passwordInput, { target: { value: "secretpassword" } });

      // The actual password should not be visible as text in the DOM
      expect(container.innerHTML).not.toContain("secretpassword");
    });

    it("should handle authentication state properly", async () => {
      // Test user is authenticated scenario
      mockAuth.mockResolvedValue({
        expires: "2024-12-31",
        user: { email: "test@example.com", id: "1", name: "Test User" },
      });

      await SignInPage();

      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
      expect(mockRedirect).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility Integration", () => {
    it("should maintain focus management during form interactions", async () => {
      mockAuth.mockResolvedValue(null);

      const SignInPageWrapper = async () => await SignInPage();
      render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      // Focus email field
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);

      // Tab to password field
      fireEvent.keyDown(emailInput, { key: "Tab" });
      expect(document.activeElement).toBe(passwordInput);
    });

    it("should have proper ARIA attributes and labels", async () => {
      mockAuth.mockResolvedValue(null);

      const SignInPageWrapper = async () => await SignInPage();
      render(<SignInPageWrapper />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Check form accessibility
      expect(
        screen.getByRole("heading", { name: /iniciar sesión/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /iniciar sesión/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /google/i })
      ).toBeInTheDocument();
    });
  });
});
