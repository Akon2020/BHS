export type UserRole = "admin" | "editeur" | "membre";

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

export type ContactStatut = "nouveau" | "lu" | "traite" | "archive";

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

export type AbonneStatut = "actif" | "inactif" | "desabonne";

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