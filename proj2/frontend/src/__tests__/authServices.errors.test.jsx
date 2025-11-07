import * as authServices from "../services/authServices";

describe("authServices error handling", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("throws error when fetchWithAuth is called without token", async () => {
    await expect(authServices.getPoints()).rejects.toThrow("Not authenticated");
  });

  it("handles bad JSON in fetch response", async () => {
    localStorage.setItem("auth", JSON.stringify({ token: "abc123" }));
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("invalid json");
      },
    });
    await expect(authServices.redeemPoints()).rejects.toThrow("Request failed (500)");
  });

  it("handles JSON with array of error messages", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        detail: [{ msg: "Invalid email" }, { msg: "Password too short" }],
      }),
    });
    await expect(
      authServices.register({ username: "x", password: "y" })
    ).rejects.toThrow("Invalid email; Password too short (422)");
  });

  it("handles unexpected network errors", async () => {
    localStorage.setItem("auth", JSON.stringify({ token: "abc123" }));
    global.fetch = vi.fn().mockRejectedValue(new Error("Network down"));
    await expect(authServices.getPoints()).rejects.toThrow("Network down");
  });
});
