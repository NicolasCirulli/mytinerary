import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { LoginForm } from "../LoginForm";
import { useLogin } from "../../hooks/useLogin";

vi.mock("../../hooks/useLogin", () => ({
  useLogin: vi.fn(),
}));

const mockUseLogin = useLogin as Mock;

const defaultMockState = {
  email: "",
  setEmail: vi.fn(),
  password: "",
  setPassword: vi.fn(),
  showPassword: false,
  rememberMe: false,
  isLoading: false,
  error: null as string | null,
  setError: vi.fn(),
  togglePasswordVisibility: vi.fn(),
  toggleRememberMe: vi.fn(),
  handleLogin: vi.fn(),
  handleGoogleLogin: vi.fn(),
  handleFacebookLogin: vi.fn(),
};

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLogin.mockReturnValue(defaultMockState);
  });

  it("should render the form title and description", () => {
    renderLoginForm();

    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/enter your details to access your account/i),
    ).toBeInTheDocument();
  });

  it("should render email input", () => {
    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("required");
  });

  it("should render password input", () => {
    renderLoginForm();

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("required");
  });

  it("should render remember me checkbox", () => {
    renderLoginForm();

    const checkbox = screen.getByLabelText(/remember me/i);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("type", "checkbox");
  });

  it("should render forgot password link", () => {
    renderLoginForm();

    const forgotLink = screen.getByRole("link", { name: /forgot password/i });
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });

  it("should render submit button with Sign in text", () => {
    renderLoginForm();

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute("type", "submit");
    expect(submitButton).not.toBeDisabled();
  });

  it("should show loading state on submit button", () => {
    mockUseLogin.mockReturnValue({ ...defaultMockState, isLoading: true });

    renderLoginForm();

    const submitButton = screen.getByRole("button", { name: /signing in/i });
    expect(submitButton).toBeDisabled();
  });

  it("should render error alert when error is set (AC2)", () => {
    const errorMessage = "Email or password is incorrect";
    mockUseLogin.mockReturnValue({ ...defaultMockState, error: errorMessage });

    renderLoginForm();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should call setError(null) when close button is clicked on error alert", async () => {
    const setError = vi.fn();
    mockUseLogin.mockReturnValue({
      ...defaultMockState,
      error: "Some error",
      setError,
    });

    renderLoginForm();

    // The close X button is inside the error alert div
    const errorAlert = screen.getByText("Some error").closest("div")!;
    const closeBtn = errorAlert.querySelector("button.text-red-500");
    expect(closeBtn).toBeInTheDocument();

    if (closeBtn) {
      await userEvent.click(closeBtn);
      expect(setError).toHaveBeenCalledWith(null);
    }
  });

  it("should render Google and Facebook login buttons", () => {
    renderLoginForm();

    expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /facebook/i }),
    ).toBeInTheDocument();
  });

  it("should call handleGoogleLogin on Google button click", async () => {
    const handleGoogleLogin = vi.fn();
    mockUseLogin.mockReturnValue({ ...defaultMockState, handleGoogleLogin });

    renderLoginForm();

    await userEvent.click(screen.getByRole("button", { name: /google/i }));
    expect(handleGoogleLogin).toHaveBeenCalledTimes(1);
  });

  it("should call handleFacebookLogin on Facebook button click", async () => {
    const handleFacebookLogin = vi.fn();
    mockUseLogin.mockReturnValue({ ...defaultMockState, handleFacebookLogin });

    renderLoginForm();

    await userEvent.click(screen.getByRole("button", { name: /facebook/i }));
    expect(handleFacebookLogin).toHaveBeenCalledTimes(1);
  });

  it("should render a link to register page (AC11 consistency)", () => {
    renderLoginForm();

    const signUpLink = screen.getByRole("link", { name: /sign up/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/auth/register");
  });

  it("should call handleLogin on form submit", () => {
    const handleLogin = vi.fn();
    mockUseLogin.mockReturnValue({ ...defaultMockState, handleLogin });

    renderLoginForm();

    const form = screen
      .getByRole("button", { name: /sign in/i })
      .closest("form")!;
    fireEvent.submit(form);

    expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  it("should have consistent styling wrapper with bg-card and border-border (AC11)", () => {
    const { container } = render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("bg-card");
    expect(outerDiv.className).toContain("border-border");
    expect(outerDiv.className).toContain("max-w-md");
  });
});
