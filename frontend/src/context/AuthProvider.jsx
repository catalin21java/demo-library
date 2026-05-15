import { useCallback, useEffect, useMemo, useState } from "react";

import { loginRequest, signupRequest } from "../api/authApi";
import {
  AUTH_UNAUTHORIZED_EVENT,
  getStoredAuth,
  setStoredAuth,
  setTokenGetter,
} from "../api/httpClient";
import { AuthContext } from "./auth";

function readInitialAuth() {
  const stored = getStoredAuth();
  if (stored?.token && stored?.user) {
    return { token: stored.token, user: stored.user };
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readInitialAuth);

  setTokenGetter(() => auth.token);

  const persistAuth = useCallback((nextToken, nextUser) => {
    setAuth({ token: nextToken, user: nextUser });
    if (nextToken && nextUser) {
      setStoredAuth({ token: nextToken, user: nextUser });
      return;
    }
    setStoredAuth(null);
  }, []);

  const logout = useCallback(() => {
    persistAuth(null, null);
  }, [persistAuth]);

  useEffect(() => {
    function handleUnauthorized() {
      logout();
    }
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback(
    async (credentials) => {
      const result = await loginRequest(credentials);
      persistAuth(result.token, result.user);
      return result;
    },
    [persistAuth],
  );

  const signup = useCallback(async (payload) => {
    const result = await signupRequest(payload);
    if (result.token && result.user) {
      persistAuth(result.token, result.user);
    }
    return result;
  }, [persistAuth]);

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      isHydrated: true,
      isAuthenticated: Boolean(auth.token && auth.user),
      isAdmin: auth.user?.role === "admin",
      login,
      signup,
      logout,
    }),
    [auth, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
