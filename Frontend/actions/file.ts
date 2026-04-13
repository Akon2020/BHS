import api from "@/lib/axios";
import type {
  FichierMutationResponse,
  GetAllFichiersResponse,
  GetSingleFichierResponse,
} from "@/types/user";

export const getAllFiles = async (params?: {
  search?: string;
  statut?: string;
  idCategorie?: number;
}): Promise<GetAllFichiersResponse> => {
  try {
    const res = await api.get<GetAllFichiersResponse>("/api/fichiers", {
      params,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des fichiers",
    );
  }
};

export const getSingleFile = async (
  id: number,
): Promise<GetSingleFichierResponse> => {
  try {
    const res = await api.get<GetSingleFichierResponse>(`/api/fichiers/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération du fichier",
    );
  }
};

export const createFileResource = async (
  formData: FormData,
): Promise<FichierMutationResponse> => {
  try {
    const res = await api.post<FichierMutationResponse>(
      "/api/fichiers/add",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de l'ajout des fichiers",
    );
  }
};

export const updateFileResource = async (
  id: number,
  formData: FormData,
): Promise<FichierMutationResponse> => {
  try {
    const res = await api.patch<FichierMutationResponse>(
      `/api/fichiers/update/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour des fichiers",
    );
  }
};

export const deleteFileResource = async (
  id: number,
): Promise<FichierMutationResponse> => {
  try {
    const res = await api.delete<FichierMutationResponse>(
      `/api/fichiers/delete/${id}`,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la suppression",
    );
  }
};

export const getPublicFiles = async (params?: {
  search?: string;
  idCategorie?: number;
}): Promise<GetAllFichiersResponse> => {
  try {
    const res = await api.get<GetAllFichiersResponse>("/api/fichiers/public", {
      params,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des fichiers publics",
    );
  }
};

export const getPublicFileBySlug = async (
  slug: string,
): Promise<GetSingleFichierResponse> => {
  try {
    const res = await api.get<GetSingleFichierResponse>(
      `/api/fichiers/slug/${slug}`,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération du fichier public",
    );
  }
};

export const getAdminFileDownloadUrl = (id: number, index: number) => {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return `${base}/api/fichiers/${id}/download/${index}`;
};

export const getPublicFileDownloadUrl = (slug: string, index: number) => {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return `${base}/api/fichiers/slug/${slug}/download/${index}`;
};
