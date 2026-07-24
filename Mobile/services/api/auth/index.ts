import { api } from "../client";
import type {
  AuthResult,
  LoginPayload,
  ProfileResponse,
  Utilisateur,
} from "./types";

export interface InscriptionPayload {
  nomComplet: string;
  email: string;
  password: string;
}

/** Source de vérité du rôle courant — à revalider à chaque lancement. */
export const getProfile = async (): Promise<Utilisateur> => {
  const res = await api.get<ProfileResponse>("/api/auth/profile");
  return res.data.user;
};

/** Connexion — renvoie le token (corps) + le profil. */
export const login = async (payload: LoginPayload): Promise<AuthResult> => {
  const res = await api.post<AuthResult>("/api/auth/login", payload);
  return { token: res.data.token, user: res.data.user };
};

/** Inscription publique (compte membre) — renvoie le token + le profil. */
export const inscription = async (
  payload: InscriptionPayload,
): Promise<AuthResult> => {
  const res = await api.post<AuthResult>("/api/auth/inscription", payload);
  return { token: res.data.token, user: res.data.user };
};

/** Demande de réinitialisation de mot de passe (email envoyé par le serveur). */
export const requestPasswordReset = async (email: string): Promise<string> => {
  const res = await api.post<{ message: string }>("/api/auth/reset-password", {
    email,
  });
  return res.data.message;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/api/auth/logout");
  } catch {
    /* ignore : la déconnexion locale prime */
  }
};

/** Suppression définitive de son propre compte. */
export const supprimerCompte = async (): Promise<void> => {
  await api.delete("/api/auth/compte");
};
