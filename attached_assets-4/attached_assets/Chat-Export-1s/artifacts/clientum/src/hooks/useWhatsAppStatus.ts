import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type WaStatus = "disconnected" | "qr_pending" | "connected";

interface SessionData {
  status: WaStatus;
  phone: string | null;
}

const POLL_INTERVAL_MS = 30_000;

export function useWhatsAppStatus() {
  const { token } = useAuth();
  const [status, setStatus] = useState<WaStatus>("disconnected");
  const [phone, setPhone] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/whatsapp/session", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: SessionData = await res.json();
        setStatus(data.status);
        setPhone(data.phone);
      }
    } catch {
      // Network error — keep previous status
    }
  };

  useEffect(() => {
    if (!token) return;
    void fetchStatus();
    intervalRef.current = setInterval(() => void fetchStatus(), POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token]);

  return { status, phone };
}
