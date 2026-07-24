import { api } from "../client";
import type { Utilisateur } from "../auth/types";

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
