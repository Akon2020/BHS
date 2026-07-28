import { api, API_BASE_URL } from "../client";

export interface FichierItem {
  nomOriginal?: string;
  nomStocke?: string;
  taille?: number;
}

export type FichierStatut = "brouillon" | "publie" | "programme" | "archive";

// Aligné sur le modèle Sequelize `fichiers` (/info.md §3.1).
export interface Fichier {
  idFichier: number;
  nomReference: string;
  slug: string;
  description: string;
  statut?: FichierStatut;
  modeAcces: "lecture" | "telechargement";
  fichiers: FichierItem[];
  nombreFichiers: number;
  tailleTotale?: number | string | null;
  datePublication?: string | null;
  categorie?: { idCategorie?: number; nomCategorie: string; slug: string } | null;
}

interface FichiersResponse {
  nombre: number;
  fichiers: Fichier[];
}
interface FichierResponse {
  fichier: Fichier;
}

/** Ressources publiques (fichiers publiés). */
export const getPublicFiles = async (): Promise<Fichier[]> => {
  const res = await api.get<FichiersResponse>("/api/fichiers/public");
  return res.data.fichiers ?? [];
};

/** Détail d'une ressource par slug (public). */
export const getPublicFileBySlug = async (slug: string): Promise<Fichier> => {
  const res = await api.get<FichierResponse>(`/api/fichiers/slug/${slug}`);
  return res.data.fichier;
};

/** URL de téléchargement/lecture d'un fichier d'une ressource, par index. */
export const fileDownloadUrl = (slug: string, index: number): string =>
  `${API_BASE_URL}/api/fichiers/slug/${slug}/download/${index}`;

/* ------------------------------- Admin ------------------------------- */

/** Toutes les ressources (staff), filtrables. */
export const getAllFichiers = async (params?: {
  search?: string;
  statut?: FichierStatut;
  idCategorie?: number;
}): Promise<Fichier[]> => {
  const res = await api.get<FichiersResponse>("/api/fichiers", { params });
  return res.data.fichiers ?? [];
};

/** Création d'une ressource avec fichiers joints (multipart). */
export const createFichierResource = async (
  formData: FormData,
): Promise<void> => {
  await api.post("/api/fichiers/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** Mise à jour d'une ressource (métadonnées + éventuels nouveaux fichiers). */
export const updateFichierResource = async (
  id: number,
  formData: FormData,
): Promise<void> => {
  await api.patch(`/api/fichiers/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** Suppression d'une ressource (admin/éditeur). */
export const deleteFichierResource = async (id: number): Promise<void> => {
  await api.delete(`/api/fichiers/delete/${id}`);
};
