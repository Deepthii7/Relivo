import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiRequest, getAccessToken, saveAccessToken } from "@/lib/api";
import type { Role, User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: { name: string; email: string; password: string; organization: string; location?: string; role: Role }) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error("Authentication is unavailable"); },
  register: async () => { throw new Error("Authentication is unavailable"); },
  logout: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }
    apiRequest<{ user: User }>("/auth/me")
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((error: { status?: number }) => {
        if (error.status === 401) saveAccessToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<{ token: string; user: User }>("/auth/login", {
      method: "POST", body: JSON.stringify({ email, password }),
    });
    saveAccessToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (payload: { name: string; email: string; password: string; organization: string; location?: string; role: Role }) => {
    const result = await apiRequest<{ token: string; user: User }>("/auth/register", {
      method: "POST", body: JSON.stringify(payload),
    });
    saveAccessToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest<void>("/auth/logout", { method: "POST" });
    } finally {
      saveAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
