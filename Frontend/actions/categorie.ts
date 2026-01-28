import api from "@/lib/axios";
import {
  Categorie,
  GetAllCategoriesResponse,
  GetCategorieByIdResponse,
  GetCategorieBySlugResponse,
  CategorieMutationResponse,
} from "@/types/user";


export const getAllCategories = async (): Promise<GetAllCategoriesResponse> => {
  try {
    const res = await api.get<GetAllCategoriesResponse>("/api/categories");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des catégories"
    );
  }
};

export const getCategorieById = async (
  id: number
): Promise<GetCategorieByIdResponse> => {
  try {
    const res = await api.get<GetCategorieByIdResponse>(
      `/api/categories/${id}`
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération de la catégorie"
    );
  }
};


export const getCategorieBySlug = async (
  slug: string
): Promise<GetCategorieBySlugResponse> => {
  try {
    const res = await api.get<GetCategorieBySlugResponse>(
      `/api/categories/slug/${slug}`
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération de la catégorie"
    );
  }
};


export const createCategorie = async (
  nomCategorie: string
): Promise<CategorieMutationResponse> => {
  try {
    const res = await api.post<CategorieMutationResponse>(
      "/api/categories/add",
      { nomCategorie }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la création de la catégorie"
    );
  }
};


export const updateCategorie = async (
  id: number,
  nomCategorie: string
): Promise<CategorieMutationResponse> => {
  try {
    const res = await api.patch<CategorieMutationResponse>(
      `/api/categories/update/${id}`,
      { nomCategorie }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour de la catégorie"
    );
  }
};


export const deleteCategorie = async (
  id: number
): Promise<{ message: string }> => {
  try {
    const res = await api.delete<{ message: string }>(
      `/api/categories/delete/${id}`
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression de la catégorie"
    );
  }
};
