import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Register from "../pages/Register";

// ✅ Mock useAuth
vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// ✅ Mock AuthForm (to avoid internal logic noise)
vi.mock("../components/AuthForm", () => ({
  default: ({ onSubmit }) => (
    <form
      data-testid="auth-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ username: "testuser", password: "testpass" });
      }}
    >
      <button type="submit">Submit</button>
    </form>
  ),
}));

// ✅ Mock useNavigate globally here
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Register Page", () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    useAuth.mockReturnValue({ register: mockRegister });
  });

  it("renders Register page with form and link", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByTestId("auth-form")).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
  });

  it("calls register and navigates on success", async () => {
    mockRegister.mockResolvedValueOnce({ user: { username: "testuser" } });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.submit(screen.getByTestId("auth-form"));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith("testuser", "testpass");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows error message on failed registration", async () => {
    mockRegister.mockRejectedValueOnce(new Error("Registration failed"));

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.submit(screen.getByTestId("auth-form"));

    await waitFor(() => {
      expect(screen.getByText("Registration failed")).toBeInTheDocument();
    });
  });
});
