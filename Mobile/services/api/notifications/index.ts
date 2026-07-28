import { mockApi } from "./mock";
import { realApi } from "./real";
import type { NotificationsApi } from "./types";

// Le module backend (§5.1) est désormais implémenté : réel par défaut.
// Bascule mock possible pour le dev hors-ligne : EXPO_PUBLIC_USE_MOCK_NOTIFICATIONS=true.
const useMock = process.env.EXPO_PUBLIC_USE_MOCK_NOTIFICATIONS === "true";

export const notificationsApi: NotificationsApi = useMock ? mockApi : realApi;
export const NOTIFICATIONS_MOCKED = useMock;

export const { getMesNotifications, marquerLue, marquerToutesLues } =
  notificationsApi;
export { getPreferences, updatePreference } from "./preferences";
