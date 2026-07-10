import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface WaConversationAlert {
  phone: string;
  contactName: string;
  lastMessage: string;
  lastMessageAt: string;
  needsHuman: boolean;
  unread: number;
}

const POLL_MS = 30_000;

export function useWhatsAppNotifications(onNewAlert?: (conv: WaConversationAlert) => void) {
  const { token } = useAuth();
  const [needsHumanCount, setNeedsHumanCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const seenPhonesRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  const poll = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/whatsapp/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const convs: WaConversationAlert[] = await res.json();

      const humanNeeded = convs.filter(c => c.needsHuman);
      const totalUnread = convs.reduce((s, c) => s + (c.unread ?? 0), 0);

      setNeedsHumanCount(humanNeeded.length);
      setUnreadCount(totalUnread);

      if (!initialLoadRef.current && onNewAlert) {
        for (const conv of humanNeeded) {
          if (!seenPhonesRef.current.has(conv.phone)) {
            onNewAlert(conv);
          }
        }
      }

      seenPhonesRef.current = new Set(humanNeeded.map(c => c.phone));
      initialLoadRef.current = false;
    } catch {
    }
  }, [token, onNewAlert]);

  useEffect(() => {
    void poll();
    const id = setInterval(() => void poll(), POLL_MS);
    return () => clearInterval(id);
  }, [poll]);

  return { needsHumanCount, unreadCount };
}
