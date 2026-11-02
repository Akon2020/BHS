import { Op } from "sequelize";
import { DemandePriere, Utilisateur } from "../models/index.model.js";
import { valideEmail } from "../middlewares/email.middleware.js";
import { notifierParRole } from "../utils/notification.service.js";

const STATUTS = ["nouvelle", "validee", "archivee"];
const INTENTION_MIN = 5;
const INTENTION_MAX = 2000;

// Date du jour à Bukavu (UTC+2), au format YYYY-MM-DD.
const aujourdhui = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lubumbashi" }).format(
    new Date(),
  );

const nettoyer = (valeur, max) =>
  typeof valeur === "string" ? valeur.trim().slice(0, max) : "";

const dateValide = (valeur) =>
  typeof valeur === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valeur);

/**
 * Vue publique d'une intention : n'expose jamais l'email ni le texte original
 * d'une demande non partagée.
 */
const versPublic = (demande) => {
  const partagee = demande.partagePublic || demande.source === "equipe";
  return {
    idDemandePriere: demande.idDemandePriere,
    prenom: partagee && demande.prenom ? demande.prenom : null,
    texte: demande.intentionPublique || demande.intention,
    source: demande.source,
  };
};

// Public : intentions planifiées pour aujourd'hui.
export const getPrieresDuJour = async (req, res, next) => {
  try {
    const date = aujourdhui();
    const demandes = await DemandePriere.findAll({
      where: { statut: "validee", datePriere: date },
      order: [
        ["source", "DESC"], // intentions de l'équipe en premier
        ["createdAt", "ASC"],
      ],
    });

    const publiques = demandes.filter(
      (d) => d.partagePublic || d.source === "equipe",
    );

    return res.status(200).json({
      date,
      total: demandes.length,
      confidentielles: demandes.length - publiques.length,
      intentions: publiques.map(versPublic),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des prières du jour :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Public : dépôt d'une demande de prière.
export const createDemandePriere = async (req, res, next) => {
  try {
    // Champ piège anti-robot : invisible pour les humains.
    if (req.body.siteWeb) {
      return res.status(201).json({ message: "Demande reçue" });
    }

    const prenom = nettoyer(req.body.prenom, 100);
    const email = nettoyer(req.body.email, 150);
    const intention = nettoyer(req.body.intention, INTENTION_MAX);
    const partagePublic =
      req.body.partagePublic === true || req.body.partagePublic === "true";

    if (intention.length < INTENTION_MIN) {
      return res.status(400).json({
        message: "Merci de décrire votre intention (au moins 5 caractères).",
      });
    }
    if (email && !valideEmail(email)) {
      return res.status(400).json({ message: "Adresse email invalide" });
    }

    const demande = await DemandePriere.create({
      prenom: prenom || null,
      email: email || null,
      intention,
      partagePublic,
      statut: "nouvelle",
      source: "visiteur",
    });

    notifierParRole(["admin", "editeur"], {
      titre: "Nouvelle demande de prière",
      corps: prenom
        ? `${prenom} a confié une intention à la Table de prière.`
        : "Une intention a été confiée à la Table de prière.",
      categorie: "systeme",
      donnees: { type: "priere", id: demande.idDemandePriere },
    });

    return res.status(201).json({
      message:
        "Votre intention a bien été reçue. Nous la porterons dans notre prière.",
    });
  } catch (error) {
    console.error("Erreur lors du dépôt de la demande de prière :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Admin : liste filtrable + compteurs par statut.
export const getDemandesPriere = async (req, res, next) => {
  try {
    const { statut, q, date } = req.query;
    const where = {};

    if (STATUTS.includes(statut)) where.statut = statut;
    if (dateValide(date)) where.datePriere = date;
    if (typeof q === "string" && q.trim()) {
      const motif = `%${q.trim()}%`;
      where[Op.or] = [
        { prenom: { [Op.like]: motif } },
        { email: { [Op.like]: motif } },
        { intention: { [Op.like]: motif } },
      ];
    }

    const [demandes, compteurs] = await Promise.all([
      DemandePriere.findAll({
        where,
        include: [
          {
            model: Utilisateur,
            as: "traiteur",
            attributes: ["idUtilisateur", "nomComplet"],
          },
        ],
        order: [["createdAt", "DESC"]],
      }),
      DemandePriere.count({ group: ["statut"] }),
    ]);

    const parStatut = { nouvelle: 0, validee: 0, archivee: 0 };
    compteurs.forEach((c) => {
      parStatut[c.statut] = Number(c.count);
    });

    return res.status(200).json({
      nombre: demandes.length,
      parStatut,
      aujourdhui: aujourdhui(),
      demandes,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Admin : ajout d'une intention par l'équipe (ex. « pour les malades »).
export const createIntentionEquipe = async (req, res, next) => {
  try {
    const intention = nettoyer(req.body.intention, INTENTION_MAX);
    const { datePriere } = req.body;

    if (intention.length < INTENTION_MIN) {
      return res
        .status(400)
        .json({ message: "L'intention doit contenir au moins 5 caractères." });
    }

    const demande = await DemandePriere.create({
      prenom: null,
      intention,
      partagePublic: true,
      statut: "validee",
      datePriere: dateValide(datePriere) ? datePriere : aujourdhui(),
      source: "equipe",
      traitePar: req.user?.idUtilisateur || null,
    });

    return res
      .status(201)
      .json({ message: "Intention ajoutée", data: demande });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'intention :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Admin : validation, planification, reformulation, archivage.
export const updateDemandePriere = async (req, res, next) => {
  try {
    const demande = await DemandePriere.findByPk(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: "Demande introuvable" });
    }

    const { statut, datePriere, intentionPublique, prenom } = req.body;

    if (statut !== undefined) {
      if (!STATUTS.includes(statut)) {
        return res.status(400).json({ message: "Statut invalide" });
      }
      demande.statut = statut;
    }
    if (datePriere !== undefined) {
      if (datePriere && !dateValide(datePriere)) {
        return res.status(400).json({ message: "Date de prière invalide" });
      }
      demande.datePriere = datePriere || null;
    }
    if (intentionPublique !== undefined) {
      demande.intentionPublique =
        nettoyer(intentionPublique, INTENTION_MAX) || null;
    }
    if (prenom !== undefined) {
      demande.prenom = nettoyer(prenom, 100) || null;
    }
    // Planifier une demande la valide implicitement.
    if (demande.datePriere && demande.statut === "nouvelle") {
      demande.statut = "validee";
    }
    demande.traitePar = req.user?.idUtilisateur || demande.traitePar;

    await demande.save();

    return res
      .status(200)
      .json({ message: "Demande mise à jour", data: demande });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la demande :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteDemandePriere = async (req, res, next) => {
  try {
    const demande = await DemandePriere.findByPk(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: "Demande introuvable" });
    }
    await demande.destroy();
    return res.status(200).json({ message: "Demande supprimée" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la demande :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
