import axios, { AxiosError, type AxiosInstance } from "axios";
import { getToken, clearToken } from "./session";

/**
 * Instance HTTP unique de l'app. baseURL = EXPO_PUBLIC_API_URL (fallback prod).
 * Auth mobile = Bearer (le web utilise un cookie httpOnly ; React Native gère mal
 * les cookies → on s'appuie sur le fallback Authorization déjà supporté par le
 * backend). Voir Mobile/project.md §3.2.
 *
 * RÈGLE : aucun appel HTTP hors de services/api/ — les modules importent `api`.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://api.burningheartihs.org";

// Callback branché par le store de session pour réagir à une expiration (401).
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// Attache le token Bearer à chaque requête.
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sur 401 : purge le token et notifie le store (déconnexion propre).
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/** Extrait un message d'erreur lisible (FR) d'une erreur axios. */
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Une erreur est survenue. Réessayez.",
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.code === "ECONNABORTED") return "Délai dépassé. Vérifiez votre connexion.";
    if (!error.response) return "Impossible de joindre le serveur.";
  }
  return fallback;
};
