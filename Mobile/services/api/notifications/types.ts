// Contrat prévu côté backend dans Mobile/project.md §5.1 (pas encore implémenté → mock).

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

export interface Notification {
  id: number;
  titre: string;
  corps: string;
  categorie: NotifCategorie;
  donnees?: Record<string, unknown> | null;
  lu: boolean;
  createdAt: string;
}

export interface NotificationsApi {
  getMesNotifications: () => Promise<Notification[]>;
  marquerLue: (id: number) => Promise<void>;
  marquerToutesLues: () => Promise<void>;
}
