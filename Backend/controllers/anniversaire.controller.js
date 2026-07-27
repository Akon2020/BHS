import { Op } from "sequelize";
import {
  Anniversaire,
  Abonne,
  Utilisateur,
} from "../models/index.model.js";
import transporter from "../config/nodemailer.js";
import { EMAIL } from "../config/env.js";
import {
  birthdayAlertTemplate,
  birthdayReminderTemplate,
} from "../utils/anniversaire-email.template.js";
import {
  notifierTous,
  notifierParRole,
} from "../utils/notification.service.js";

/* -------------------------------- CRUD -------------------------------- */

export const getAnniversaires = async (req, res, next) => {
  try {
    const anniversaires = await Anniversaire.findAll({
      order: [
        ["mois", "ASC"],
        ["jour", "ASC"],
      ],
    });
    return res
      .status(200)
      .json({ nombre: anniversaires.length, anniversaires });
  } catch (error) {
    console.error("Erreur récupération anniversaires :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Prochains anniversaires pour l'app (membres connectés) — sans l'année de naissance.
export const getAnniversairesAVenir = async (req, res, next) => {
  try {
    const now = new Date(Date.now() + 2 * 60 * 60 * 1000); // UTC+2
    const debutJour = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const anniversaires = await Anniversaire.findAll({
      where: { actif: true },
      attributes: ["nom", "jour", "mois"],
    });
    const aVenir = anniversaires
      .map((a) => {
        let cible = new Date(Date.UTC(now.getUTCFullYear(), a.mois - 1, a.jour));
        if (cible < debutJour) {
          cible = new Date(Date.UTC(now.getUTCFullYear() + 1, a.mois - 1, a.jour));
        }
        const dansJours = Math.round((cible - debutJour) / (1000 * 60 * 60 * 24));
        return { nom: a.nom, jour: a.jour, mois: a.mois, dansJours };
      })
      .sort((x, y) => x.dansJours - y.dansJours)
      .slice(0, 30);
    return res.status(200).json({ nombre: aVenir.length, anniversaires: aVenir });
  } catch (error) {
    console.error("Erreur anniversaires à venir :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const createAnniversaire = async (req, res, next) => {
  try {
    const { nom, jour, mois, annee, email, note, delaiRappelJours } = req.body;
    if (!nom || !jour || !mois) {
      return res
        .status(400)
        .json({ message: "Le nom, le jour et le mois sont requis." });
    }
    const anniversaire = await Anniversaire.create({
      nom,
      jour: Number(jour),
      mois: Number(mois),
      annee: annee ? Number(annee) : null,
      email: email || null,
      note: note || null,
      delaiRappelJours:
        delaiRappelJours !== undefined ? Number(delaiRappelJours) : 3,
    });
    return res
      .status(201)
      .json({ message: "Anniversaire ajouté", data: anniversaire });
  } catch (error) {
    console.error("Erreur création anniversaire :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updateAnniversaire = async (req, res, next) => {
  try {
    const anniversaire = await Anniversaire.findByPk(req.params.id);
    if (!anniversaire)
      return res.status(404).json({ message: "Anniversaire introuvable." });

    const champs = ["nom", "jour", "mois", "annee", "email", "note", "delaiRappelJours", "actif"];
    for (const c of champs) {
      if (req.body[c] !== undefined) anniversaire[c] = req.body[c];
    }
    await anniversaire.save();
    return res
      .status(200)
      .json({ message: "Anniversaire mis à jour", data: anniversaire });
  } catch (error) {
    console.error("Erreur maj anniversaire :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteAnniversaire = async (req, res, next) => {
  try {
    const anniversaire = await Anniversaire.findByPk(req.params.id);
    if (!anniversaire)
      return res.status(404).json({ message: "Anniversaire introuvable." });
    await anniversaire.destroy();
    return res.status(200).json({ message: "Anniversaire supprimé" });
  } catch (error) {
    console.error("Erreur suppression anniversaire :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/* --------------------------- Vérification (cron) --------------------------- */

const sendMailSafe = async ({ bcc, subject, html }) => {
  if (!bcc || bcc.length === 0) return;
  try {
    await transporter.sendMail({
      from: `"BurningHeart IHS" <${EMAIL}>`,
      to: EMAIL,
      bcc,
      subject,
      html,
    });
  } catch (e) {
    console.error("Erreur email anniversaire :", e.message);
  }
};

// Vérifie les anniversaires du jour (alerte à tous les abonnés) et à venir
// (rappel en amont aux admins). Exécutée quotidiennement par le planificateur.
export const verifierAnniversaires = async () => {
  const now = new Date(Date.now() + 2 * 60 * 60 * 1000); // UTC+2
  const jour = now.getUTCDate();
  const mois = now.getUTCMonth() + 1;

  const anniversaires = await Anniversaire.findAll({ where: { actif: true } });

  // Alerte du jour J → tous les abonnés actifs.
  const dujour = anniversaires.filter((a) => a.jour === jour && a.mois === mois);
  if (dujour.length) {
    const abonnes = await Abonne.findAll({
      where: { statut: "actif" },
      attributes: ["email"],
    });
    const bcc = abonnes.map((a) => a.email).filter(Boolean);
    for (const a of dujour) {
      await sendMailSafe({
        bcc,
        subject: `Joyeux anniversaire ${a.nom} !`,
        html: birthdayAlertTemplate(a.nom),
      });
      // Push (additif) : alerte du jour à toute la communauté.
      await notifierTous({
        titre: `Joyeux anniversaire ${a.nom} !`,
        corps: "Souhaitons ensemble un bel anniversaire aujourd'hui 🎉",
        categorie: "anniversaire",
        donnees: { type: "anniversaire", id: a.idAnniversaire },
      });
    }
  }

  // Rappel en amont → admins / éditeurs.
  const admins = await Utilisateur.findAll({
    where: { role: { [Op.in]: ["admin", "editeur"] } },
    attributes: ["email"],
  });
  const adminBcc = admins.map((u) => u.email).filter(Boolean);
  let rappels = 0;
  for (const a of anniversaires) {
    const target = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + (a.delaiRappelJours || 0),
      ),
    );
    if (target.getUTCDate() === a.jour && target.getUTCMonth() + 1 === a.mois) {
      const dateStr = `${String(a.jour).padStart(2, "0")}/${String(
        a.mois,
      ).padStart(2, "0")}`;
      await sendMailSafe({
        bcc: adminBcc,
        subject: `Rappel : anniversaire de ${a.nom}`,
        html: birthdayReminderTemplate(a.nom, dateStr, a.delaiRappelJours),
      });
      // Push (additif) : rappel en amont aux admins / éditeurs.
      await notifierParRole(["admin", "editeur"], {
        titre: `Rappel : anniversaire de ${a.nom}`,
        corps: `Le ${dateStr} · pensez à préparer un message.`,
        categorie: "anniversaire",
        donnees: { type: "anniversaire", id: a.idAnniversaire },
      });
      rappels += 1;
    }
  }

  return { jour, mois, dujour: dujour.length, rappels };
};

// Déclenchement manuel (admin) — utile pour tester.
export const declencherVerification = async (req, res, next) => {
  try {
    const resume = await verifierAnniversaires();
    return res
      .status(200)
      .json({ message: "Vérification exécutée", resume });
  } catch (error) {
    console.error("Erreur déclenchement vérification :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
