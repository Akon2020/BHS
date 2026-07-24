import { api, API_BASE_URL } from "../client";

export interface FichierItem {
  nomOriginal?: string;
  nomStocke?: string;
  taille?: number;
}

// Aligné sur le modèle Sequelize `fichiers` (/info.md §3.1).
export interface Fichier {
  idFichier: number;
  nomReference: string;
  slug: string;
  description: string;
  modeAcces: "lecture" | "telechargement";
  fichiers: FichierItem[];
  nombreFichiers: number;
  tailleTotale?: number | string | null;
  categorie?: { nomCategorie: string; slug: string } | null;
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
