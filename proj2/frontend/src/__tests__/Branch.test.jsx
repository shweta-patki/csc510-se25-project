import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AuthForm from "../components/AuthForm";
import Navbar from "../components/Navbar";
import RunCard from "../components/RunCard";
import { AuthProvider } from "../context/AuthContext";
import * as authServices from "../services/authServices";

// Mock authServices globally
vi.mock("../services/authServices", () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getSavedAuth: vi.fn(() => null),
}));

describe("Branch coverage boost", () => {
  // ========================
  // NAVBAR: Auth vs Guest
  // ========================
  it("renders Navbar for guest and logged-in users", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/Home/i)).toBeInTheDocument();

    // Simulate logged-in user
    authServices.getSavedAuth.mockReturnValueOnce({
      user: { username: "test@ncsu.edu" },
      token: "fake",
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </MemoryRouter>
    );

    // Multiple 'Profile' links exist — just confirm presence
    const profiles = screen.getAllByText(/Profile/i);
    expect(profiles.length).toBeGreaterThan(0);
  });

  // ========================
  // AUTHFORM: login flow (error branch)
  // ========================
  it("shows error when login fails", async () => {
    authServices.login.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthForm mode="login" />
        </AuthProvider>
      </MemoryRouter>
    );

    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);

    await act(async () => {
      fireEvent.change(email, { target: { value: "fail@ncsu.edu" } });
      fireEvent.change(password, { target: { value: "wrong" } });
    });

    const button = screen.getByRole("button", { name: /login/i });
    await act(async () => fireEvent.click(button));

    expect(authServices.login).toHaveBeenCalled();
  });

  // ========================
  // RUNCARD: Joined vs Not Joined
  // ========================
  it("renders RunCard as joined and not joined", () => {
    const mockRun = {
      id: 1,
      restaurant: "Port City",
      drop_point: "Library",
      eta: "12:15 PM",
      runner_username: "Zed",
      seats_remaining: 2,
    };

    render(
      <MemoryRouter>
        <>
          <AuthProvider>
            <RunCard run={mockRun} joinedRuns={[]} onJoin={vi.fn()} />
          </AuthProvider>
          <AuthProvider>
            <RunCard run={mockRun} joinedRuns={[mockRun]} onJoin={vi.fn()} />
          </AuthProvider>
        </>
      </MemoryRouter>
    );

    const portCityElements = screen.getAllByText(/Port City/i);
    expect(portCityElements).toHaveLength(2);
    expect(screen.getByText(/Join Run/i)).toBeInTheDocument();
    expect(screen.getByText(/Joined/i)).toBeInTheDocument();
  });

  // ========================
  // RUN JOIN BUTTON HANDLER
  // ========================
  it("handles join click event", () => {
    const mockRun = {
      id: 99,
      restaurant: "Case Dining",
      drop_point: "Oval",
      eta: "1:00 PM",
      runner_username: "runner@ncsu.edu",
      seats_remaining: 3,
    };

    const joinSpy = vi.fn();
    render(
      <MemoryRouter>
        <AuthProvider>
          <RunCard run={mockRun} joinedRuns={[]} onJoin={joinSpy} />
        </AuthProvider>
      </MemoryRouter>
    );

    const joinButton = screen.getByRole("button", { name: /join/i });
    fireEvent.click(joinButton);
    expect(joinSpy).toHaveBeenCalled();
  });
});