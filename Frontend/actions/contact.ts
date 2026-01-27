import api from '@/lib/axios'
import type { Contact, GetAllContactsResponse } from '@/types/user'

export const getAllContacts = async (): Promise<GetAllContactsResponse> => {
  try {
    const res = await api.get<GetAllContactsResponse>('/api/contacts')
    return res.data
  } catch (error: any) {
    console.error('Erreur lors du chargement des contacts :', error)
    throw new Error(error.response?.data?.message || 'Erreur inconnue')
  }
}

export const getContactById = async (id: number): Promise<Contact> => {
  try {
    const res = await api.get<{ contactInfo: Contact }>(`/api/contacts/${id}`)
    return res.data.contactInfo
  } catch (error: any) {
    console.error(`Erreur lors du chargement du contact ${id} :`, error)
    throw new Error(error.response?.data?.message || 'Erreur inconnue')
  }
}

export const getContactsByEmail = async (email: string): Promise<GetAllContactsResponse> => {
  try {
    const res = await api.get<GetAllContactsResponse>(`/api/contacts/search/email/${email}`)
    return res.data
  } catch (error: any) {
    console.error(`Erreur lors du chargement des contacts de ${email} :`, error)
    throw new Error(error.response?.data?.message || 'Erreur inconnue')
  }
}

export interface CreateContactPayload {
  nomComplet: string;
  email: string;
  sujet: string;
  message: string;
}

export const createContact = async (data: CreateContactPayload): Promise<void> => {
  try {
    await api.post('/api/contacts/add', data);
  } catch (error: any) {
    console.error("Erreur lors de l'envoi du message :", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const replyToContact = async (id: number, payload: { sujetReponse: string; messageReponse: string }): Promise<Contact> => {
  try {
    const res = await api.post<{ data: Contact }>(`/api/contacts/repondre/${id}`, payload)
    return res.data.data
  } catch (error: any) {
    console.error(`Erreur lors de la réponse au contact ${id} :`, error)
    throw new Error(error.response?.data?.message || 'Erreur inconnue')
  }
}

export const deleteContact = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(`/api/contacts/${id}`)
    return res.data.message
  } catch (error: any) {
    console.error(`Erreur lors de la suppression du contact ${id} :`, error)
    throw new Error(error.response?.data?.message || 'Erreur inconnue')
  }
}
