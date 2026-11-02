"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { User } from "@/types/user";

/** Événement à émettre après une modification du profil (nom, avatar). */
export const PROFIL_MIS_A_JOUR = "bhs:profil-mis-a-jour";

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
    window.addEventListener(PROFIL_MIS_A_JOUR, checkAuth);
    return () => window.removeEventListener(PROFIL_MIS_A_JOUR, checkAuth);
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
