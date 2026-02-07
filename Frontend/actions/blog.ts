import api from "@/lib/axios";
import {
  Blog,
  GetAllBlogsResponse,
  GetSingleBlogResponse,
  GetBlogBySlugResponse,
} from "@/types/user";

export const getAllBlogs = async (params?: {
  page?: number;
  limit?: number;
  statut?: string;
  categorie?: number;
}): Promise<GetAllBlogsResponse> => {
  try {
    const res = await api.get<GetAllBlogsResponse>("/api/blogs", {
      params,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des blogs"
    );
  }
};

export const getSingleBlog = async (
  id: number
): Promise<GetSingleBlogResponse> => {
  try {
    const res = await api.get<GetSingleBlogResponse>(`/api/blogs/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération du blog"
    );
  }
};

export const getBlogBySlug = async (
  slug: string
): Promise<GetBlogBySlugResponse> => {
  try {
    const res = await api.get<GetBlogBySlugResponse>(
      `/api/blogs/slug/${slug}`
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération du blog"
    );
  }
};

export const createBlog = async (
  data: FormData | {
    titre: string;
    contenu: string;
    extrait?: string;
    tags?: string;
    idCategorie: number;
    statut?: string;
    imageUne?: File;
  }
): Promise<{ message: string; blog: Blog }> => {
  try {
    let formData: FormData;

    if (data instanceof FormData) {
      formData = data;

      // Validation pour FormData
      const titre = formData.get("titre") as string;
      const contenu = formData.get("contenu") as string;
      const idCategorie = formData.get("idCategorie") as string;

      if (!titre || !contenu || !idCategorie) {
        throw new Error("Les champs titre, contenu et catégorie sont obligatoires");
      }
    } else {
      // Cas où data est un objet
      formData = new FormData();
      const { titre, contenu, extrait, tags, idCategorie, statut, imageUne } = data;

      formData.append("titre", titre);
      formData.append("contenu", contenu);

      if (extrait) formData.append("extrait", extrait);
      if (tags) formData.append("tags", tags);
      formData.append("idCategorie", idCategorie.toString());
      if (statut) formData.append("statut", statut);
      if (imageUne) formData.append("imageUne", imageUne);
    }

    const res = await api.post("/api/blogs/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la création du blog"
    );
  }
};

/* export const createBlog = async (data: {
  titre: string;
  contenu: string;
  extrait?: string;
  tags?: string;
  idCategorie: number;
  statut?: string;
  imageUne?: File;
}): Promise<{ message: string; blog: Blog }> => {
  try {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value as any);
      }
    });

    const res = await api.post("/api/blogs/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la création du blog"
    );
  }
}; */

export const updateBlog = async (
  id: number,
  data: Partial<{
    titre: string;
    slug: string;
    contenu: string;
    extrait: string;
    tags: string;
    statut: string;
    idCategorie: number;
    imageUne: File;
  }>
): Promise<{ message: string; blog: Blog }> => {
  try {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value as any);
      }
    });

    const res = await api.patch(`/api/blogs/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la mise à jour du blog"
    );
  }
};

export const deleteBlog = async (
  id: number
): Promise<{ message: string }> => {
  try {
    const res = await api.delete(`/api/blogs/delete/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la suppression du blog"
    );
  }
};
