"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type NotificationCounts = {
  likes: number;
  matches: number;
  messages: number;
};

type NotificationContextType = {
  counts: NotificationCounts;
  incrementLikes: () => void;
  incrementMatches: () => void;
  incrementMessages: () => void;
  resetLikes: () => void;
  resetMatches: () => void;
  resetMessages: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<NotificationCounts>({ likes: 0, matches: 0, messages: 0 });

  const incrementLikes = useCallback(() => setCounts((c) => ({ ...c, likes: c.likes + 1 })), []);
  const incrementMatches = useCallback(() => setCounts((c) => ({ ...c, matches: c.matches + 1 })), []);
  const incrementMessages = useCallback(() => setCounts((c) => ({ ...c, messages: c.messages + 1 })), []);
  const resetLikes = useCallback(() => setCounts((c) => ({ ...c, likes: 0 })), []);
  const resetMatches = useCallback(() => setCounts((c) => ({ ...c, matches: 0 })), []);
  const resetMessages = useCallback(() => setCounts((c) => ({ ...c, messages: 0 })), []);

  return (
    <NotificationContext.Provider value={{
      counts, incrementLikes, incrementMatches, incrementMessages,
      resetLikes, resetMatches, resetMessages,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      counts: { likes: 0, matches: 0, messages: 0 },
      incrementLikes: () => {}, incrementMatches: () => {}, incrementMessages: () => {},
      resetLikes: () => {}, resetMatches: () => {}, resetMessages: () => {},
    };
  }
  return ctx;
}
