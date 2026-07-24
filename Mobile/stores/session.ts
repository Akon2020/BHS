import { create } from "zustand";
import { getToken, setToken, clearToken } from "@/services/api/session";
import { setUnauthorizedHandler } from "@/services/api/client";
import {
  getProfile,
  logout as apiLogout,
  supprimerCompte,
} from "@/services/api/auth";
import type { Utilisateur } from "@/services/api/auth/types";
import { hasAccessToPage, type UserRole } from "@/lib/permissions";
import { queryClient } from "@/lib/query-client";

type SessionStatus = "loading" | "authenticated" | "guest";

interface SessionState {
  status: SessionStatus;
  user: Utilisateur | null;
  /** Au démarrage : lit le token stocké et revalide le profil. */
  bootstrap: () => Promise<void>;
  /** Enregistre une session après login/inscription (token + profil). */
  setSession: (token: string, user: Utilisateur) => Promise<void>;
  /** Rafraîchit le profil (source de vérité du rôle). */
  refreshProfile: () => Promise<void>;
  /** Met à jour l'utilisateur local (après édition du profil). */
  setUser: (user: Utilisateur) => void;
  logout: () => Promise<void>;
  /** Supprime définitivement le compte puis purge la session. */
  deleteAccount: () => Promise<void>;
  /** Contrôle d'accès aligné sur la matrice web. */
  can: (path: string) => boolean;
}

// Purge complète de l'état local (token + cache serveur).
const purge = async () => {
  await clearToken();
  queryClient.clear();
};

export const useSession = create<SessionState>((set, get) => ({
  status: "loading",
  user: null,

  bootstrap: async () => {
    // Une expiration (401) détectée par le client déconnecte proprement.
    setUnauthorizedHandler(() => {
      void get().logout();
    });

    const token = await getToken();
    if (!token) {
      set({ status: "guest", user: null });
      return;
    }
    try {
      const user = await getProfile();
      set({ status: "authenticated", user });
    } catch {
      await clearToken();
      set({ status: "guest", user: null });
    }
  },

  setSession: async (token, user) => {
    await setToken(token);
    set({ status: "authenticated", user });
  },

  refreshProfile: async () => {
    try {
      const user = await getProfile();
      set({ status: "authenticated", user });
    } catch {
      /* la gestion 401 est faite par l'intercepteur */
    }
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    await apiLogout();
    await purge();
    set({ status: "guest", user: null });
  },

  deleteAccount: async () => {
    await supprimerCompte();
    await purge();
    set({ status: "guest", user: null });
  },

  can: (path) => {
    const user = get().user;
    if (!user) return false;
    return hasAccessToPage(user.role as UserRole, path);
  },
}));
