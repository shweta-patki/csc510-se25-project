import * as authServices from "../services/authServices";

describe("authServices", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
  });

  it("register stores data and returns it", async () => {
    const mockData = { user: { name: "A" }, token: "123" };
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const res = await authServices.register({ username: "x", password: "y" });
    expect(res).toEqual(mockData);
    expect(localStorage.getItem("auth")).toContain("123");
  });

  it("login works and stores auth", async () => {
    const mockData = { user: { name: "B" }, token: "222" };
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const res = await authServices.login({ username: "x", password: "y" });
    expect(res.token).toBe("222");
    expect(localStorage.getItem("auth")).toContain("222");
  });

  it("logout clears local storage", () => {
    localStorage.setItem("auth", JSON.stringify({ token: "x" }));
    authServices.logout();
    expect(localStorage.getItem("auth")).toBeNull();
  });

  it("getSavedAuth returns parsed object", () => {
    const data = { token: "123" };
    localStorage.setItem("auth", JSON.stringify(data));
    expect(authServices.getSavedAuth()).toEqual(data);
  });

  it("fetchWithAuth throws error on missing token", async () => {
    await expect(authServices.getPoints()).rejects.toThrow("Not authenticated");
  });
});

describe("authServices - edge cases", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
  });

  it("throws an error if API returns 400 with JSON body", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Bad Request" }),
    });
    await expect(authServices.register({ username: "bad", password: "pw" }))
      .rejects.toThrow("Bad Request (400)");
  });

  it("handles malformed JSON responses gracefully", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("invalid json");
      },
    });
    await expect(authServices.login({ username: "x", password: "y" }))
      .rejects.toThrow("Request failed (500)");
  });

  it("fetchWithAuth includes token and returns parsed JSON", async () => {
    localStorage.setItem("auth", JSON.stringify({ token: "abc123" }));
    const mockRes = { points: 5 };
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockRes,
    });

    const result = await authServices.getPoints();
    expect(result).toEqual(mockRes);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/points"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer abc123",
        }),
      })
    );
  });

  it("fetchWithAuth throws detailed error if unauthorized", async () => {
    localStorage.setItem("auth", JSON.stringify({ token: "bad" }));
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Unauthorized" }),
    });
    await expect(authServices.getPoints()).rejects.toThrow("Unauthorized (401)");
  });
});
describe("authServices additional edge cases", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws if fetchWithAuth called without token", async () => {
    localStorage.clear();
    await expect(authServices.getPoints()).rejects.toThrow("Not authenticated");
  });

  it("handles unexpected non-JSON responses", async () => {
    localStorage.setItem("auth", JSON.stringify({ token: "t123" }));
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error("Parse error");
      },
    });
    await expect(authServices.redeemPoints()).rejects.toThrow("Request failed (502)");
  });

  it("handles unexpected network failure", async () => {
    localStorage.setItem("auth", JSON.stringify({ token: "x" }));
    global.fetch = vi.fn().mockRejectedValue(new Error("Network down"));
    await expect(authServices.getPoints()).rejects.toThrow("Network down");
  });
});