import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Navbar from "../components/Navbar";
import { BrowserRouter } from "react-router-dom";

describe("Navbar component", () => {
  it("renders the site logo and links", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Example: check logo
    expect(screen.getByText(/home/i)).toBeInTheDocument();

    // Example: check a navigation link
    expect(screen.getByRole("link", { name: /broadcast/i })).toBeInTheDocument();
  });
});
