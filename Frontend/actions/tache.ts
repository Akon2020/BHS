import api from "@/lib/axios";
import type {
  Tache,
  TacheCommentaire,
  CreateTacheBody,
  GetTachesResponse,
  GetTacheResponse,
  StatutTache,
} from "@/types/user";

export const getTaches = async (params?: {
  statut?: StatutTache;
  assigne?: "me";
}): Promise<GetTachesResponse> => {
  const res = await api.get<GetTachesResponse>("/api/taches", { params });
  return res.data;
};

export const getTache = async (id: number): Promise<Tache> => {
  const res = await api.get<GetTacheResponse>(`/api/taches/${id}`);
  return res.data.tache;
};

export const createTache = async (payload: CreateTacheBody): Promise<Tache> => {
  try {
    const res = await api.post<{ message: string; data: Tache }>(
      "/api/taches",
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la création de la tâche",
    );
  }
};

export const updateTache = async (
  id: number,
  payload: Partial<CreateTacheBody>,
): Promise<Tache> => {
  try {
    const res = await api.put<{ message: string; data: Tache }>(
      `/api/taches/${id}`,
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour de la tâche",
    );
  }
};

export const deleteTache = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(`/api/taches/${id}`);
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression de la tâche",
    );
  }
};

export const addTacheCommentaire = async (
  id: number,
  contenu: string,
): Promise<TacheCommentaire> => {
  try {
    const res = await api.post<{ message: string; data: TacheCommentaire }>(
      `/api/taches/${id}/commentaires`,
      { contenu },
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de l'ajout du commentaire",
    );
  }
};

export const deleteTacheCommentaire = async (
  id: number,
  commentaireId: number,
): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(
      `/api/taches/${id}/commentaires/${commentaireId}`,
    );
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression du commentaire",
    );
  }
};

export const declencherRappelsTaches = async (): Promise<string> => {
  try {
    const res = await api.post<{ message: string }>("/api/taches/rappels");
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de l'envoi des rappels",
    );
  }
};
