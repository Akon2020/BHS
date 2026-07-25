import type { Notification, NotificationsApi } from "./types";

// Données de démonstration en mémoire — en attendant le module backend (§5.1).
let store: Notification[] = [
  {
    id: 1,
    titre: "Nouvelle méditation",
    corps: "Une méditation du jour vient d'être publiée.",
    categorie: "meditation",
    lu: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    titre: "Rendez-vous approuvé",
    corps: "Votre demande de rendez-vous a été confirmée.",
    categorie: "rendezvous",
    lu: false,
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 3,
    titre: "Nouvel événement",
    corps: "Un nouvel événement vient d'être ajouté au programme.",
    categorie: "evenement",
    lu: true,
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
];

const delay = () => new Promise((r) => setTimeout(r, 250));

export const mockApi: NotificationsApi = {
  getMesNotifications: async () => {
    await delay();
    return store.map((n) => ({ ...n }));
  },
  marquerLue: async (id) => {
    store = store.map((n) => (n.id === id ? { ...n, lu: true } : n));
  },
  marquerToutesLues: async () => {
    store = store.map((n) => ({ ...n, lu: true }));
  },
};
