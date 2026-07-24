import { api } from "../client";

export interface RechercheBlog {
  idBlog: number;
  titre: string;
  slug: string;
  extrait?: string | null;
}
export interface RechercheEvenement {
  idEvenement: number;
  titre: string;
  slug: string;
  dateEvenement?: string | null;
  lieu?: string | null;
}
export interface RechercheFichier {
  idFichier: number;
  nomReference: string;
  slug: string;
  description?: string | null;
}

export interface RechercheResponse {
  query: string;
  total: number;
  blogs: RechercheBlog[];
  evenements: RechercheEvenement[];
  fichiers: RechercheFichier[];
}

/** Recherche globale publique (blogs + événements + fichiers). */
export const getRecherche = async (q: string): Promise<RechercheResponse> => {
  const res = await api.get<RechercheResponse>("/api/recherche", {
    params: { q },
  });
  return res.data;
};
