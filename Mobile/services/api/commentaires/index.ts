import { api } from "../client";

export interface CreateCommentairePayload {
  idBlog: number;
  nomComplet: string;
  email: string;
  contenu: string;
  idCommentaireParent?: number | null;
}

/**
 * Publie un commentaire (public). Passe par le statut `attente` (modération)
 * avant d'être visible. `siteWeb` est un honeypot anti-spam laissé vide.
 */
export const createCommentaire = async (
  payload: CreateCommentairePayload,
): Promise<string> => {
  const res = await api.post<{ message: string }>("/api/commentaires/add", {
    ...payload,
    siteWeb: "",
  });
  return res.data.message;
};
