// Contrat backend implémenté (Mobile/project.md §5.1 / Backend/routes/notification.route.js).

export type NotifCategorie =
  | "evenement"
  | "rendezvous"
  | "anniversaire"
  | "newsletter"
  | "correspondance"
  | "echo_priere"
  | "pensee_du_jour"
  | "meditation"
  | "systeme";

export const NOTIF_CATEGORIES: NotifCategorie[] = [
  "evenement",
  "rendezvous",
  "anniversaire",
  "newsletter",
  "correspondance",
  "echo_priere",
  "pensee_du_jour",
  "meditation",
  "systeme",
];

export interface Notification {
  idNotification: number;
  titre: string;
  corps: string;
  categorie: NotifCategorie;
  donnees?: Record<string, unknown> | null;
  lu: boolean;
  createdAt: string;
}

export interface PreferenceNotification {
  categorie: NotifCategorie;
  active: boolean;
}

export interface NotificationsApi {
  getMesNotifications: () => Promise<Notification[]>;
  marquerLue: (id: number) => Promise<void>;
  marquerToutesLues: () => Promise<void>;
}
