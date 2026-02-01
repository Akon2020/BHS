import api from "@/lib/axios";
import {
  Newsletter,
  GetAllNewslettersResponse,
  NewsletterMutationResponse,
  NewsletterStatsResponse,
} from "@/types/user";

export const getAllNewsletters = async (params?: {
  page?: number;
  limit?: number;
  statut?: string;
}): Promise<GetAllNewslettersResponse> => {
  try {
    const res = await api.get<GetAllNewslettersResponse>(
      "/api/newsletters",
      { params }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des newsletters"
    );
  }
};

export const getSingleNewsletter = async (
  id: number
): Promise<Newsletter> => {
  try {
    const res = await api.get<Newsletter>(`/api/newsletters/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération de la newsletter"
    );
  }
};

export const getNewsletterStats = async (
  id: number
): Promise<NewsletterStatsResponse> => {
  try {
    const res = await api.get<NewsletterStatsResponse>(
      `/api/newsletters/${id}/stats`
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des statistiques"
    );
  }
};

export const createNewsletter = async (data: {
  titreInterne: string;
  objetMail: string;
  contenu: string;
  statut?: "brouillon" | "programme";
  dateProgrammee?: string;
}): Promise<NewsletterMutationResponse> => {
  try {
    const res = await api.post<NewsletterMutationResponse>(
      "/api/newsletters",
      data
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la création de la newsletter"
    );
  }
};

export const updateNewsletter = async (
  id: number,
  data: Partial<{
    titreInterne: string;
    objetMail: string;
    contenu: string;
    statut: "brouillon" | "programme";
    dateProgrammee: string;
  }>
): Promise<NewsletterMutationResponse> => {
  try {
    const res = await api.put<NewsletterMutationResponse>(
      `/api/newsletters/${id}`,
      data
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour de la newsletter"
    );
  }
};

export const sendNewsletter = async (
  id: number
): Promise<{ message: string }> => {
  try {
    const res = await api.post<{ message: string }>(
      `/api/newsletters/${id}/send`
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de l’envoi de la newsletter"
    );
  }
};

export const deleteNewsletter = async (
  id: number
): Promise<{ message: string }> => {
  try {
    const res = await api.delete<{ message: string }>(
      `/api/newsletters/${id}`
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression de la newsletter"
    );
  }
};
