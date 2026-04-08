import api from "@/lib/axios";
import {
  CreateIdentityResponse,
  DeleteIdentityResponse,
  GetAllIdentityResponse,
  GetIdentityByIdResponse,
  IdentityFormPayload,
  UpdateIdentityResponse,
} from "@/types/user";

export const getAllIdentity = async (): Promise<GetAllIdentityResponse> => {
  try {
    const res = await api.get<GetAllIdentityResponse>("/api/identites");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des identités",
    );
  }
};

export const getIdentityById = async (
  id: number,
): Promise<GetIdentityByIdResponse> => {
  try {
    const res = await api.get<GetIdentityByIdResponse>(`/api/identites/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération de cette identité",
    );
  }
};

export const createIdentity = async (
  payload: IdentityFormPayload,
): Promise<CreateIdentityResponse> => {
  try {
    const res = await api.post<CreateIdentityResponse>(
      "/api/identites/add",
      payload,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la soumission de l'identité",
    );
  }
};

export const updateIdentity = async (
  id: number,
  payload: Partial<IdentityFormPayload>,
): Promise<UpdateIdentityResponse> => {
  try {
    const res = await api.patch<UpdateIdentityResponse>(
      `/api/identites/update/${id}`,
      payload,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour de l'identité",
    );
  }
};

export const approveIdentity = async (
  id: number,
): Promise<UpdateIdentityResponse> => {
  try {
    const res = await api.patch<UpdateIdentityResponse>(
      `/api/identites/approuver/${id}`,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de l'approbation de l'identité",
    );
  }
};

export const deleteIdentity = async (
  id: number,
): Promise<DeleteIdentityResponse> => {
  try {
    const res = await api.delete<DeleteIdentityResponse>(
      `/api/identites/delete/${id}`,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression de l'identité",
    );
  }
};
