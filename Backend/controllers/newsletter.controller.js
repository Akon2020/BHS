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


// Envoi effectif en arrière-plan : met à jour chaque ligne de suivi (attente -> envoye/echec).
const runNewsletterSend = async (newsletter, abonnes) => {
  for (const abonne of abonnes) {
    try {
      const unsubscribeUrl = `${FRONT_URL}/unsubscribe/${abonne.idAbonne}`;
      await transporter.sendMail({
        from: `"BurningHeart IHS" <${EMAIL}>`,
        to: abonne.email,
        subject: newsletter.objetMail,
        html: newsletterEmailTemplate(
          abonne.nomComplet,
          newsletter.objetMail,
          newsletter.contenu,
          unsubscribeUrl,
        ),
      });
      await NewsletterAbonne.update(
        { statut: "envoye", dateEnvoi: new Date() },
        {
          where: {
            idNewsletter: newsletter.idNewsletter,
            idAbonne: abonne.idAbonne,
          },
        },
      );
    } catch (err) {
      console.error(`Erreur envoi newsletter à ${abonne.email}:`, err.message);
      await NewsletterAbonne.update(
        { statut: "echec" },
        {
          where: {
            idNewsletter: newsletter.idNewsletter,
            idAbonne: abonne.idAbonne,
          },
        },
      );
    }
  }
  await newsletter.update({ statut: "envoye", dateEnvoi: new Date() });
};

// Prépare le suivi et démarre le job (non bloquant). Retourne le résultat du démarrage.
const startNewsletterSend = async (newsletter) => {
  if (newsletter.statut === "envoye") {
    return { started: false, reason: "deja_envoye" };
  }
  const enAttente = await NewsletterAbonne.count({
    where: { idNewsletter: newsletter.idNewsletter, statut: "attente" },
  });
  if (enAttente > 0) return { started: false, reason: "en_cours" };

  const abonnes = await Abonne.findAll({ where: { statut: "actif" } });
  if (abonnes.length === 0) return { started: false, reason: "aucun_abonne" };

  // Repart d'une base propre + crée les lignes de suivi (attente).
  await NewsletterAbonne.destroy({
    where: { idNewsletter: newsletter.idNewsletter },
  });
  await NewsletterAbonne.bulkCreate(
    abonnes.map((a) => ({
      idNewsletter: newsletter.idNewsletter,
      idAbonne: a.idAbonne,
      statut: "attente",
    })),
  );

  // Job en arrière-plan (non attendu) : la requête peut répondre immédiatement.
  runNewsletterSend(newsletter, abonnes).catch((e) =>
    console.error("Erreur job newsletter:", e.message),
  );

  return { started: true, total: abonnes.length };
};

export const sendNewsletter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newsletter = await Newsletter.findByPk(id);
    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter introuvable" });
    }

    const result = await startNewsletterSend(newsletter);
    if (!result.started) {
      const map = {
        deja_envoye: [400, "Newsletter déjà envoyée"],
        en_cours: [409, "Un envoi est déjà en cours pour cette newsletter."],
        aucun_abonne: [400, "Aucun abonné actif."],
      };
      const [code, message] = map[result.reason] || [400, "Envoi impossible"];
      return res.status(code).json({ message });
    }

    return res
      .status(202)
      .json({ message: "Envoi démarré", total: result.total });
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Progression de l'envoi (polling).
export const getNewsletterProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newsletter = await Newsletter.findByPk(id, {
      attributes: ["idNewsletter", "statut"],
    });
    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter introuvable" });
    }

    const rows = await NewsletterAbonne.findAll({
      where: { idNewsletter: id },
      attributes: ["statut"],
    });
    const total = rows.length;
    const envoye = rows.filter((r) => r.statut === "envoye").length;
    const echec = rows.filter((r) => r.statut === "echec").length;
    const attente = rows.filter((r) => r.statut === "attente").length;
    const traite = envoye + echec;
    const pourcentage = total > 0 ? Math.round((traite / total) * 100) : 0;
    const statut =
      newsletter.statut === "envoye"
        ? "termine"
        : attente > 0
          ? "en_cours"
          : total > 0
            ? "termine"
            : "inconnu";

    return res
      .status(200)
      .json({ total, envoye, echec, attente, traite, pourcentage, statut });
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
    await startNewsletterSend(newsletter);
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
