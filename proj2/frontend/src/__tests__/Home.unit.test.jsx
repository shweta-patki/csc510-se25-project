import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../pages/Home";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import {
  listAvailableRuns,
  listJoinedRuns,
  joinRun,
  unjoinRun
} from "../services/runsService";

vi.mock("../hooks/useAuth");
vi.mock("../context/ToastContext");
vi.mock("../services/runsService");
vi.mock("../components/Menu", () => ({
  default: ({ restaurant, onClose, onConfirm }) => (
    <div data-testid="menu">
      <p>Menu for {restaurant}</p>
      <button onClick={() => onConfirm([{ name: "Burger", price: 10, qty: 1 }])}>Confirm</button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

describe("Home Page Unit Tests", () => {
  const mockShowToast = vi.fn();
  const mockUser = { username: "john" };

  beforeEach(() => {
    vi.resetAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    useToast.mockReturnValue({ showToast: mockShowToast });
  });

  test("renders available and joined runs correctly", async () => {
    listAvailableRuns.mockResolvedValue([
      { id: 1, restaurant: "Cafe", runner_username: "alice" }
    ]);
    listJoinedRuns.mockResolvedValue([
      { id: 2, restaurant: "Diner", runner_username: "bob", eta: "12:00", seats_remaining: 3 }
    ]);

    render(<Home />);

    expect(await screen.findByText("Available Runs")).toBeInTheDocument();
    expect(await screen.findByText("Joined Runs")).toBeInTheDocument();
    expect(await screen.findByText("Cafe")).toBeInTheDocument();
    expect(await screen.findByText("Diner")).toBeInTheDocument();
  });

  test("shows error if API fails", async () => {
    listAvailableRuns.mockRejectedValueOnce(new Error("Network error"));
    listJoinedRuns.mockResolvedValue([]);

    render(<Home />);
    expect(await screen.findByText(/failed to load runs/i)).toBeInTheDocument();
  });

  test("opens and closes the menu when joining a run", async () => {
    listAvailableRuns.mockResolvedValue([
      { id: 1, restaurant: "Cafe", runner_username: "alice" }
    ]);
    listJoinedRuns.mockResolvedValue([]);

    render(<Home />);

    const joinButton = await screen.findByText("Cafe");
    fireEvent.click(joinButton);

    expect(await screen.findByTestId("menu")).toBeInTheDocument();

    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByTestId("menu")).not.toBeInTheDocument();
    });
  });

  test("calls joinRun on confirm order", async () => {
    listAvailableRuns.mockResolvedValue([
      { id: 1, restaurant: "Cafe", runner_username: "alice" }
    ]);
    listJoinedRuns.mockResolvedValue([]);
    joinRun.mockResolvedValue({ pin: "1234" });

    render(<Home />);

    fireEvent.click(await screen.findByText("Cafe"));
    fireEvent.click(await screen.findByText("Confirm"));

    await waitFor(() => expect(joinRun).toHaveBeenCalledWith(1, expect.any(Object)));
    expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining("pickup PIN"), expect.any(Object));
  });

  test("prevents joining own run", async () => {
    listAvailableRuns.mockResolvedValue([
      { id: 1, restaurant: "Cafe", runner_username: "john" }
    ]);
    listJoinedRuns.mockResolvedValue([]);

    render(<Home />);
    const joinButton = await screen.findByText("Cafe");
    fireEvent.click(joinButton);

    expect(mockShowToast).toHaveBeenCalledWith("You cannot join your own run.", { type: "warning" });
  });

  test("unjoins a joined run", async () => {
    listAvailableRuns.mockResolvedValue([]);
    listJoinedRuns.mockResolvedValue([
      {
        id: 1,
        restaurant: "Diner",
        runner_username: "bob",
        eta: "12:00",
        seats_remaining: 3,
        my_order: { pin: "5678" }
      }
    ]);
    unjoinRun.mockResolvedValue();

    render(<Home />);
    const unjoinButton = await screen.findByText("Unjoin");
    fireEvent.click(unjoinButton);
    await waitFor(() => expect(unjoinRun).toHaveBeenCalledWith(1));
  });
});
