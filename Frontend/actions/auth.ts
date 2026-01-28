import api from "@/lib/axios";
import { AuthResponse, User } from "@/types/user";
import Cookies from "js-cookie";
import { getAuthHeaders } from "@/lib/auth";

export interface AuthPayload {
  email: string;
  password: string;
}

export const login = async (payload: AuthPayload): Promise<User> => {
  try {
    const res = await api.post<AuthResponse>("/api/auth/login", payload);

    const { token, userInfo } = res.data.data;

    localStorage.setItem("token", token);
    Cookies.set("token", token, {
      expires: 7,
      secure: true,
    });
    localStorage.setItem("user", JSON.stringify(userInfo));

    return userInfo;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      "Erreur lors de la connexion";

    throw new Error(message);
  }
};

export const logout = async () => {
  try {
    await api.post("/api/auth/logout");
  } finally {
    localStorage.removeItem("token");
    Cookies.remove("token");
    localStorage.removeItem("user");
  }
};

export const getProfile = async (): Promise<User> => {
  const res = await api.get("/api/auth/profile", {
    headers: getAuthHeaders(),
  });
  return res.data.user;
};


/* import api from "@/lib/axios";
import { Auth, GetAllAuthResponse } from "@/types/user";

export interface AuthPayload {
  email: string;
  password: string;
}


export const login = async (data: AuthPayload): Promise<Auth> => {
  try {
    const res = await api.post<GetAllAuthResponse>("/api/auth/login", data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    const { token, userInfo } = res.data.data;
    console.log(res.data)
    return { token, userInfo };
  } catch (error: any) {
    console.error(`Erreur lors de la connexion de l'utilisateur:`, error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const logout = async (): Promise<{ message: string }> => {
  try {
    localStorage.removeItem("token");
    const res = await api.post(
      "/api/auth/logout",
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error: any) {
    console.error(`Erreur lors de la déconnexion de l'utilisateur:`, error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const getProfile = async (): Promise<any> => {
  try {
    const res = await api.get("/api/auth/profile", {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data.user;
  } catch (error: any) {
    console.error(
      "Erreur lors de la récupération du profil utilisateur:",
      error
    );
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};
 */
