import { User, Abonne, Evenement, Blog } from "./user";

export interface DashboardSection<T> {
  nombre: number;
  stat: string;
  data: T[];
}

export interface DashboardResponse {
  users: DashboardSection<User>;
  abonnes: DashboardSection<Abonne>;
  evenements: DashboardSection<Evenement>;
  blogs: DashboardSection<Blog>;
}
