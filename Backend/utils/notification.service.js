import { Op } from "sequelize";
import {
  Notification,
  PreferenceNotification,
  DispositifPush,
  Utilisateur,
  Abonne,
} from "../models/index.model.js";
import { envoyerPush } from "./push.js";

/**
 * Renvoie l'ensemble des idUtilisateur ayant désactivé une catégorie donnée.
 */
const utilisateursDesactives = async (categorie) => {
  const prefs = await PreferenceNotification.findAll({
    where: { categorie, active: false },
    attributes: ["idUtilisateur"],
  });
  return new Set(prefs.map((p) => p.idUtilisateur));
};

/**
 * Notifie une liste d'utilisateurs : persiste une notification in-app et envoie
 * un push aux dispositifs actifs, en respectant les préférences par catégorie.
 * Non bloquant.
 * @param {number[]} userIds
 * @param {{ titre: string, corps: string, categorie: string, donnees?: object }} payload
 */
export const notifierUtilisateurs = async (userIds, payload) => {
  try {
    const ids = [...new Set((userIds || []).filter(Boolean))];
    if (ids.length === 0) return;

    const desactives = await utilisateursDesactives(payload.categorie);
    const cibles = ids.filter((id) => !desactives.has(id));
    if (cibles.length === 0) return;

    // Centre in-app.
    await Notification.bulkCreate(
      cibles.map((idUtilisateur) => ({
        idUtilisateur,
        titre: payload.titre,
        corps: payload.corps,
        categorie: payload.categorie,
        donnees: payload.donnees || null,
      })),
    );

    // Push vers les dispositifs actifs de ces utilisateurs.
    const dispositifs = await DispositifPush.findAll({
      where: { idUtilisateur: { [Op.in]: cibles }, actif: true },
      attributes: ["token"],
    });
    await envoyerPush(
      dispositifs.map((d) => d.token),
      payload,
    );
  } catch (err) {
    console.error("Erreur notifierUtilisateurs :", err.message);
  }
};

/** Notifie l'utilisateur dont l'email correspond (si un compte existe). */
export const notifierParEmail = async (email, payload) => {
  try {
    if (!email) return;
    const user = await Utilisateur.findOne({
      where: { email },
      attributes: ["idUtilisateur"],
    });
    if (user) await notifierUtilisateurs([user.idUtilisateur], payload);
  } catch (err) {
    console.error("Erreur notifierParEmail :", err.message);
  }
};

// Slugs des 3 catégories éditoriales fixes → catégorie de notification.
const SLUG_VERS_CATEGORIE = {
  "echos-de-priere": "echo_priere",
  "pensee-du-jour": "pensee_du_jour",
  meditation: "meditation",
};

/**
 * Notifie toute la communauté de la publication d'un article éditorial
 * (uniquement les 3 catégories fixes : échos de prière / pensée du jour / méditation).
 */
export const notifierPublicationBlog = async (blog) => {
  try {
    const categorie = SLUG_VERS_CATEGORIE[blog?.categorie?.slug];
    if (!categorie) return;
    await notifierTous({
      titre: blog.titre,
      corps: "Un nouveau contenu spirituel vient d'être publié.",
      categorie,
      donnees: { type: "blog", slug: blog.slug },
    });
  } catch (err) {
    console.error("Erreur notifierPublicationBlog :", err.message);
  }
};

/** Notifie tous les utilisateurs d'un ou plusieurs rôles. */
export const notifierParRole = async (roles, payload) => {
  const users = await Utilisateur.findAll({
    where: { role: { [Op.in]: roles } },
    attributes: ["idUtilisateur"],
  });
  await notifierUtilisateurs(
    users.map((u) => u.idUtilisateur),
    payload,
  );
};

/** Notifie tous les utilisateurs de la plateforme. */
export const notifierTous = async (payload) => {
  const users = await Utilisateur.findAll({ attributes: ["idUtilisateur"] });
  await notifierUtilisateurs(
    users.map((u) => u.idUtilisateur),
    payload,
  );
};

/**
 * Diffusion segmentée (broadcast admin).
 * @param {"tous"|"membres"|"abonnes"} segment
 */
export const notifierSegment = async (segment, payload) => {
  if (segment === "abonnes") {
    // Utilisateurs dont l'email correspond à un abonné actif.
    const abonnes = await Abonne.findAll({
      where: { statut: "actif" },
      attributes: ["email"],
    });
    const emails = abonnes.map((a) => a.email).filter(Boolean);
    const users = await Utilisateur.findAll({
      where: { email: { [Op.in]: emails } },
      attributes: ["idUtilisateur"],
    });
    return notifierUtilisateurs(
      users.map((u) => u.idUtilisateur),
      payload,
    );
  }
  if (segment === "membres") {
    return notifierParRole(["membre"], payload);
  }
  // "tous"
  return notifierTous(payload);
};
