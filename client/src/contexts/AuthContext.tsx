/*
 * RELIVO — Mock auth session (Eco-Tech Glasshouse)
 * Client-side demo session stored in localStorage: { role, name, email, loggedIn }
 * Mirrors the JWT role-based access described in the project handoff, so the
 * real FastAPI backend can drop in later with zero UI changes.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Role, User } from "@/lib/mockData";
import { DEMO_USERS } from "@/lib/mockData";

interface AuthContextType {
  user: User | null;
  login: (role: Role, name?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

const STORAGE_KEY = "reusenet_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((role: Role, name?: string) => {
    const base = DEMO_USERS[role];
    setUser({ ...base, ...(name ? { name } : {}) } as User);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  // Dev-mode devtools hook: call window.__devAutoLogin(role) to sign in instantly in dev.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    (window as unknown as Record<string, unknown>).__devAutoLogin = (role: string) => login(role as Role);
    return () => {
      delete (window as unknown as Record<string, unknown>).__devAutoLogin;
    };
  }, [login]);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
