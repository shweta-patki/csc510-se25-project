import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import * as AuthHook from "../hooks/useAuth";

// Mock useNavigate from react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(), // no-op mock
  };
});

// Mock useAuth hook
const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
  }),
}));

describe("AuthForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password inputs and submit button", () => {
    render(
      <MemoryRouter>
        <AuthForm isLogin />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("updates input fields on change", () => {
    render(
      <MemoryRouter>
        <AuthForm isLogin />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: "test@ncsu.edu" } });
    fireEvent.change(passwordInput, { target: { value: "mypassword" } });

    expect(emailInput.value).toBe("test@ncsu.edu");
    expect(passwordInput.value).toBe("mypassword");
  });

  it("calls login when isLogin is true", async () => {
    mockLogin.mockResolvedValueOnce({ user: { username: "testuser" } });

    render(
      <MemoryRouter>
        <AuthForm isLogin />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@ncsu.edu" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user@ncsu.edu", "password123");
    });
  });

  it("calls register when isLogin is false", async () => {
    mockRegister.mockResolvedValueOnce({ user: { username: "newuser" } });

    render(
      <MemoryRouter>
        <AuthForm isLogin={false} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "new@ncsu.edu" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "securepass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith("new@ncsu.edu", "securepass");
    });
  });

  it("displays error message on failed login", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(
      <MemoryRouter>
        <AuthForm isLogin />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "fail@ncsu.edu" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
