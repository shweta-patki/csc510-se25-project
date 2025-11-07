import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../hooks/useAuth";
import AuthContext from "../context/AuthContext";

describe("useAuth", () => {
  it("returns safe defaults when context not found", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("handles login, register, and logout with context", async () => {
    const mockCtx = {
      user: { name: "Zed" },
      login: vi.fn().mockResolvedValue({ user: { name: "Alice" } }),
      register: vi.fn().mockResolvedValue({ user: { name: "Bob" } }),
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={mockCtx}>{children}</AuthContext.Provider>
      ),
    });

    await act(async () => {
      await result.current.login("a@b.com", "pass");
      await result.current.register("a@b.com", "pass");
      result.current.logout();
    });

    expect(mockCtx.login).toHaveBeenCalled();
    expect(mockCtx.register).toHaveBeenCalled();
    expect(mockCtx.logout).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
  });
});