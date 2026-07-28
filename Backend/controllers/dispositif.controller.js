import { DispositifPush } from "../models/index.model.js";
import { PLATEFORMES_PUSH } from "../utils/notification.constants.js";

/**
 * Enregistre (ou réactive) un dispositif pour les notifications push.
 * Accessible aux visiteurs (idUtilisateur nul possible) via optionalAuthJWT.
 */
export const enregistrerDispositif = async (req, res, next) => {
  try {
    const { token, plateforme } = req.body;

    if (!token || !plateforme) {
      return res
        .status(400)
        .json({ message: "Le token et la plateforme sont requis." });
    }
    if (!PLATEFORMES_PUSH.includes(plateforme)) {
      return res.status(400).json({ message: "Plateforme invalide." });
    }

    const idUtilisateur = req.user?.idUtilisateur || null;
    const existant = await DispositifPush.findOne({ where: { token } });

    if (existant) {
      await existant.update({ plateforme, actif: true, idUtilisateur });
      return res
        .status(200)
        .json({ message: "Dispositif mis à jour", data: existant });
    }

    const dispositif = await DispositifPush.create({
      token,
      plateforme,
      idUtilisateur,
      actif: true,
    });

    return res
      .status(201)
      .json({ message: "Dispositif enregistré", data: dispositif });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/** Désenregistre un dispositif (déconnexion / désactivation des push). */
export const desenregistrerDispositif = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Le token est requis." });
    }
    await DispositifPush.update({ actif: false }, { where: { token } });
    return res.status(200).json({ message: "Dispositif désenregistré" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
