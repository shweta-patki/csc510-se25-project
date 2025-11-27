import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import Broadcast from "../pages/Broadcast";
import { createRun } from "../services/runsService";

vi.mock("../services/runsService", () => ({
  createRun: vi.fn(),
  getRunDescriptionSuggestion: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ user: { username: "bob" } }),
}));

describe("Broadcast Page Unit Tests (Extended)", () => {
  let alertSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("renders all restaurants from JSON", () => {
    render(<Broadcast />);
    const options = screen.getAllByRole("option");
    // At least one static + restaurants.json options
    expect(options.length).toBeGreaterThan(1);
  });

  it("shows error when restaurant and ETA are missing", async () => {
    render(<Broadcast />);
    fireEvent.click(screen.getByRole("button", { name: /broadcast/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Please fill out both the restaurant and ETA!")
      ).toBeInTheDocument();
    });

    expect(createRun).not.toHaveBeenCalled();
  });

  it("shows error when drop point is missing", async () => {
    render(<Broadcast />);
    fireEvent.change(screen.getByLabelText(/restaurant/i), {
      target: { value: "Port City Java EBII" },
    });
    fireEvent.change(screen.getByLabelText(/eta/i), { target: { value: "3 PM" } });
    fireEvent.click(screen.getByRole("button", { name: /broadcast/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Please provide a drop point!")
      ).toBeInTheDocument();
    });

    expect(createRun).not.toHaveBeenCalled();
  });

  it("disables the button and shows loading text during API call", async () => {
    createRun.mockResolvedValueOnce({});
    render(<Broadcast />);

    fireEvent.change(screen.getByLabelText(/restaurant/i), {
      target: { value: "Port City Java EBII" },
    });
    fireEvent.change(screen.getByLabelText(/drop point/i), {
      target: { value: "EBII Lobby" },
    });
    fireEvent.change(screen.getByLabelText(/eta/i), { target: { value: "3 PM" } });

    const button = screen.getByRole("button", { name: /broadcast/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button.textContent).toMatch(/broadcasting/i);

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
  });

  it("resets input fields after successful broadcast", async () => {
    createRun.mockResolvedValueOnce({});
    render(<Broadcast />);

    fireEvent.change(screen.getByLabelText(/restaurant/i), {
      target: { value: "Port City Java EBII" },
    });
    fireEvent.change(screen.getByLabelText(/drop point/i), {
      target: { value: "EBII Lobby" },
    });
    fireEvent.change(screen.getByLabelText(/eta/i), { target: { value: "3 PM" } });
    fireEvent.change(screen.getByLabelText(/max joiners/i), { target: { value: "4" } });

    fireEvent.click(screen.getByRole("button", { name: /broadcast/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/your-runs");
    });

    // Verify resets
    expect(screen.getByLabelText(/restaurant/i).value).toBe("");
    expect(screen.getByLabelText(/eta/i).value).toBe("");
    expect(screen.getByLabelText(/drop point/i).value).toBe("");
    expect(screen.getByLabelText(/max joiners/i).value).toBe("5");
  });
});
