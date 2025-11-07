import React from "react";
import { render, screen, act } from "@testing-library/react";
import AuthContext, { AuthProvider } from "../context/AuthContext";
import * as authServices from "../services/authServices";

vi.mock("../services/authServices");

describe("AuthContext", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it("initializes with saved auth", () => {
    const mockUser = { name: "Zed" };
    authServices.getSavedAuth.mockReturnValue({ user: mockUser });

    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {({ user }) => <div data-testid="user">{user?.name}</div>}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    expect(screen.getByTestId("user").textContent).toBe("Zed");
  });

  it("login updates user and returns data", async () => {
    const mockUser = { name: "Alice" };
    authServices.login.mockResolvedValue({ user: mockUser, token: "123" });

    let ctxValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(v) => {
            ctxValue = v;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      const res = await ctxValue.login({ username: "a@b.com", password: "x" });
      expect(res.user).toEqual(mockUser);
    });
    expect(ctxValue.user).toEqual(mockUser);
  });

  it("register updates user", async () => {
    const mockUser = { name: "Bob" };
    authServices.register.mockResolvedValue({ user: mockUser, token: "555" });

    let ctx;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(v) => {
            ctx = v;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await ctx.register({ username: "bob", password: "abc" });
    });

    expect(ctx.user).toEqual(mockUser);
  });

  it("logout clears user and calls service", async () => {
    const mockUser = { name: "Zed" };
    authServices.getSavedAuth.mockReturnValue({ user: mockUser });
    authServices.logout.mockImplementation(() => localStorage.removeItem("auth"));

    let ctx;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(v) => {
            ctx = v;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      ctx.logout();
    });

    expect(authServices.logout).toHaveBeenCalled();
    expect(ctx.user).toBeNull();
  });
});