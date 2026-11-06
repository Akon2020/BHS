import api from "@/lib/axios";
import { User, GetAllUsersResponse } from "@/types/user";

export const getAllUsers = async (): Promise<GetAllUsersResponse> => {
  try {
    const res = await api.get<GetAllUsersResponse>("/api/users");
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const getSingleUser = async (id: number): Promise<User> => {
  try {
    const res = await api.get<User>(`/api/users/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const createUser = async (userData: {
  nomComplet: string;
  email: string;
  role: string;
  avatar?: File;
}) => {
  try {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value) formData.append(key, value as any);
    });

    const res = await api.post("/api/users/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const updateUser = async (id: number, userData: FormData) => {
  try {
    // Multipart explicite : sinon axios convertit le FormData en JSON
    // (Content-Type par défaut de l'instance) et l'avatar est perdu.
    const res = await api.patch(`/api/users/update/${id}`, userData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const deleteUser = async (id: number) => {
  try {
    const res = await api.delete(`/api/users/delete/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const changePassword = async (
  id: number,
  oldPassword: string,
  newPassword: string,
  confirmNewPassword: string,
) => {
  try {
    const res = await api.patch(`/api/users/update/${id}/password`, {
      oldPassword,
      newPassword,
      confirmNewPassword,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};
