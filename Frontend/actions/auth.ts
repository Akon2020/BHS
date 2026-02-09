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
