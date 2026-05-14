import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { RegisterForm } from "../RegisterForm";
import { useRegister } from "../../hooks/useRegister";

vi.mock("../../hooks/useRegister", () => ({
  useRegister: vi.fn(),
}));

const mockUseRegister = useRegister as Mock;

const defaultMockState = {
  firstName: "",
  setFirstName: vi.fn(),
  lastName: "",
  setLastName: vi.fn(),
  email: "",
  setEmail: vi.fn(),
  password: "",
  setPassword: vi.fn(),
  confirmPassword: "",
  setConfirmPassword: vi.fn(),
  country: "",
  setCountry: vi.fn(),
  description: "",
  setDescription: vi.fn(),
  image: "",
  setImage: vi.fn(),
  showPassword: false,
  setShowPassword: vi.fn(),
  showConfirmPassword: false,
  setShowConfirmPassword: vi.fn(),
  isLoading: false,
  error: null as string | null,
  setError: vi.fn(),
  fieldErrors: {} as Record<string, string>,
  togglePasswordVisibility: vi.fn(),
  toggleConfirmPasswordVisibility: vi.fn(),
  handleRegister: vi.fn(),
};

function renderRegisterForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>,
  );
}

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRegister.mockReturnValue(defaultMockState);
  });

  it("should render the form title and description", () => {
    renderRegisterForm();

    expect(
      screen.getByRole("heading", { name: /create account/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/fill in your details to get started/i),
    ).toBeInTheDocument();
  });

  it("should render all required fields (AC6)", () => {
    renderRegisterForm();

    // First Name
    const firstNameInput = screen.getByLabelText(/first name/i);
    expect(firstNameInput).toBeInTheDocument();
    expect(firstNameInput).toHaveAttribute("type", "text");
    expect(firstNameInput).toHaveAttribute("required");

    // Last Name
    const lastNameInput = screen.getByLabelText(/last name/i);
    expect(lastNameInput).toBeInTheDocument();
    expect(lastNameInput).toHaveAttribute("type", "text");
    expect(lastNameInput).toHaveAttribute("required");

    // Email
    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("required");

    // Password
    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("required");

    // Confirm Password
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("required");

    // Country (select)
    const countrySelect = screen.getByLabelText(/country/i);
    expect(countrySelect).toBeInTheDocument();
    expect(countrySelect.tagName).toBe("SELECT");
    expect(countrySelect).toHaveAttribute("required");
  });

  it("should render optional fields (AC6)", () => {
    renderRegisterForm();

    // Description (textarea)
    const descriptionInput = screen.getByLabelText(/description/i);
    expect(descriptionInput).toBeInTheDocument();
    expect(descriptionInput.tagName).toBe("TEXTAREA");
    expect(descriptionInput).not.toHaveAttribute("required");

    // Image URL
    const imageInput = screen.getByLabelText(/image url/i);
    expect(imageInput).toBeInTheDocument();
    expect(imageInput).toHaveAttribute("type", "url");
    expect(imageInput).not.toHaveAttribute("required");
  });

  it("should render country dropdown with placeholder option", () => {
    renderRegisterForm();

    const countrySelect = screen.getByLabelText(
      /country/i,
    ) as HTMLSelectElement;
    const firstOption = countrySelect.options[0];
    expect(firstOption.value).toBe("");
    expect(firstOption).toBeDisabled();
    expect(firstOption.text).toBe("Select your country");
  });

  it("should render submit button", () => {
    renderRegisterForm();

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute("type", "submit");
    expect(submitButton).not.toBeDisabled();
  });

  it("should show loading state on submit button (AC6 edge cases)", () => {
    mockUseRegister.mockReturnValue({ ...defaultMockState, isLoading: true });

    renderRegisterForm();

    const submitButton = screen.getByRole("button", {
      name: /creating account/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it("should render error alert when error is set", () => {
    const errorMessage = "Email is already in use";
    mockUseRegister.mockReturnValue({
      ...defaultMockState,
      error: errorMessage,
    });

    renderRegisterForm();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should call setError(null) when close button is clicked on error alert", async () => {
    const setError = vi.fn();
    mockUseRegister.mockReturnValue({
      ...defaultMockState,
      error: "Some error",
      setError,
    });

    renderRegisterForm();

    const errorAlert = screen.getByText("Some error").closest("div");
    const closeBtn = errorAlert?.querySelector("button");
    expect(closeBtn).toBeInTheDocument();

    if (closeBtn) {
      await userEvent.click(closeBtn);
      expect(setError).toHaveBeenCalledWith(null);
    }
  });

  it("should render field errors below inputs (AC5)", () => {
    mockUseRegister.mockReturnValue({
      ...defaultMockState,
      fieldErrors: {
        email: "Email is already registered",
        password: "Password must be at least 6 characters",
      },
    });

    renderRegisterForm();

    expect(screen.getByText("Email is already registered")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 6 characters"),
    ).toBeInTheDocument();
  });

  it("should render Google and Facebook sign up buttons", () => {
    renderRegisterForm();

    expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /facebook/i }),
    ).toBeInTheDocument();
  });

  it("should render a link to login page", () => {
    renderRegisterForm();

    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute("href", "/auth/login");
  });

  it("should call handleRegister on form submit", () => {
    const handleRegister = vi.fn();
    mockUseRegister.mockReturnValue({ ...defaultMockState, handleRegister });

    renderRegisterForm();

    const form = screen
      .getByRole("button", { name: /create account/i })
      .closest("form")!;
    fireEvent.submit(form);

    expect(handleRegister).toHaveBeenCalledTimes(1);
  });

  it("should have consistent styling wrapper with bg-card and border-border (AC11)", () => {
    const { container } = render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>,
    );

    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("bg-card");
    expect(outerDiv.className).toContain("border-border");
    expect(outerDiv.className).toContain("max-w-md");
  });
});
