import {
  Newsletter,
  NewsletterAbonne,
  Abonne,
  Utilisateur,
} from "../models/index.model.js";
import { Op } from "sequelize";
import transporter from "../config/nodemailer.js";
import { EMAIL, FRONT_URL } from "../config/env.js";
import { newsletterEmailTemplate } from "../utils/email.template.js";

export const getAllNewsletters = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, statut } = req.query;

    const where = statut ? { statut } : {};

    const newsletters = await Newsletter.findAndCountAll({
      where,
      include: [
        {
          model: Utilisateur,
          as: "redacteur",
          attributes: ["idUtilisateur", "nomComplet", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: (page - 1) * limit,
    });

    res.status(200).json({
      total: newsletters.count,
      page: Number(page),
      pages: Math.ceil(newsletters.count / limit),
      data: newsletters.rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getSingleNewsletter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const newsletter = await Newsletter.findByPk(id, {
      include: [
        { model: Utilisateur, as: "redacteur", attributes: ["idUtilisateur", "nomComplet", "email"] },
        {
          model: NewsletterAbonne,
          as: "envois",
          include: [{ model: Abonne, as: "abonne" }],
        },
      ],
    });

    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter introuvable" });
    }

    res.status(200).json(newsletter);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getNewsletterStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const total = await NewsletterAbonne.count({ where: { idNewsletter: id } });
    const envoye = await NewsletterAbonne.count({
      where: { idNewsletter: id, statut: "envoye" },
    });
    const echec = await NewsletterAbonne.count({
      where: { idNewsletter: id, statut: "echec" },
    });

    res.status(200).json({
      total,
      envoye,
      echec,
      tauxSucces: total ? ((envoye / total) * 100).toFixed(2) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const createNewsletter = async (req, res, next) => {
  try {
    const {
      titreInterne,
      objetMail,
      contenu,
      statut = "brouillon",
      dateProgrammee,
    } = req.body;

    const userId = req.user?.idUtilisateur;

    if (!titreInterne || !objetMail || !contenu || !userId) {
      return res.status(400).json({
        message: "Champs obligatoires manquants",
      });
    }

    const newsletter = await Newsletter.create({
      titreInterne,
      objetMail,
      contenu,
      statut,
      dateProgrammee: statut === "programme" ? dateProgrammee : null,
      writedBy: userId,
    });

    return res.status(201).json({
      message: "Newsletter créée avec succès",
      data: newsletter,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updateNewsletter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const newsletter = await Newsletter.findByPk(id);
    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter introuvable" });
    }

    if (newsletter.statut === "envoye") {
      return res.status(400).json({
        message: "Impossible de modifier une newsletter déjà envoyée",
      });
    }

    await newsletter.update(req.body);

    res.status(200).json({
      message: "Newsletter mise à jour",
      data: newsletter,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};


export const sendNewsletter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const newsletter = await Newsletter.findByPk(id);
    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter introuvable" });
    }

    if (newsletter.statut === "envoye") {
      return res.status(400).json({ message: "Newsletter déjà envoyée" });
    }

    const abonnes = await Abonne.findAll({
      where: { statut: "actif" },
    });

    for (const abonne of abonnes) {
      try {
        const unsubscribeUrl = `${FRONT_URL}/unsubscribe/${abonne.idAbonne}`;

        const mailOptions = {
          from: `"BurningHeart IHS" <${EMAIL}>`,
          to: abonne.email,
          subject: newsletter.objetMail,
          html: newsletterEmailTemplate(
            abonne.nomComplet,
            newsletter.objetMail,
            newsletter.contenu,
            unsubscribeUrl
          ),
        };

        await transporter.sendMail(mailOptions);

        await NewsletterAbonne.create({
          idNewsletter: newsletter.idNewsletter,
          idAbonne: abonne.idAbonne,
          statut: "envoye",
          dateEnvoi: new Date(),
        });
      } catch (err) {
        console.log(`Erreur envoi newsletter à ${abonne.email}:`, err);
        await NewsletterAbonne.create({
          idNewsletter: newsletter.idNewsletter,
          idAbonne: abonne.idAbonne,
          statut: "echec",
        });
      }
    }

    await newsletter.update({
      statut: "envoye",
      dateEnvoi: new Date(),
    });

    res.status(200).json({ message: "Newsletter envoyée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const processScheduledNewsletters = async () => {
  const newsletters = await Newsletter.findAll({
    where: {
      statut: "programme",
      dateProgrammee: { [Op.lte]: new Date() },
    },
  });

  for (const newsletter of newsletters) {
    await sendNewsletter(
      { params: { id: newsletter.idNewsletter } },
      { json: () => {} },
      () => {}
    );
  }
};


export const deleteNewsletter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const newsletter = await Newsletter.findByPk(id);
    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter introuvable" });
    }

    await NewsletterAbonne.destroy({ where: { idNewsletter: id } });
    await newsletter.destroy();

    res.status(200).json({ message: "Newsletter supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
