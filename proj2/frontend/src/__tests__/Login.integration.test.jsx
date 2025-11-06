import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Login from "../pages/Login";
import { useAuth } from "../hooks/useAuth";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("Login Component - Integration Tests", () => {
  let mockLogin;

  beforeEach(() => {
    mockLogin = vi.fn();
    useAuth.mockReturnValue({ login: mockLogin, user: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("navigates to home if user is already logged in", async () => {
    useAuth.mockReturnValueOnce({ login: mockLogin, user: { username: "arnav" } });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  });

  it("handles login success and redirects", async () => {
    mockLogin.mockResolvedValueOnce({ username: "arnav" });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@ncsu.edu" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user@ncsu.edu", "secret123");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows appropriate error and does not navigate on failure", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad@ncsu.edu" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
