import api from '@/lib/axios';
import { Equipe, GetAllEquipesResponse } from '@/types/user';

export const getAllEquipes = async (): Promise<GetAllEquipesResponse[]> => {
  try {
    const res = await api.get<GetAllEquipesResponse[]>('/api/equipes');
    console.log(res);
    return res.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    throw new Error(error.response?.data?.message || 'Erreur inconnue');
  }
};

export const getSingleEquipe = async (id: number): Promise<Equipe> => {
  try {
    const res = await api.get<Equipe>(`/api/equipes/${id}`);
    return res.data;
  } catch (error: any) {
    console.error(`Erreur lors de la récupération de l'utilisateur ${id} :`, error);
    throw new Error(error.response?.data?.message || 'Erreur inconnue');
  }
};

export const createEquipe = async (equipeData: {
  nomComplet: string;
  email: string;
  role: string;
  avatar?: File;
}): Promise<GetAllEquipesResponse> => {
  try {
    const formData = new FormData();
    formData.append("nomComplet", equipeData.nomComplet);
    formData.append("email", equipeData.email);
    formData.append("role", equipeData.role);
    if (equipeData.avatar) {
      formData.append("avatar", equipeData.avatar);
    }

    const res = await api.post<GetAllEquipesResponse>("/api/equipes/add", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error: any) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const updateEquipe = async (id: number, EquipeData: Partial<GetAllEquipesResponse>): Promise<GetAllEquipesResponse> => {
  try {
    const res = await api.patch<GetAllEquipesResponse>(`/api/equipes/update/${id}`, EquipeData);
    return res.data;
  } catch (error: any) {
    console.error(`Erreur lors de la mise à jour de l'utilisateur ${id} :`, error);
    throw new Error(error.response?.data?.message || 'Erreur inconnue');
  }
};

export const deleteEquipe = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.delete(`/api/equipes/delete/${id}`);
    return {
      success: true,
      message: `Utilisateur avec l’ID ${id} supprimé.`,
    };
  } catch (error: any) {
    console.error(`Erreur lors de la suppression de l'utilisateur ${id} :`, error);
    throw new Error(error.response?.data?.message || 'Erreur inconnue');
  }
};
