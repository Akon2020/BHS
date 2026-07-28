import { api } from "../client";

export type ContactStatut = "nouveau" | "lu" | "traite" | "archive";

export interface Contact {
  idContact: number;
  nomComplet: string;
  email: string;
  sujet: string;
  message: string;
  statut: ContactStatut;
  repondu: boolean;
  createdAt: string;
}

/** Boîte de réception des messages de contact (staff). */
export const getContacts = async (): Promise<Contact[]> => {
  const res = await api.get<{ nombre: number; contactsInfo: Contact[] }>(
    "/api/contacts",
  );
  return res.data.contactsInfo ?? [];
};

/** Détail d'un contact. */
export const getContact = async (id: number): Promise<Contact> => {
  const res = await api.get<{ contactInfo: Contact }>(`/api/contacts/${id}`);
  return res.data.contactInfo;
};

/** Répondre à un contact (email envoyé + enregistré). */
export const replyContact = async (
  id: number,
  payload: { sujetReponse: string; messageReponse: string },
): Promise<string> => {
  const res = await api.post<{ message: string }>(
    `/api/contacts/repondre/${id}`,
    payload,
  );
  return res.data.message;
};

/** Boîte d'envoi : composer et envoyer un message (admin/éditeur). */
export const sendMessage = async (payload: {
  destinataireEmail: string;
  destinataireNom?: string;
  sujet: string;
  message: string;
}): Promise<string> => {
  const res = await api.post<{ message: string }>("/api/messages", payload);
  return res.data.message;
};
