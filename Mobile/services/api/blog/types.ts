// Aligné sur le modèle Sequelize `blogs` (/info.md §3.1).

export interface AuteurBlog {
  nomComplet: string;
  avatar?: string | null;
}

export interface CommentaireBlog {
  idCommentaire: number;
  nomComplet: string;
  contenu: string;
  dateCommentaire: string;
  idCommentaireParent?: number | null;
  utilisateur?: { nomComplet: string; avatar?: string | null } | null;
}

export interface Blog {
  idBlog: number;
  titre: string;
  slug: string;
  extrait?: string | null;
  contenu: string;
  tags?: string | null;
  imageUne?: string | null;
  statut: "brouillon" | "publie";
  estimationLecture?: number | null;
  idCategorie?: number | null;
  createdAt: string;
  auteur?: AuteurBlog | null;
  commentaires?: CommentaireBlog[];
}

export interface GetBlogsResponse {
  nombre: number;
  page: number;
  totalPages: number;
  blogs: Blog[];
}

export interface GetBlogResponse {
  blog: Blog;
}
