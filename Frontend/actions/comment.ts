import api from "@/lib/axios";
import {
  Commentaire,
  CreateCommentairePayload,
  CreateCommentaireResponse,
  GetCommentairesParBlogResponse,
  ModererCommentairePayload,
} from "@/types/user";


export const getCommentairesParBlog = async (
  idBlog: number,
  includeAll?: boolean,
): Promise<GetCommentairesParBlogResponse> => {
  try {
    const params = includeAll ? { includeAll: true } : {};
    const res = await api.get<GetCommentairesParBlogResponse>(
      `/api/commentaires/blog/${idBlog}`,
      { params },
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des commentaires",
    );
  }
};


export const createCommentaire = async (
  payload: CreateCommentairePayload,
): Promise<CreateCommentaireResponse> => {
  try {
    const res = await api.post<CreateCommentaireResponse>(
      "/api/commentaires/add",
      payload,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la création du commentaire",
    );
  }
};


export const getReponses = async (
  idCommentaire: number,
): Promise<{ total: number; reponses: Commentaire[] }> => {
  try {
    const res = await api.get<{ total: number; reponses: Commentaire[] }>(
      `/api/commentaires/reponses/${idCommentaire}`,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des réponses",
    );
  }
};


export const modererCommentaire = async (
  idCommentaire: number,
  payload: ModererCommentairePayload,
): Promise<{ message: string; commentaire: Commentaire }> => {
  try {
    const res = await api.patch<{ message: string; commentaire: Commentaire }>(
      `/api/commentaires/moderate/${idCommentaire}`,
      payload,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la modération du commentaire",
    );
  }
};


export const deleteCommentaire = async (
  idCommentaire: number,
): Promise<{ message: string }> => {
  try {
    const res = await api.delete<{ message: string }>(
      `/api/commentaires/delete/${idCommentaire}`,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression du commentaire",
    );
  }
};
