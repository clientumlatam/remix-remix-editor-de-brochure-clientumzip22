import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthTenant {
  id: number;
  name: string;
  slug: string;
  plan: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  tenant: AuthTenant | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: AuthUser, tenant: AuthTenant) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "clientum_auth";

function loadFromStorage(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null, tenant: null };
    return JSON.parse(raw);
  } catch {
    return { token: null, user: null, tenant: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = loadFromStorage();
    setAuthTokenGetter(() => stored.token);
    return stored;
  });

  useEffect(() => {
    setAuthTokenGetter(() => auth.token);
  }, [auth.token]);

  function login(token: string, user: AuthUser, tenant: AuthTenant) {
    const next = { token, user, tenant };
    setAuthTokenGetter(() => token);
    setAuth(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function logout() {
    setAuthTokenGetter(null);
    setAuth({ token: null, user: null, tenant: null });
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, isAuthenticated: !!auth.token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
