import { EMAIL, FRONT_URL } from "../config/env.js";
import transporter from "../config/nodemailer.js";
import { valideEmail } from "../middlewares/email.middleware.js";
import { Abonne, NewsletterAbonne, Newsletter } from "../models/index.model.js";
import { newsletterSubscriptionConfirmationTemplate } from "../utils/email.template.js";

export const getAllAbonnes = async (_, res, next) => {
  try {
    const abonnes = await Abonne.findAll({
      order: [["dateAbonnement", "DESC"]],
    });
    return res.status(200).json({ nombre: abonnes.length, abonnes });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getAllActifAbonnes = async (_, res, next) => {
  try {
    const abonnes = await Abonne.findAll({
      where: { statut: "actif" },
      order: [["dateAbonnement", "DESC"]],
    });
    return res.status(200).json({ nombre: abonnes.length, abonnes });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getSingleAbonne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const abonne = await Abonne.findByPk(id, {
      include: [
        {
          model: NewsletterAbonne,
          as: "receptions",
          attributes: ["idNewsletterAbonne", "statut", "dateEnvoi"],
          include: [
            {
              model: Newsletter,
              as: "newsletter",
              attributes: [
                "idNewsletter",
                "titreInterne",
                "objetMail",
                "dateEnvoi",
              ],
            },
          ],
        },
      ],
    });

    if (!abonne) {
      return res.status(404).json({ message: "Abonné introuvable" });
    }

    const totalReceptions = abonne.receptions?.length || 0;
    const totalRecues =
      abonne.receptions?.filter((reception) => reception.statut === "envoye")
        .length || 0;

    return res.status(200).json({
      abonne,
      stats: {
        totalReceptions,
        totalRecues,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { nomComplet, email } = req.body;

    if (!nomComplet || !email) {
      return res.status(404).json({
        message: "Vous devez remplir les champs obligatoires!",
      });
    }

    if (!valideEmail(email)) {
      return res.status(400).json({ message: "Adresse email invalide" });
    }

    const dejaInscrit = await Abonne.findOne({ where: { email } });

    if (dejaInscrit)
      return res
        .status(400)
        .json({ message: "Vous vous êtes déjà abonné(e) à la newsletter" });

    const nouveauAbonne = await Abonne.create({
      nomComplet,
      email,
      statut: "actif",
      dateAbonnement: new Date(),
      dateDesabonnement: null,
    });

    const mailOptions = {
      from: `"BurningHeart IHS" <${EMAIL}>`,
      to: email,
      subject: "Confirmation d'abonnement à la newsletter",
      html: newsletterSubscriptionConfirmationTemplate(
        nouveauAbonne.nomComplet,
        `${FRONT_URL}/blog`,
      ),
    };

    await transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(400).json({
          message:
            "Erreur lors de l'envoi de l'accusé de reception mais vous avez été bien abonné",
        });
      }
    });

    return res.status(201).json({
      message: `${nouveauAbonne.nomComplet}, Votre abonnement a été envoyé avec succès\nTrouvez une accusée de reception dans votre boîte mail`,
      data: nouveauAbonne,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updateAbonne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nomComplet, email } = req.body;

    const abonne = await Abonne.findByPk(id);

    if (!abonne) {
      return res.status(404).json({ message: "Abonné introuvable" });
    }

    if (!nomComplet?.trim() || !email?.trim()) {
      return res.status(400).json({
        message: "Le nom complet et l'adresse email sont requis",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!valideEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Adresse email invalide" });
    }

    const existingAbonne = await Abonne.findOne({
      where: { email: normalizedEmail },
    });
    if (existingAbonne && existingAbonne.idAbonne !== Number(id)) {
      return res
        .status(400)
        .json({
          message: "Cette adresse email est déjà utilisée par un autre abonné",
        });
    }

    await abonne.update({
      nomComplet: nomComplet.trim(),
      email: normalizedEmail,
    });

    return res.status(200).json({
      message: "Abonné mis à jour avec succès",
      data: abonne,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteAbonne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const abonne = await Abonne.findByPk(id);

    if (!abonne) {
      return res.status(404).json({ message: "Abonné introuvable" });
    }

    await NewsletterAbonne.destroy({ where: { idAbonne: id } });
    await abonne.destroy();

    return res.status(200).json({
      message: "Abonné supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
