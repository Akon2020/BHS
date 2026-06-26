import api from "@/lib/axios";
import { AuthResponse, User } from "@/types/user";

export interface AuthPayload {
  email: string;
  password: string;
}

export const login = async (payload: AuthPayload): Promise<User> => {
  try {
    const res = await api.post<AuthResponse>("/api/auth/login", payload);

    const { userInfo } = res.data.data;

    // Le token est posé par le backend dans un cookie httpOnly (non accessible au JS).
    // On ne conserve côté front que le profil (non sensible) pour l'affichage UI.
    localStorage.setItem("user", JSON.stringify(userInfo));

    return userInfo;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Erreur lors de la connexion";

    throw new Error(message);
  }
};

export const logout = async () => {
  try {
    await api.post("/api/auth/logout");
  } finally {
    // Le cookie httpOnly est effacé par le backend ; on nettoie le profil local.
    localStorage.removeItem("user");
  }
};

export const getProfile = async (): Promise<User> => {
  const res = await api.get("/api/auth/profile");
  return res.data.user;
};

/**
 * Request a password reset (send email with reset link)
 */
export const requestPasswordReset = async (
  email: string,
): Promise<{ message: string; dev?: { resetUrl?: string } }> => {
  try {
    const res = await api.post<{
      message: string;
      dev?: { resetUrl?: string };
    }>("/api/auth/reset-password", { email });
    return res.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      "Erreur lors de la demande de réinitialisation";
    throw new Error(message);
  }
};

/**
 * Reset password using token from email
 */
export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<{ message: string }> => {
  try {
    const res = await api.post<{ message: string }>(
      `/api/auth/resetpassword?token=${encodeURIComponent(token)}`,
      { newPassword },
    );
    return res.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      "Erreur lors de la mise à jour du mot de passe";
    throw new Error(message);
  }
};
