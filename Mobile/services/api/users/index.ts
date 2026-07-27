import { api } from "../client";
import type { Utilisateur } from "../auth/types";
import type { UserRole } from "@/lib/permissions";

/** Met à jour son profil (nom, avatar). Envoi multipart comme le web. */
export const updateProfil = async (
  id: number,
  data: { nomComplet?: string },
): Promise<Utilisateur> => {
  const form = new FormData();
  if (data.nomComplet !== undefined) form.append("nomComplet", data.nomComplet);
  const res = await api.patch<{ user?: Utilisateur } & Utilisateur>(
    `/api/users/update/${id}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return (res.data as { user?: Utilisateur }).user ?? (res.data as Utilisateur);
};

/* ---------------------------- Admin : comptes ---------------------------- */

/** Liste des comptes internes (staff). */
export const getUsers = async (): Promise<Utilisateur[]> => {
  const res = await api.get<{ nombre: number; usersInfo: Utilisateur[] }>(
    "/api/users",
  );
  return res.data.usersInfo ?? [];
};

/** Création d'un compte (admin) — mot de passe généré et envoyé par email côté serveur. */
export const createUser = async (payload: {
  nomComplet: string;
  email: string;
  role: UserRole;
}): Promise<void> => {
  const form = new FormData();
  form.append("nomComplet", payload.nomComplet);
  form.append("email", payload.email);
  form.append("role", payload.role);
  await api.post("/api/users/add", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** Mise à jour du rôle d'un compte (admin). */
export const updateUserRole = async (
  id: number,
  role: UserRole,
): Promise<void> => {
  const form = new FormData();
  form.append("role", role);
  await api.patch(`/api/users/update/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** Suppression d'un compte (admin). */
export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/api/users/delete/${id}`);
};

/** Change son mot de passe. */
export const changePassword = async (
  id: number,
  payload: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  },
): Promise<string> => {
  const res = await api.patch<{ message: string }>(
    `/api/users/update/${id}/password`,
    payload,
  );
  return res.data.message;
};
