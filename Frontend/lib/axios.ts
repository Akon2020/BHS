import axios from "axios";

// L'authentification repose sur un cookie httpOnly posé par le backend.
// `withCredentials: true` envoie automatiquement ce cookie sur chaque requête.
// Aucun token n'est manipulé côté JavaScript (protection anti-XSS).
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
