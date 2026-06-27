import api from "@/lib/axios";
import type {
  EnvoyerMessagePayload,
  GetMessagesEnvoyesResponse,
  MessageEnvoye,
} from "@/types/user";

export const getMessagesEnvoyes =
  async (): Promise<GetMessagesEnvoyesResponse> => {
    try {
      const res = await api.get<GetMessagesEnvoyesResponse>("/api/messages");
      return res.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la récupération des messages envoyés",
      );
    }
  };

export const getMessageEnvoye = async (
  id: number,
): Promise<MessageEnvoye> => {
  try {
    const res = await api.get<{ message: MessageEnvoye }>(
      `/api/messages/${id}`,
    );
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération du message",
    );
  }
};

export const envoyerMessage = async (
  payload: EnvoyerMessagePayload,
): Promise<MessageEnvoye> => {
  try {
    const res = await api.post<{ message: string; data: MessageEnvoye }>(
      "/api/messages",
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de l'envoi du message",
    );
  }
};

export const deleteMessageEnvoye = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(`/api/messages/${id}`);
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression du message",
    );
  }
};
