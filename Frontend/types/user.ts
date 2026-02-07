export type UserRole = "admin" | "editeur" | "membre";
export type ContactStatut = "nouveau" | "lu" | "traite" | "archive";
export type AbonneStatut = "actif" | "inactif" | "desabonne";
export type BlogStatut = "publie" | "brouillon";
export type NewsletterStatut = "brouillon" | "programme" | "envoye";
export type NewsletterEnvoiStatut = "envoye" | "echec";
export type EvenementStatut = "brouillon" | "publie" | "annule" | "termine";
export type Sexe = "homme" | "femme";
export type TypeInscription = "utilisateur" | "visiteur";
export type StatutInscription = "confirme" | "en_attente" | "annule";

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

export interface NewsletterRedacteur {
  idUtilisateur: number;
  nomComplet: string;
  email: string;
}

export interface NewsletterAbonne {
  idNewsletterAbonne: number;
  idNewsletter: number;
  idAbonne: number;
  statut: NewsletterEnvoiStatut;
  dateEnvoi?: string;
  abonne: {
    idAbonne: number;
    nomComplet: string;
    email: string;
    statut: AbonneStatut;
    dateAbonnement: string;
    dateDesabonnement?: string | null;
  };
}

export interface Newsletter {
  idNewsletter: number;
  titreInterne: string;
  objetMail: string;
  contenu: string;
  statut: NewsletterStatut;
  dateProgrammee?: string | null;
  dateEnvoi?: string | null;
  writedBy: number;
  createdAt: string;
  updatedAt: string;

  redacteur: NewsletterRedacteur;
  envois?: NewsletterAbonne[];
}

export interface GetAllNewslettersResponse {
  total: number;
  page: number;
  pages: number;
  data: Newsletter[];
}

export type GetSingleNewsletterResponse = Newsletter;

export interface NewsletterStatsResponse {
  total: number;
  envoye: number;
  echec: number;
  tauxSucces: number | string;
}

export interface NewsletterMutationResponse {
  message: string;
  data: Newsletter;
}

export interface EvenementCreateur {
  idUtilisateur: number;
  nomComplet: string;
  email: string;
}

export interface InscriptionEvenement {
  idInscription: number;
  nomComplet: string;
  email: string;
  sexe: Sexe;
  telephone: string;
  statut: StatutInscription;
  typeInscription: TypeInscription;
  dateInscription: string;
  utilisateur: EvenementCreateur | null;
}

export interface Evenement {
  idEvenement: number;
  titre: string;
  slug: string;
  description: string;
  dateEvenement: string;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  nombrePlaces: number;
  nombreInscrits: number;
  imageEvenement: string;
  statut: EvenementStatut;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  createur: EvenementCreateur;
}

export interface GetAllEventsResponse {
  total: number;
  page: number;
  pageSize: number;
  events: Evenement[];
}

export interface GetSingleEventResponse {
  event: Evenement;
}

export interface EvenementAdmin extends Evenement {
  inscriptions: InscriptionEvenement[];
}

export interface GetSingleEventAdminResponse {
  event: EvenementAdmin;
}

export interface CreateEvenementBody {
  titre: string;
  description: string;
  dateEvenement: string;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  nombrePlaces?: number;
  statut?: EvenementStatut;
}

export interface CreateEvenementResponse {
  mailSend: string;
  message: string;
  data: Evenement;
}

export interface UpdateEvenementBody {
  titre?: string;
  slug?: string;
  description?: string;
  dateEvenement?: string;
  heureDebut?: string;
  heureFin?: string;
  lieu?: string;
  nombrePlaces?: number;
  statut?: EvenementStatut;
}

export interface UpdateEvenementResponse {
  message: string;
  data: Evenement;
}

export interface DeleteEvenementResponse {
  message: string;
}

export interface InscriptionEvenementBody {
  nomComplet?: string;
  email?: string;
  sexe?: Sexe;
  telephone?: string;
}

export interface InscriptionEvenementResponse {
  message: string;
  inscription: InscriptionEvenement;
}
