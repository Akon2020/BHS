import { api } from "../client";
import type { Notification, NotificationsApi } from "./types";

// Implémentation réelle (contrat project.md §5.1) — active dès que le backend existe.
export const realApi: NotificationsApi = {
  getMesNotifications: async () => {
    const res = await api.get<{ notifications: Notification[] }>(
      "/api/notifications/mes-notifications",
    );
    return res.data.notifications ?? [];
  },
  marquerLue: async (id) => {
    await api.patch(`/api/notifications/${id}/lue`);
  },
  marquerToutesLues: async () => {
    await api.patch("/api/notifications/lues-toutes");
  },
};
