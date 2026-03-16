import api from "@/lib/axios";
import { Equipe, GetAllEquipesResponse } from "@/types/user";

export interface EquipeListResponse {
  total: number;
  equipes: Equipe[];
}

export interface EquipeMutationResponse {
  message: string;
  data: Equipe;
}

export interface CreateEquipePayload {
  nomComplet: string;
  fonction: string;
  biographie?: string;
  ordre?: number;
  actif?: boolean;
  photoProfil?: File;
}

export const getAllEquipes = async (): Promise<EquipeListResponse> => {
  try {
    const res = await api.get<EquipeListResponse>("/api/equipes");
    return res.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de la récupération des membres de l'équipe :",
      error,
    );
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const getSingleEquipe = async (id: number): Promise<Equipe> => {
  try {
    const res = await api.get<{ equipe: Equipe }>(`/api/equipes/${id}`);
    return res.data.equipe;
  } catch (error: any) {
    console.error(`Erreur lors de la récupération du membre ${id} :`, error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const createEquipe = async (
  equipeData: CreateEquipePayload,
): Promise<EquipeMutationResponse> => {
  try {
    const formData = new FormData();
    formData.append("nomComplet", equipeData.nomComplet);
    formData.append("fonction", equipeData.fonction);
    if (equipeData.biographie) {
      formData.append("biographie", equipeData.biographie);
    }
    if (
      typeof equipeData.ordre === "number" &&
      !Number.isNaN(equipeData.ordre)
    ) {
      formData.append("ordre", String(equipeData.ordre));
    }
    if (typeof equipeData.actif === "boolean") {
      formData.append("actif", String(equipeData.actif));
    }
    if (equipeData.photoProfil) {
      formData.append("photoProfil", equipeData.photoProfil);
    }

    const res = await api.post<EquipeMutationResponse>(
      "/api/equipes/add",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return res.data;
  } catch (error: any) {
    console.error("Erreur lors de la création du membre :", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const updateEquipe = async (
  id: number,
  equipeData: Partial<CreateEquipePayload>,
): Promise<EquipeMutationResponse> => {
  try {
    const formData = new FormData();

    if (equipeData.nomComplet !== undefined) {
      formData.append("nomComplet", equipeData.nomComplet);
    }
    if (equipeData.fonction !== undefined) {
      formData.append("fonction", equipeData.fonction);
    }
    if (equipeData.biographie !== undefined) {
      formData.append("biographie", equipeData.biographie);
    }
    if (equipeData.ordre !== undefined) {
      formData.append("ordre", String(equipeData.ordre));
    }
    if (equipeData.actif !== undefined) {
      formData.append("actif", String(equipeData.actif));
    }
    if (equipeData.photoProfil) {
      formData.append("photoProfil", equipeData.photoProfil);
    }

    const res = await api.patch<EquipeMutationResponse>(
      `/api/equipes/update/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  } catch (error: any) {
    console.error(`Erreur lors de la mise à jour du membre ${id} :`, error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const deleteEquipe = async (
  id: number,
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.delete<{ message: string }>(
      `/api/equipes/delete/${id}`,
    );
    return {
      success: true,
      message: res.data.message,
    };
  } catch (error: any) {
    console.error(`Erreur lors de la suppression du membre ${id} :`, error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};
