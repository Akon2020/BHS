import {
  COOKIE_DOMAIN,
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
  ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  ...(withMaxAge ? { maxAge: AUTH_COOKIE_MAX_AGE } : {}),
});

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
