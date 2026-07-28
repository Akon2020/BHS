import * as SecureStore from "expo-secure-store";

// Stockage du JWT : expo-secure-store uniquement (jamais AsyncStorage), cf. CLAUDE.md §6.
const TOKEN_KEY = "bhs_token";

let cachedToken: string | null = null;

export const getToken = async (): Promise<string | null> => {
  if (cachedToken !== null) return cachedToken;
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    cachedToken = null;
  }
  return cachedToken;
};

export const setToken = async (token: string): Promise<void> => {
  cachedToken = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const clearToken = async (): Promise<void> => {
  cachedToken = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};
