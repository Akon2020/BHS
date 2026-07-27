import { api } from "../client";
import type { NotifCategorie, PreferenceNotification } from "./types";

/** Préférences de notification par catégorie (staff/membre). */
export const getPreferences = async (): Promise<PreferenceNotification[]> => {
  const res = await api.get<{ preferences: PreferenceNotification[] }>(
    "/api/notifications/preferences",
  );
  return res.data.preferences ?? [];
};

/** Active/désactive une catégorie. */
export const updatePreference = async (
  categorie: NotifCategorie,
  active: boolean,
): Promise<void> => {
  await api.patch("/api/notifications/preferences", { categorie, active });
};
