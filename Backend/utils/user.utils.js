import {
  COOKIE_DOMAIN,
  FRONT_URL,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  NODE_ENV,
} from "../config/env.js";
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign({ email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 jours

/**
 * Domaine du cookie d'auth. En production, l'API (`api.burningheartihs.org`) et
 * le front (`burningheartihs.org`) sont sur des hôtes différents : sans `domain`
 * partagé, le cookie reste attaché à l'API et `proxy.ts` (côté front) ne le voit
 * jamais → boucle de redirection vers `/connexion`.
 * Priorité à `COOKIE_DOMAIN` ; à défaut, en production, dérivé de `FRONT_URL`.
 */
const resolveCookieDomain = () => {
  if (COOKIE_DOMAIN) return COOKIE_DOMAIN;
  if (NODE_ENV !== "production" || !FRONT_URL) return undefined;

  try {
    const { hostname } = new URL(FRONT_URL);
    if (hostname === "localhost" || /^[\d.]+$/.test(hostname)) return undefined;
    return `.${hostname.replace(/^www\./, "")}`;
  } catch {
    return undefined;
  }
};

const AUTH_COOKIE_DOMAIN = resolveCookieDomain();

/**
 * Options communes du cookie d'authentification httpOnly.
 * - `secure` uniquement en production (sinon le cookie est rejeté sur http en dev).
 * - `domain` partagé entre sous-domaines en production (ex. `.burningheartihs.org`)
 *   pour que l'API et le front (proxy.ts) voient le même cookie. Non défini en dev.
 * @param {{ withMaxAge?: boolean }} [opts]
 */
export const getAuthCookieOptions = ({ withMaxAge = false } = {}) => ({
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  ...(AUTH_COOKIE_DOMAIN ? { domain: AUTH_COOKIE_DOMAIN } : {}),
  ...(withMaxAge ? { maxAge: AUTH_COOKIE_MAX_AGE } : {}),
});

/**
 * Efface le cookie d'auth, y compris l'ancienne variante sans `domain`
 * (posée avant que le domaine partagé soit configuré), qui sinon garderait
 * le navigateur authentifié auprès de l'API après une déconnexion.
 */
export const clearAuthCookie = (res) => {
  res.clearCookie("token", getAuthCookieOptions());
  if (AUTH_COOKIE_DOMAIN) {
    res.clearCookie("token", { ...getAuthCookieOptions(), domain: undefined });
  }
};

export const getUserWithoutPassword = (userInstance) => {
  if (!userInstance || typeof userInstance.toJSON !== "function") {
    throw new Error("Invalid Sequelize user instance");
  }

  const user = userInstance.toJSON();
  delete user.password;
  return user;
};

export const strongPasswd = (passwd) => {
  if (passwd.length < 6) {
    return false;
  }

  const contientLettre = /[a-zA-Z]/.test(passwd);
  const contientChiffre = /[0-9]/.test(passwd);
  const contientSpecial = /[^\w\s]/.test(passwd);

  return contientLettre && contientChiffre && contientSpecial;
};

export const formatDateForUser = (isoDateString) => {
  const date = new Date(isoDateString);

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
};
