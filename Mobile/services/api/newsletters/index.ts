import { api } from "../client";

export type NewsletterStatut = "brouillon" | "envoye" | "programme";

export interface Newsletter {
  idNewsletter: number;
  titreInterne: string;
  objetMail: string;
  contenu: string;
  statut: NewsletterStatut;
  dateProgrammee?: string | null;
  dateEnvoi?: string | null;
  createdAt: string;
}

export interface NewsletterProgress {
  total: number;
  envoye: number;
  echec: number;
  attente: number;
  traite: number;
  pourcentage: number;
  statut: "termine" | "en_cours" | "inconnu";
}

/** Liste des newsletters (staff). */
export const getNewsletters = async (): Promise<Newsletter[]> => {
  const res = await api.get<{ total: number; data: Newsletter[] }>(
    "/api/newsletters",
    { params: { limit: 100 } },
  );
  return res.data.data ?? [];
};

/** Détail d'une newsletter. */
export const getNewsletter = async (id: number): Promise<Newsletter> => {
  const res = await api.get<Newsletter>(`/api/newsletters/${id}`);
  return res.data;
};

/** Crée une newsletter (auteur = utilisateur courant, côté serveur). */
export const createNewsletter = async (payload: {
  titreInterne: string;
  objetMail: string;
  contenu: string;
}): Promise<Newsletter> => {
  const res = await api.post<{ message: string; data: Newsletter }>(
    "/api/newsletters",
    payload,
  );
  return res.data.data;
};

/** Lance l'envoi (job d'arrière-plan, réponse immédiate). */
export const sendNewsletter = async (
  id: number,
): Promise<{ message: string; total?: number }> => {
  const res = await api.post<{ message: string; total?: number }>(
    `/api/newsletters/${id}/send`,
  );
  return res.data;
};

/** Progression d'envoi (polling). */
export const getNewsletterProgress = async (
  id: number,
): Promise<NewsletterProgress> => {
  const res = await api.get<NewsletterProgress>(
    `/api/newsletters/${id}/progress`,
  );
  return res.data;
};

/** Suppression d'une newsletter (admin/éditeur). */
export const deleteNewsletter = async (id: number): Promise<void> => {
  await api.delete(`/api/newsletters/${id}`);
};
