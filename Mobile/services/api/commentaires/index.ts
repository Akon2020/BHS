import { api } from "../client";

export type CommentaireStatut = "attente" | "approuve" | "rejete" | "spam";

export interface CommentaireAdmin {
  idCommentaire: number;
  nomComplet: string;
  email?: string | null;
  contenu: string;
  statut: CommentaireStatut;
  dateCommentaire: string;
  blog?: { titre: string; slug: string } | null;
}

/** Tous les commentaires (staff) pour la modération. */
export const getAllCommentaires = async (): Promise<CommentaireAdmin[]> => {
  const res = await api.get<{ total: number; commentaires: CommentaireAdmin[] }>(
    "/api/commentaires",
  );
  return res.data.commentaires ?? [];
};

/** Modère un commentaire (approuve/rejete/spam). */
export const modererCommentaire = async (
  id: number,
  statut: CommentaireStatut,
): Promise<void> => {
  await api.patch(`/api/commentaires/moderate/${id}`, { statut });
};

/** Supprime un commentaire. */
export const deleteCommentaire = async (id: number): Promise<void> => {
  await api.delete(`/api/commentaires/delete/${id}`);
};

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
