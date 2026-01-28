export type UserRole = "admin" | "editeur" | "membre";
export type ContactStatut = "nouveau" | "lu" | "traite" | "archive";
export type AbonneStatut = "actif" | "inactif" | "desabonne";
export type BlogStatut = "publie" | "brouillon";

export interface User {
  idUtilisateur: number;
  nomComplet: string;
  email: string;
  role: UserRole;
  avatar?: string;
  derniereConnexion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  data: {
    token: string;
    userInfo: User;
  };
}

export interface GetAllUsersResponse {
  nombre: number;
  usersInfo: User[];
}


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

export interface GetAllContactsResponse {
  nombre: number;
  contactsInfo: Contact[];
}


export interface Abonne {
  idAbonne: number;
  nomComplet: string;
  email: string;
  statut: AbonneStatut;
  dateAbonnement: string;
  dateDesabonnement: string;
}

export interface GetAllAbonnesResponse {
  nombre: number;
  abonnesInfo: Abonne[];
}

export interface Equipe {
  idEquipe: number;
  nomComplet: string;
  fonction: string;
  biographie: string;
  photoProfil?: string;
  ordre: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllEquipesResponse {
  total: number;
  equipes: Equipe[];
}

export interface GetAllAuthResponse {
  message: string;
  data: Auth;
}

export interface Auth {
  token: string;
  userInfo: User;
  data: any;
}


export interface BlogAuteur {
  idUtilisateur?: number;
  nomComplet: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface BlogCategorie {
  idCategorie: number;
  nomCategorie: string;
  slug: string;
  createdAt: string;
}

export interface BlogCommentaire {
  idCommentaire?: number;
  contenu?: string;
  dateCommentaire?: string;
  utilisateur?: {
    nomComplet: string;
    avatar?: string;
  };
}

export interface Blog {
  idBlog: number;
  titre: string;
  slug: string;
  extrait?: string;
  contenu: string;
  tags?: string;
  imageUne: string;
  statut: BlogStatut;
  estimationLecture?: number;
  idAuteur: number;
  idCategorie: number;
  nombreVues?: number;
  createdAt: string;
  updatedAt: string;

  auteur: BlogAuteur;
  categorie: BlogCategorie;
  commentaires?: BlogCommentaire[];
}

export interface GetAllBlogsResponse {
  nombre: number;
  page: number;
  totalPages: number;
  blogs: Blog[];
}
export interface GetSingleBlogResponse {
  blog: Blog;
  commentaires: BlogCommentaire[];
}

export interface GetBlogBySlugResponse {
  blog: Blog;
  commentaires?: BlogCommentaire[];
}

export interface Categorie {
  idCategorie: number;
  nomCategorie: string;
  slug: string;
  createdAt: string;
}

export interface GetAllCategoriesResponse {
  total: number;
  categories: Categorie[];
}

export interface GetCategorieByIdResponse {
  categorie: Categorie;
}

export interface GetCategorieBySlugResponse {
  categorie: Categorie;
}

export interface CategorieMutationResponse {
  message: string;
  data: Categorie;
}
