import { renderHook, act } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import useAuth from "../hooks/useAuth";
import * as authServices from "../services/authServices";

vi.mock("../services/authServices");

test("login → logout flow clears user", async () => {
  const mockUser = { name: "Test User" };
  // Fake login and logout service calls
  authServices.login.mockResolvedValue({ user: mockUser, token: "123" });
  authServices.logout.mockImplementation(() => localStorage.removeItem("auth"));

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  // Simulate login
  await act(async () => {
    await result.current.login("test@ncsu.edu", "pass");
  });
  expect(result.current.user).toEqual(mockUser);

  // Simulate logout
  act(() => result.current.logout());
  expect(result.current.user).toBeNull();
});