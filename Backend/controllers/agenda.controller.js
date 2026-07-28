import { Op } from "sequelize";
import {
  CreneauRdv,
  RendezVous,
  ParametreAgenda,
} from "../models/index.model.js";
import transporter from "../config/nodemailer.js";
import { EMAIL } from "../config/env.js";
import { valideEmail } from "../middlewares/email.middleware.js";
import {
  rdvConfirmationTemplate,
  rdvStatutTemplate,
} from "../utils/agenda-email.template.js";
import { notifierParEmail } from "../utils/notification.service.js";

const STATUT_RDV_LABEL = {
  approuve: "Votre rendez-vous est approuvé",
  refuse: "Votre demande de rendez-vous a été refusée",
  reprogramme: "Votre rendez-vous a été reprogrammé",
};

const OCCUPE = ["en_attente", "approuve", "reprogramme"];
const todayISO = () => new Date().toISOString().slice(0, 10);

const getParametre = async () => {
  const [param] = await ParametreAgenda.findOrCreate({
    where: { idParametre: 1 },
    defaults: { idParametre: 1 },
  });
  return param;
};

/* ----------------------------- Paramètres ----------------------------- */

export const getParametreAgenda = async (req, res, next) => {
  try {
    const param = await getParametre();
    return res.status(200).json({ parametre: param });
  } catch (error) {
    console.error("Erreur paramètre agenda :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updateParametreAgenda = async (req, res, next) => {
  try {
    const param = await getParametre();
    const { coordinateurNom, coordinateurFonction, message, actif } = req.body;
    if (coordinateurNom !== undefined) param.coordinateurNom = coordinateurNom;
    if (coordinateurFonction !== undefined)
      param.coordinateurFonction = coordinateurFonction;
    if (message !== undefined) param.message = message;
    if (actif !== undefined) param.actif = actif;
    await param.save();
    return res.status(200).json({ message: "Paramètres mis à jour", data: param });
  } catch (error) {
    console.error("Erreur maj paramètre agenda :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/* ------------------------------ Créneaux ------------------------------ */

const withReste = (creneau) => {
  const occupes = (creneau.rendezVous || []).filter((r) =>
    OCCUPE.includes(r.statut),
  ).length;
  const c = creneau.toJSON();
  c.reste = Math.max((creneau.capacite || 0) - occupes, 0);
  return c;
};

export const getCreneaux = async (req, res, next) => {
  try {
    const creneaux = await CreneauRdv.findAll({
      include: [{ model: RendezVous, as: "rendezVous", attributes: ["statut"] }],
      order: [
        ["date", "ASC"],
        ["heureDebut", "ASC"],
      ],
    });
    return res
      .status(200)
      .json({ nombre: creneaux.length, creneaux: creneaux.map(withReste) });
  } catch (error) {
    console.error("Erreur récupération créneaux :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getCreneauxDisponibles = async (req, res, next) => {
  try {
    const creneaux = await CreneauRdv.findAll({
      where: { actif: true, date: { [Op.gte]: todayISO() } },
      include: [{ model: RendezVous, as: "rendezVous", attributes: ["statut"] }],
      order: [
        ["date", "ASC"],
        ["heureDebut", "ASC"],
      ],
    });
    const dispo = creneaux.map(withReste).filter((c) => c.reste > 0);
    return res.status(200).json({ nombre: dispo.length, creneaux: dispo });
  } catch (error) {
    console.error("Erreur créneaux disponibles :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const createCreneau = async (req, res, next) => {
  try {
    const { date, heureDebut, heureFin, capacite } = req.body;
    if (!date || !heureDebut || !heureFin) {
      return res
        .status(400)
        .json({ message: "Date, heure de début et de fin sont requises." });
    }
    const creneau = await CreneauRdv.create({
      date,
      heureDebut,
      heureFin,
      capacite: Number(capacite) || 1,
    });
    return res
      .status(201)
      .json({ message: "Créneau créé", data: creneau });
  } catch (error) {
    console.error("Erreur création créneau :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updateCreneau = async (req, res, next) => {
  try {
    const creneau = await CreneauRdv.findByPk(req.params.id);
    if (!creneau)
      return res.status(404).json({ message: "Créneau introuvable." });
    const { date, heureDebut, heureFin, capacite, actif } = req.body;
    if (date !== undefined) creneau.date = date;
    if (heureDebut !== undefined) creneau.heureDebut = heureDebut;
    if (heureFin !== undefined) creneau.heureFin = heureFin;
    if (capacite !== undefined) creneau.capacite = Number(capacite) || 1;
    if (actif !== undefined) creneau.actif = actif;
    await creneau.save();
    return res.status(200).json({ message: "Créneau mis à jour", data: creneau });
  } catch (error) {
    console.error("Erreur maj créneau :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteCreneau = async (req, res, next) => {
  try {
    const creneau = await CreneauRdv.findByPk(req.params.id);
    if (!creneau)
      return res.status(404).json({ message: "Créneau introuvable." });
    await creneau.destroy();
    return res.status(200).json({ message: "Créneau supprimé" });
  } catch (error) {
    console.error("Erreur suppression créneau :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/* ----------------------------- Rendez-vous ---------------------------- */

const envoyerEmailRdv = async (html, to, subject) => {
  try {
    await transporter.sendMail({
      from: `"BurningHeart IHS" <${EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (e) {
    console.error("Erreur email RDV :", e.message);
  }
};

export const reserverRdv = async (req, res, next) => {
  try {
    const { idCreneau, nom, email, telephone, motif } = req.body;
    if (!idCreneau || !nom || !email || !telephone) {
      return res.status(400).json({
        message: "Créneau, nom, email et téléphone sont requis.",
      });
    }
    if (!valideEmail(email)) {
      return res.status(400).json({ message: "Adresse email invalide." });
    }

    const creneau = await CreneauRdv.findByPk(idCreneau, {
      include: [{ model: RendezVous, as: "rendezVous", attributes: ["statut"] }],
    });
    if (!creneau || !creneau.actif) {
      return res.status(404).json({ message: "Créneau indisponible." });
    }
    if (creneau.date < todayISO()) {
      return res.status(400).json({ message: "Ce créneau est passé." });
    }
    const occupes = (creneau.rendezVous || []).filter((r) =>
      OCCUPE.includes(r.statut),
    ).length;
    if (occupes >= creneau.capacite) {
      return res.status(409).json({ message: "Ce créneau est complet." });
    }

    const rdv = await RendezVous.create({
      idCreneau: creneau.idCreneau,
      nom,
      email,
      telephone,
      motif: motif || null,
      date: creneau.date,
      heureDebut: creneau.heureDebut,
      heureFin: creneau.heureFin,
      statut: "en_attente",
    });

    const param = await getParametre();
    res.status(201).json({
      message: "Votre demande de rendez-vous a été enregistrée.",
      data: rdv,
    });

    envoyerEmailRdv(
      rdvConfirmationTemplate(
        nom,
        new Date(creneau.date).toLocaleDateString("fr-FR"),
        String(creneau.heureDebut).slice(0, 5),
        param.coordinateurNom,
      ),
      email,
      "Demande de rendez-vous reçue - Burning Heart",
    );
  } catch (error) {
    console.error("Erreur réservation RDV :", error);
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getRendezVous = async (req, res, next) => {
  try {
    const { statut } = req.query;
    const where = {};
    if (statut && statut !== "all") where.statut = statut;

    const rendezVous = await RendezVous.findAll({
      where,
      include: [{ model: CreneauRdv, as: "creneau" }],
      order: [
        ["date", "DESC"],
        ["heureDebut", "DESC"],
      ],
    });
    return res
      .status(200)
      .json({ nombre: rendezVous.length, rendezVous });
  } catch (error) {
    console.error("Erreur récupération RDV :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const suiviRdv = async (req, res, next) => {
  try {
    const email = (req.query.email || "").toString().trim();
    if (!email) return res.status(200).json({ nombre: 0, rendezVous: [] });
    const rendezVous = await RendezVous.findAll({
      where: { email },
      attributes: [
        "idRendezVous",
        "date",
        "heureDebut",
        "heureFin",
        "statut",
        "motif",
        "note",
      ],
      order: [["date", "DESC"]],
    });
    return res.status(200).json({ nombre: rendezVous.length, rendezVous });
  } catch (error) {
    console.error("Erreur suivi RDV :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updateStatutRdv = async (req, res, next) => {
  try {
    const { statut, note, date, heureDebut, heureFin } = req.body;
    const valides = ["en_attente", "approuve", "refuse", "reprogramme"];
    if (statut && !valides.includes(statut)) {
      return res.status(400).json({ message: "Statut invalide." });
    }

    const rdv = await RendezVous.findByPk(req.params.id);
    if (!rdv) return res.status(404).json({ message: "Rendez-vous introuvable." });

    if (statut) rdv.statut = statut;
    if (note !== undefined) rdv.note = note;
    // Reprogrammation : nouvelle date/heure.
    if (date) rdv.date = date;
    if (heureDebut) rdv.heureDebut = heureDebut;
    if (heureFin !== undefined) rdv.heureFin = heureFin;
    await rdv.save();

    const param = await getParametre();
    res.status(200).json({ message: "Rendez-vous mis à jour", data: rdv });

    if (statut && ["approuve", "refuse", "reprogramme"].includes(statut)) {
      envoyerEmailRdv(
        rdvStatutTemplate(
          rdv.nom,
          statut,
          new Date(rdv.date).toLocaleDateString("fr-FR"),
          String(rdv.heureDebut).slice(0, 5),
          rdv.note,
          param.coordinateurNom,
        ),
        rdv.email,
        `Votre rendez-vous - Burning Heart`,
      );

      // Push (additif) : au demandeur s'il possède un compte.
      notifierParEmail(rdv.email, {
        titre: STATUT_RDV_LABEL[statut] ?? "Mise à jour de votre rendez-vous",
        corps: `${new Date(rdv.date).toLocaleDateString("fr-FR")} à ${String(
          rdv.heureDebut,
        ).slice(0, 5)}`,
        categorie: "rendezvous",
        donnees: { type: "rendezvous", id: rdv.idRendezVous },
      }).catch(() => {});
    }
  } catch (error) {
    console.error("Erreur maj statut RDV :", error);
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteRdv = async (req, res, next) => {
  try {
    const rdv = await RendezVous.findByPk(req.params.id);
    if (!rdv) return res.status(404).json({ message: "Rendez-vous introuvable." });
    await rdv.destroy();
    return res.status(200).json({ message: "Rendez-vous supprimé" });
  } catch (error) {
    console.error("Erreur suppression RDV :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
