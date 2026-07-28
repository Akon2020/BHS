import { api } from "../client";

// Aligné sur le modèle Sequelize `categories` (/info.md §3.1).
export interface Categorie {
  idCategorie: number;
  nomCategorie: string;
  slug: string;
}

interface CategoriesResponse {
  total: number;
  categories: Categorie[];
}

/** Toutes les catégories (public). Sert à résoudre les slugs éditoriaux fixes. */
export const getCategories = async (): Promise<Categorie[]> => {
  const res = await api.get<CategoriesResponse>("/api/categories");
  return res.data.categories ?? [];
};

// Slugs fixes des 3 sections éditoriales (cf. project.md §6).
export const SECTION_SLUGS = {
  echos: "echos-de-priere",
  pensee: "pensee-du-jour",
  meditation: "meditation",
} as const;

export type SectionKey = keyof typeof SECTION_SLUGS;
