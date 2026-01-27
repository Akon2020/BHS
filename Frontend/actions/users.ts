import api from '@/lib/axios';
import { User, GetAllUsersResponse } from '@/types/user';

export const getAllUsers = async (): Promise<GetAllUsersResponse[]> => {
  try {
    const res = await api.get<GetAllUsersResponse[]>('/api/users');
    console.log(res);
    return res.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    throw new Error(error.response?.data?.message || 'Erreur inconnue');
  }
};

export const getSingleUser = async (id: number): Promise<User> => {
  try {
    const res = await api.get<User>(`/api/users/${id}`);
    return res.data;
  } catch (error: any) {
    console.error(`Erreur lors de la récupération de l'utilisateur ${id} :`, error);
    throw new Error(error.response?.data?.message || 'Erreur inconnue');
  }
};

export const createUser = async (userData: {
  nomComplet: string;
  email: string;
  role: string;
  avatar?: File;
}): Promise<GetAllUsersResponse> => {
  try {
    const formData = new FormData();
    formData.append("nomComplet", userData.nomComplet);
    formData.append("email", userData.email);
    formData.append("role", userData.role);
    if (userData.avatar) {
      formData.append("avatar", userData.avatar);
    }

    const res = await api.post<GetAllUsersResponse>("/api/users/add", formData, {
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

export const updateUser = async (id: number, userData: Partial<GetAllUsersResponse>): Promise<GetAllUsersResponse> => {
  try {
    const res = await api.patch<GetAllUsersResponse>(`/api/users/update/${id}`, userData);
    return res.data;
  } catch (error: any) {
    console.error(`Erreur lors de la mise à jour de l'utilisateur ${id} :`, error);
    throw new Error(error.response?.data?.message || 'Erreur inconnue');
  }
};

export const deleteUser = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.delete(`/api/users/delete/${id}`);
    return {
      success: true,
      message: `Utilisateur avec l’ID ${id} supprimé.`,
    };
  } catch (error: any) {
    console.error(`Erreur lors de la suppression de l'utilisateur ${id} :`, error);
    throw new Error(error.response?.data?.message || 'Erreur inconnue');
  }
};
