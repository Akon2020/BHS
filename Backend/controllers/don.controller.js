import { Don } from "../models/index.model.js";
import transporter from "../config/nodemailer.js";
import { CONTACT_EMAIL, EMAIL } from "../config/env.js";
import {
  donThankYouTemplate,
  donIntentionAdminTemplate,
} from "../utils/email.template.js";
import { valideEmail } from "../middlewares/email.middleware.js";

// Création d'une intention de don (formulaire public).
export const createDon = async (req, res, next) => {
  try {
    const { nom, email, montant, devise, moyen, message } = req.body;

    if (!nom || !email || !moyen) {
      return res
        .status(400)
        .json({ message: "Le nom, l'email et le moyen sont requis." });
    }
    if (!valideEmail(email)) {
      return res.status(400).json({ message: "Adresse email invalide." });
    }

    const don = await Don.create({
      nom,
      email,
      montant: montant ? Number(montant) : null,
      devise: devise || "USD",
      moyen,
      message: message || null,
    });

    // Notifications email (non bloquantes pour la réponse).
    try {
      await transporter.sendMail({
        from: `"BurningHeart IHS" <${EMAIL}>`,
        to: CONTACT_EMAIL,
        subject: `Nouvelle intention de don — ${don.nom}`,
        html: donIntentionAdminTemplate(don),
      });
      await transporter.sendMail({
        from: `"BurningHeart IHS" <${CONTACT_EMAIL}>`,
        to: don.email,
        subject: "Merci pour votre générosité — Burning Heart",
        html: donThankYouTemplate(don.nom, don.montant, don.devise),
      });
    } catch (mailError) {
      console.error("Erreur d'envoi des emails de don :", mailError);
    }

    return res.status(201).json({
      message: "Votre intention de don a bien été enregistrée. Merci !",
      data: don,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du don :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getDons = async (req, res, next) => {
  try {
    const dons = await Don.findAll({ order: [["createdAt", "DESC"]] });
    return res.status(200).json({ nombre: dons.length, dons });
  } catch (error) {
    console.error("Erreur lors de la récupération des dons :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getDonById = async (req, res, next) => {
  try {
    const don = await Don.findByPk(req.params.id);
    if (!don) return res.status(404).json({ message: "Don introuvable" });
    return res.status(200).json({ don });
  } catch (error) {
    console.error("Erreur lors de la récupération du don :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updateDonStatut = async (req, res, next) => {
  try {
    const { statut } = req.body;
    const don = await Don.findByPk(req.params.id);
    if (!don) return res.status(404).json({ message: "Don introuvable" });

    if (statut && ["annonce", "confirme"].includes(statut)) {
      don.statut = statut;
      await don.save();
    }

    return res.status(200).json({ message: "Statut mis à jour", data: don });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du don :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteDon = async (req, res, next) => {
  try {
    const don = await Don.findByPk(req.params.id);
    if (!don) return res.status(404).json({ message: "Don introuvable" });
    await don.destroy();
    return res.status(200).json({ message: "Don supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du don :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
