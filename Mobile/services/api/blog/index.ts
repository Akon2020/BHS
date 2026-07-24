import { api } from "../client";
import type { Blog, GetBlogResponse, GetBlogsResponse } from "./types";

/** Articles publiés d'une catégorie (public). */
export const getBlogsByCategorie = async (
  idCategorie: number,
  limit = 50,
): Promise<Blog[]> => {
  const res = await api.get<GetBlogsResponse>("/api/blogs", {
    params: { statut: "publie", categorie: idCategorie, limit },
  });
  return res.data.blogs ?? [];
};

/** Détail d'un article par slug (public) — inclut les commentaires approuvés. */
export const getBlogBySlug = async (slug: string): Promise<Blog> => {
  const res = await api.get<GetBlogResponse>(`/api/blogs/slug/${slug}`);
  return res.data.blog;
};
