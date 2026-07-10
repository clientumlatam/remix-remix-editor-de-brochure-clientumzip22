import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

interface PortalContact {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
}

interface PortalContextType {
  contact: PortalContact | null;
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const PortalContext = createContext<PortalContextType>({
  contact: null,
  token: null,
  isAuthenticated: false,
  logout: () => {},
});

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("portalToken"));
  const [contact, setContact] = useState<PortalContact | null>(() => {
    const stored = localStorage.getItem("portalContact");
    return stored ? JSON.parse(stored) : null;
  });
  const [, setLocation] = useLocation();

  const logout = useCallback(() => {
    localStorage.removeItem("portalToken");
    localStorage.removeItem("portalContact");
    setToken(null);
    setContact(null);
    setLocation("/portal/login");
  }, [setLocation]);

  return (
    <PortalContext.Provider value={{ contact, token, isAuthenticated: !!token && !!contact, logout }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  return useContext(PortalContext);
}
