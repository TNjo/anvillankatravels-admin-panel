"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase-client";
import type { AdminRole } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  adminRole: AdminRole | null;
  adminLoading: boolean;
  getToken: () => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  adminRole: null,
  adminLoading: true,
  getToken: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);

  const fetchAdminRole = useCallback(async (firebaseUser: User) => {
    try {
      setAdminLoading(true);
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminRole({
          isSuperAdmin: data.isSuperAdmin,
          permissions: data.permissions,
        });
      } else {
        setAdminRole({ isSuperAdmin: false, permissions: [] });
      }
    } catch {
      setAdminRole({ isSuperAdmin: false, permissions: [] });
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    const clientAuth = getClientAuth();
    if (!clientAuth) {
      setLoading(false);
      setAdminLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(clientAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        fetchAdminRole(firebaseUser);
      } else {
        setAdminRole(null);
        setAdminLoading(false);
      }
    });
    return unsubscribe;
  }, [fetchAdminRole]);

  const getToken = async () => {
    if (!user) return null;
    return user.getIdToken();
  };

  const logout = async () => {
    const clientAuth = getClientAuth();
    if (clientAuth) {
      await signOut(clientAuth);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, adminRole, adminLoading, getToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
