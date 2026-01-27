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
        const token = localStorage.getItem("loginToken");
        if (!token) throw new Error("No token");

        const res = await api.get("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data.user);
      } catch {
        localStorage.removeItem("loginToken");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    await api.post("/api/auth/logout");
    localStorage.clear();
    router.push("/connexion");
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    logout,
  };
};
