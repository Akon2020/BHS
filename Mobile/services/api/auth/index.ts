import { api } from "../client";
import type { ProfileResponse, Utilisateur } from "./types";

/** Source de vérité du rôle courant — à revalider à chaque lancement. */
export const getProfile = async (): Promise<Utilisateur> => {
  const res = await api.get<ProfileResponse>("/api/auth/profile");
  return res.data.user;
};

export const logout = async (): Promise<void> => {
  // Best-effort : invalide la session côté serveur ; le token local est purgé
  // par le store quoi qu'il arrive.
  try {
    await api.post("/api/auth/logout");
  } catch {
    /* ignore : la déconnexion locale prime */
  }
};
