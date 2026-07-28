import { Notification, PreferenceNotification } from "../models/index.model.js";
import { CATEGORIES_NOTIFICATION } from "../utils/notification.constants.js";
import { notifierSegment } from "../utils/notification.service.js";

/** Centre in-app : notifications de l'utilisateur courant (paginées). */
export const getMesNotifications = async (req, res, next) => {
  try {
    const idUtilisateur = req.user.idUtilisateur;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 20;
    const where = { idUtilisateur };
    if (req.query.lu === "true") where.lu = true;
    if (req.query.lu === "false") where.lu = false;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    const nonLues = await Notification.count({
      where: { idUtilisateur, lu: false },
    });

    return res.status(200).json({
      total: count,
      page,
      pages: Math.ceil(count / limit),
      nonLues,
      notifications: rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/** Marque une notification comme lue. */
export const marquerLue = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({
      where: { idNotification: req.params.id, idUtilisateur: req.user.idUtilisateur },
    });
    if (!notif) {
      return res.status(404).json({ message: "Notification introuvable" });
    }
    await notif.update({ lu: true });
    return res.status(200).json({ message: "Notification lue", data: notif });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/** Marque toutes les notifications comme lues. */
export const marquerToutesLues = async (req, res, next) => {
  try {
    await Notification.update(
      { lu: true },
      { where: { idUtilisateur: req.user.idUtilisateur, lu: false } },
    );
    return res.status(200).json({ message: "Toutes les notifications lues" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/** Préférences de notification (une entrée par catégorie, active par défaut). */
export const getPreferences = async (req, res, next) => {
  try {
    const idUtilisateur = req.user.idUtilisateur;
    const rows = await PreferenceNotification.findAll({
      where: { idUtilisateur },
      attributes: ["categorie", "active"],
    });
    const map = new Map(rows.map((r) => [r.categorie, r.active]));
    const preferences = CATEGORIES_NOTIFICATION.map((categorie) => ({
      categorie,
      active: map.has(categorie) ? map.get(categorie) : true,
    }));
    return res.status(200).json({ preferences });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/** Active/désactive une catégorie pour l'utilisateur courant. */
export const updatePreference = async (req, res, next) => {
  try {
    const { categorie, active } = req.body;
    if (!CATEGORIES_NOTIFICATION.includes(categorie)) {
      return res.status(400).json({ message: "Catégorie invalide." });
    }
    const idUtilisateur = req.user.idUtilisateur;
    const [pref] = await PreferenceNotification.findOrCreate({
      where: { idUtilisateur, categorie },
      defaults: { active: active !== false },
    });
    await pref.update({ active: active !== false });
    return res.status(200).json({ message: "Préférence mise à jour", data: pref });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/** Diffusion manuelle (admin) vers un segment. */
export const diffuser = async (req, res, next) => {
  try {
    const { titre, corps, segment = "tous", donnees } = req.body;
    if (!titre || !corps) {
      return res.status(400).json({ message: "Le titre et le corps sont requis." });
    }
    if (!["tous", "membres", "abonnes"].includes(segment)) {
      return res.status(400).json({ message: "Segment invalide." });
    }
    await notifierSegment(segment, {
      titre,
      corps,
      categorie: "systeme",
      donnees: donnees || null,
    });
    return res.status(202).json({ message: "Diffusion lancée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
