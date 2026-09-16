import { useCallback, useState } from "react";

const STORAGE_KEY = "bailanysta_session";

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [session, setSession] = useState(readStoredSession);

  const login = useCallback((token, user) => {
    const next = { token, user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const updateUser = useCallback((patch) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, user: { ...prev.user, ...patch } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  return {
    token: session?.token ?? null,
    user: session?.user ?? null,
    login,
    updateUser,
    logout,
  };
}
