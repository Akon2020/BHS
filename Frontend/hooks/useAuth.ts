"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { User } from "@/types/user";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Le cookie httpOnly est envoyé automatiquement (withCredentials).
        const res = await api.get("/api/auth/profile");
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      router.push("/connexion");
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    logout,
  };
};
