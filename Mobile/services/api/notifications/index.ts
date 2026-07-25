import { mockApi } from "./mock";
import { realApi } from "./real";
import type { NotificationsApi } from "./types";

// Seul module autorisé à être mocké (CLAUDE.md §2). Bascule par variable d'env :
// EXPO_PUBLIC_USE_MOCK_NOTIFICATIONS=false → implémentation réelle.
const useMock = process.env.EXPO_PUBLIC_USE_MOCK_NOTIFICATIONS !== "false";

export const notificationsApi: NotificationsApi = useMock ? mockApi : realApi;
export const NOTIFICATIONS_MOCKED = useMock;

export const { getMesNotifications, marquerLue, marquerToutesLues } =
  notificationsApi;
