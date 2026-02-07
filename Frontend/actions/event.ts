import api from "@/lib/axios";
import {
  Evenement,
  GetAllEventsResponse,
  GetSingleEventResponse,
  GetSingleEventAdminResponse,
  CreateEvenementResponse,
  UpdateEvenementResponse,
  DeleteEvenementResponse,
  InscriptionEvenementResponse,
  InscriptionEvenementBody,
} from "@/types/user";


export const getAllEvents = async (params?: {
  page?: number;
  limit?: number;
}): Promise<GetAllEventsResponse> => {
  try {
    const res = await api.get<GetAllEventsResponse>("/api/evenements", {
      params,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des événements"
    );
  }
};

export const getSingleEvent = async (
  id: number
): Promise<GetSingleEventResponse> => {
  try {
    const res = await api.get<GetSingleEventResponse>(`/api/evenements/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération de l'événement"
    );
  }
};

export const getEventBySlug = async (
  slug: string
): Promise<GetSingleEventResponse> => {
  try {
    const res = await api.get<GetSingleEventResponse>(
      `/api/evenements/slug/${slug}`
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération de l'événement"
    );
  }
};


export const getAllEventsAdmin = async (params?: {
  page?: number;
  limit?: number;
  statut?: string;
  q?: string;
  startDate?: string;
  endDate?: string;
}): Promise<GetAllEventsResponse> => {
  try {
    const res = await api.get<GetAllEventsResponse>("/api/evenements/admin", {
      params,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des événements (admin)"
    );
  }
};

export const getSingleEventAdmin = async (
  id: number
): Promise<GetSingleEventAdminResponse> => {
  try {
    const res = await api.get<GetSingleEventAdminResponse>(
      `/api/evenements/admin/${id}`
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération de l'événement (admin)"
    );
  }
};


export const createEvent = async (
  data:
    | FormData
    | {
        titre: string;
        description: string;
        dateEvenement: string;
        heureDebut: string;
        heureFin: string;
        lieu: string;
        nombrePlaces?: number;
        statut?: string;
        imageEvenement?: File;
      }
): Promise<CreateEvenementResponse> => {
  try {
    let formData: FormData;

    if (data instanceof FormData) {
      formData = data;

      const titre = formData.get("titre") as string;
      const description = formData.get("description") as string;
      const dateEvenement = formData.get("dateEvenement") as string;
      const heureDebut = formData.get("heureDebut") as string;
      const heureFin = formData.get("heureFin") as string;
      const lieu = formData.get("lieu") as string;

      if (!titre || !description || !dateEvenement || !heureDebut || !heureFin || !lieu) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }
    } else {
      formData = new FormData();
      const {
        titre,
        description,
        dateEvenement,
        heureDebut,
        heureFin,
        lieu,
        nombrePlaces,
        statut,
        imageEvenement,
      } = data;

      formData.append("titre", titre);
      formData.append("description", description);
      formData.append("dateEvenement", dateEvenement);
      formData.append("heureDebut", heureDebut);
      formData.append("heureFin", heureFin);
      formData.append("lieu", lieu);

      if (nombrePlaces !== undefined)
        formData.append("nombrePlaces", nombrePlaces.toString());
      if (statut) formData.append("statut", statut);
      if (imageEvenement) formData.append("imageEvenement", imageEvenement);
    }

    const res = await api.post<CreateEvenementResponse>(
      "/api/evenements/add",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la création de l'événement"
    );
  }
};


export const updateEvent = async (
  id: number,
  data: Partial<{
    titre: string;
    slug: string;
    description: string;
    dateEvenement: string;
    heureDebut: string;
    heureFin: string;
    lieu: string;
    nombrePlaces: number;
    statut: string;
    imageEvenement: File;
  }>
): Promise<UpdateEvenementResponse> => {
  try {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value as any);
      }
    });

    const res = await api.patch<UpdateEvenementResponse>(
      `/api/evenements/update/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour de l'événement"
    );
  }
};


export const deleteEvent = async (id: number): Promise<DeleteEvenementResponse> => {
  try {
    const res = await api.delete<DeleteEvenementResponse>(
      `/api/evenements/delete/${id}`
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression de l'événement"
    );
  }
};


export const inscrireAUnEvenement = async (
  id: number,
  data?: InscriptionEvenementBody
): Promise<InscriptionEvenementResponse> => {
  try {
    const res = await api.post<InscriptionEvenementResponse>(
      `/api/evenements/${id}/inscription`,
      data || {}
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de l'inscription à l'événement"
    );
  }
};

export const registerToEvent = async (
  slug: string,
  data?: InscriptionEvenementBody
): Promise<InscriptionEvenementResponse> => {
  try {
    const res = await api.post<InscriptionEvenementResponse>(
      `/api/evenements/slug/${slug}/inscription`,
      data || {}
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de l'inscription à l'événement"
    );
  }
};
