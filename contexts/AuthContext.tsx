import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "user" | "gym" | "admin";

export interface AppUser {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  gymId?: string;
  visitCount: number;
  memberSince: string;
  avatarColor: string;
}

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  updateUser: (updates: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "@gympass_user";

const AVATAR_COLORS = ["#F97316", "#3B82F6", "#22C55E", "#A855F7", "#EC4899", "#14B8A6"];

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) setUser(JSON.parse(data));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const persistUser = async (u: AppUser | null) => {
    if (u) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (phone: string) => {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing) as AppUser;
      if (parsed.phone === phone) {
        setUser(parsed);
        return;
      }
    }
    const newUser: AppUser = {
      id: generateId(),
      phone,
      name: "Member",
      role: "user",
      visitCount: 0,
      memberSince: new Date().toISOString(),
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    };
    await persistUser(newUser);
    setUser(newUser);
  };

  const logout = async () => {
    await persistUser(null);
    setUser(null);
  };

  const switchRole = async (role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    await persistUser(updated);
    setUser(updated);
  };

  const updateUser = async (updates: Partial<AppUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    await persistUser(updated);
    setUser(updated);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      switchRole,
      updateUser,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
