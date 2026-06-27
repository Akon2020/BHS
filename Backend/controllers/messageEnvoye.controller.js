import { MessageEnvoye, Utilisateur } from "../models/index.model.js";
import transporter from "../config/nodemailer.js";
import { CONTACT_EMAIL } from "../config/env.js";
import { messageAdminTemplate } from "../utils/email.template.js";
import { valideEmail } from "../middlewares/email.middleware.js";

const expediteurInclude = {
  model: Utilisateur,
  as: "expediteur",
  attributes: ["idUtilisateur", "nomComplet", "email", "avatar"],
};

// Composer et envoyer un nouveau message (boîte d'envoi admin)
export const envoyerMessage = async (req, res, next) => {
  try {
    const { destinataireEmail, destinataireNom, sujet, message } = req.body;

    if (!destinataireEmail || !sujet || !message) {
      return res.status(400).json({
        message: "Le destinataire, le sujet et le message sont requis.",
      });
    }

    if (!valideEmail(destinataireEmail)) {
      return res
        .status(400)
        .json({ message: "Adresse email du destinataire invalide." });
    }

    const mailOptions = {
      from: `"BurningHeart IHS" <${CONTACT_EMAIL}>`,
      to: destinataireEmail,
      subject: sujet,
      html: messageAdminTemplate(destinataireNom, sujet, message),
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (sendError) {
      console.error("Erreur lors de l'envoi du message :", sendError);

      await MessageEnvoye.create({
        destinataireEmail,
        destinataireNom: destinataireNom || null,
        sujet,
        message,
        statut: "echec",
        erreur: sendError?.message || "Échec de l'envoi",
        envoyePar: req.user?.idUtilisateur || null,
      });

      return res.status(502).json({
        message:
          "Le message n'a pas pu être envoyé. Veuillez réessayer plus tard.",
      });
    }

    const messageEnvoye = await MessageEnvoye.create({
      destinataireEmail,
      destinataireNom: destinataireNom || null,
      sujet,
      message,
      statut: "envoye",
      envoyePar: req.user?.idUtilisateur || null,
    });

    return res.status(201).json({
      message: `Message envoyé avec succès à ${destinataireEmail}`,
      data: messageEnvoye,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Lister les messages envoyés
export const getMessagesEnvoyes = async (req, res, next) => {
  try {
    const messages = await MessageEnvoye.findAll({
      include: [expediteurInclude],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      nombre: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Récupérer un message envoyé par son ID
export const getMessageEnvoyeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await MessageEnvoye.findByPk(id, {
      include: [expediteurInclude],
    });

    if (!message) {
      return res.status(404).json({ message: "Message non trouvé" });
    }

    return res.status(200).json({ message });
  } catch (error) {
    console.error("Erreur lors de la récupération du message :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Supprimer un message envoyé
export const deleteMessageEnvoye = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await MessageEnvoye.findByPk(id);

    if (!message) {
      return res.status(404).json({ message: "Message non trouvé" });
    }

    await message.destroy();

    return res.status(200).json({ message: "Message supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du message :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
