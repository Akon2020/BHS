import api from "@/lib/axios";
import type {
  Galerie,
  GetGaleriesPublicResponse,
  GetGaleriesResponse,
  PhotoGalerie,
} from "@/types/user";

// Public : albums publiés, du plus récent au plus ancien.
export const getGaleriesPublic = async (params?: {
  page?: number;
  limit?: number;
}): Promise<GetGaleriesPublicResponse> => {
  try {
    const res = await api.get<GetGaleriesPublicResponse>(
      "/api/galeries/public",
      { params },
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des galeries",
    );
  }
};

export const getGalerieBySlug = async (slug: string): Promise<Galerie> => {
  try {
    const res = await api.get<{ galerie: Galerie }>(
      `/api/galeries/public/${encodeURIComponent(slug)}`,
    );
    return res.data.galerie;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Galerie introuvable",
    );
  }
};

// Admin.
export const getGaleries = async (): Promise<GetGaleriesResponse> => {
  try {
    const res = await api.get<GetGaleriesResponse>("/api/galeries");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des galeries",
    );
  }
};

export const getGalerieById = async (id: number): Promise<Galerie> => {
  try {
    const res = await api.get<{ galerie: Galerie }>(`/api/galeries/${id}`);
    return res.data.galerie;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Galerie introuvable",
    );
  }
};

export const createGalerie = async (data: FormData): Promise<Galerie> => {
  try {
    const res = await api.post<{ message: string; data: Galerie }>(
      "/api/galeries",
      data,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la création de la galerie",
    );
  }
};

export const updateGalerie = async (
  id: number,
  data: FormData,
): Promise<Galerie> => {
  try {
    const res = await api.put<{ message: string; data: Galerie }>(
      `/api/galeries/${id}`,
      data,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour de la galerie",
    );
  }
};

export const deleteGalerie = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(`/api/galeries/${id}`);
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression de la galerie",
    );
  }
};

export const updatePhotoGalerie = async (
  idGalerie: number,
  idPhoto: number,
  payload: { legende?: string; ordre?: number },
): Promise<PhotoGalerie> => {
  try {
    const res = await api.put<{ message: string; data: PhotoGalerie }>(
      `/api/galeries/${idGalerie}/photos/${idPhoto}`,
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour de la photo",
    );
  }
};

export const deletePhotoGalerie = async (
  idGalerie: number,
  idPhoto: number,
): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(
      `/api/galeries/${idGalerie}/photos/${idPhoto}`,
    );
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression de la photo",
    );
  }
};
