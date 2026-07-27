import { Op } from "sequelize";
import {
  Tache,
  TacheCommentaire,
  Utilisateur,
} from "../models/index.model.js";
import transporter from "../config/nodemailer.js";
import { EMAIL } from "../config/env.js";
import { taskReminderTemplate } from "../utils/tache-email.template.js";
import { notifierUtilisateurs } from "../utils/notification.service.js";

const STATUTS = ["a_faire", "en_cours", "fait"];
const RECURRENCES = ["aucune", "quotidien", "hebdo", "mensuel"];
const PRIORITES = ["basse", "normale", "haute"];

/* ----------------------------- Utilitaires ----------------------------- */

// Normalise une liste d'assignés en tableau d'entiers uniques.
const normaliserAssignes = (value) => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0))];
};

// Calcule la prochaine échéance selon la récurrence (format AAAA-MM-JJ).
const prochaineEcheance = (echeance, recurrence) => {
  if (!echeance || recurrence === "aucune") return null;
  const [y, m, d] = String(echeance).split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (recurrence === "quotidien") date.setUTCDate(date.getUTCDate() + 1);
  else if (recurrence === "hebdo") date.setUTCDate(date.getUTCDate() + 7);
  else if (recurrence === "mensuel") date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString().slice(0, 10);
};

// Ajoute le détail (id + nom) des utilisateurs assignés à une tâche.
const attacherAssignes = (taches, usersMap) => {
  const list = Array.isArray(taches) ? taches : [taches];
  return list.map((t) => {
    const json = t.toJSON();
    json.assignesDetails = (json.assignes || [])
      .map((id) => usersMap.get(Number(id)))
      .filter(Boolean);
    return json;
  });
};

/* -------------------------------- CRUD -------------------------------- */

export const getTaches = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.statut && STATUTS.includes(req.query.statut)) {
      where.statut = req.query.statut;
    }

    let taches = await Tache.findAll({
      where,
      include: [
        { model: Utilisateur, as: "createur", attributes: ["idUtilisateur", "nomComplet"] },
      ],
      order: [
        ["statut", "ASC"],
        ["echeance", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    // Filtre « mes tâches » : créées par moi ou qui me sont assignées.
    if (req.query.assigne === "me" && req.user) {
      const uid = req.user.idUtilisateur;
      taches = taches.filter(
        (t) => t.createdBy === uid || (t.assignes || []).map(Number).includes(uid),
      );
    }

    const users = await Utilisateur.findAll({
      attributes: ["idUtilisateur", "nomComplet", "role"],
      order: [["nomComplet", "ASC"]],
    });
    const usersMap = new Map(users.map((u) => [u.idUtilisateur, u.toJSON()]));

    const data = attacherAssignes(taches, usersMap);
    return res.status(200).json({
      nombre: data.length,
      taches: data,
      // Liste du personnel assignable (évite un appel séparé à /api/users).
      assignables: users.map((u) => u.toJSON()),
    });
  } catch (error) {
    console.error("Erreur récupération tâches :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getTacheById = async (req, res, next) => {
  try {
    const tache = await Tache.findByPk(req.params.id, {
      include: [
        { model: Utilisateur, as: "createur", attributes: ["idUtilisateur", "nomComplet"] },
        {
          model: TacheCommentaire,
          as: "commentaires",
          include: [
            { model: Utilisateur, as: "auteur", attributes: ["idUtilisateur", "nomComplet"] },
          ],
        },
      ],
      order: [[{ model: TacheCommentaire, as: "commentaires" }, "createdAt", "ASC"]],
    });
    if (!tache) return res.status(404).json({ message: "Tâche introuvable." });

    const users = await Utilisateur.findAll({
      attributes: ["idUtilisateur", "nomComplet", "role"],
    });
    const usersMap = new Map(users.map((u) => [u.idUtilisateur, u.toJSON()]));
    const [data] = attacherAssignes(tache, usersMap);

    return res.status(200).json({ tache: data });
  } catch (error) {
    console.error("Erreur récupération tâche :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const createTache = async (req, res, next) => {
  try {
    const {
      titre,
      description,
      statut,
      priorite,
      echeance,
      recurrence,
      assignes,
      rappelJoursAvant,
    } = req.body;

    if (!titre || !titre.trim()) {
      return res.status(400).json({ message: "Le titre est requis." });
    }

    const tache = await Tache.create({
      titre: titre.trim(),
      description: description?.trim() || null,
      statut: STATUTS.includes(statut) ? statut : "a_faire",
      priorite: PRIORITES.includes(priorite) ? priorite : "normale",
      echeance: echeance || null,
      recurrence: RECURRENCES.includes(recurrence) ? recurrence : "aucune",
      assignes: normaliserAssignes(assignes),
      rappelJoursAvant:
        rappelJoursAvant !== undefined ? Math.max(0, Number(rappelJoursAvant) || 0) : 1,
      createdBy: req.user.idUtilisateur,
    });

    return res.status(201).json({ message: "Tâche créée", data: tache });
  } catch (error) {
    console.error("Erreur création tâche :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updateTache = async (req, res, next) => {
  try {
    const tache = await Tache.findByPk(req.params.id);
    if (!tache) return res.status(404).json({ message: "Tâche introuvable." });

    const {
      titre,
      description,
      statut,
      priorite,
      echeance,
      recurrence,
      assignes,
      rappelJoursAvant,
    } = req.body;

    if (titre !== undefined) tache.titre = titre.trim();
    if (description !== undefined) tache.description = description?.trim() || null;
    if (priorite !== undefined && PRIORITES.includes(priorite)) tache.priorite = priorite;
    if (echeance !== undefined) tache.echeance = echeance || null;
    if (recurrence !== undefined && RECURRENCES.includes(recurrence)) {
      tache.recurrence = recurrence;
    }
    if (assignes !== undefined) tache.assignes = normaliserAssignes(assignes);
    if (rappelJoursAvant !== undefined) {
      tache.rappelJoursAvant = Math.max(0, Number(rappelJoursAvant) || 0);
    }

    // Une tâche récurrente marquée « fait » : elle reste clôturée, mais une
    // nouvelle occurrence est créée pour la prochaine échéance.
    let occurrenceCreee = false;
    if (statut !== undefined && STATUTS.includes(statut)) {
      tache.statut = statut;
      if (statut === "fait") {
        const suivante = prochaineEcheance(tache.echeance, tache.recurrence);
        if (suivante) {
          await Tache.create({
            titre: tache.titre,
            description: tache.description,
            statut: "a_faire",
            priorite: tache.priorite,
            echeance: suivante,
            recurrence: tache.recurrence,
            assignes: tache.assignes,
            rappelJoursAvant: tache.rappelJoursAvant,
            createdBy: tache.createdBy,
          });
          occurrenceCreee = true;
        }
      }
    }

    await tache.save();
    return res
      .status(200)
      .json({ message: "Tâche mise à jour", data: tache, occurrenceCreee });
  } catch (error) {
    console.error("Erreur maj tâche :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteTache = async (req, res, next) => {
  try {
    const tache = await Tache.findByPk(req.params.id);
    if (!tache) return res.status(404).json({ message: "Tâche introuvable." });
    await tache.destroy();
    return res.status(200).json({ message: "Tâche supprimée" });
  } catch (error) {
    console.error("Erreur suppression tâche :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/* ----------------------------- Commentaires ----------------------------- */

export const addCommentaire = async (req, res, next) => {
  try {
    const tache = await Tache.findByPk(req.params.id);
    if (!tache) return res.status(404).json({ message: "Tâche introuvable." });

    const { contenu } = req.body;
    if (!contenu || !contenu.trim()) {
      return res.status(400).json({ message: "Le contenu est requis." });
    }

    const commentaire = await TacheCommentaire.create({
      idTache: tache.idTache,
      idUtilisateur: req.user.idUtilisateur,
      contenu: contenu.trim(),
    });

    const complet = await TacheCommentaire.findByPk(commentaire.idCommentaireTache, {
      include: [
        { model: Utilisateur, as: "auteur", attributes: ["idUtilisateur", "nomComplet"] },
      ],
    });

    return res.status(201).json({ message: "Commentaire ajouté", data: complet });
  } catch (error) {
    console.error("Erreur ajout commentaire tâche :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteCommentaire = async (req, res, next) => {
  try {
    const commentaire = await TacheCommentaire.findByPk(req.params.commentaireId);
    if (!commentaire)
      return res.status(404).json({ message: "Commentaire introuvable." });

    // Seul l'auteur ou un admin peut supprimer.
    if (
      commentaire.idUtilisateur !== req.user.idUtilisateur &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    await commentaire.destroy();
    return res.status(200).json({ message: "Commentaire supprimé" });
  } catch (error) {
    console.error("Erreur suppression commentaire tâche :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/* --------------------------- Rappels (cron) --------------------------- */

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
    console.error("Erreur email tâche :", e.message);
  }
};

// Envoie les rappels des tâches dont l'échéance approche ou est atteinte.
// Exécutée quotidiennement par le planificateur.
export const verifierRappelsTaches = async () => {
  const now = new Date(Date.now() + 2 * 60 * 60 * 1000); // UTC+2
  const aujourdhui = now.toISOString().slice(0, 10);

  const taches = await Tache.findAll({
    where: {
      statut: { [Op.ne]: "fait" },
      echeance: { [Op.ne]: null },
    },
    include: [
      { model: Utilisateur, as: "createur", attributes: ["idUtilisateur", "email"] },
    ],
  });

  let envoyes = 0;
  for (const t of taches) {
    // Déjà rappelée aujourd'hui ? on saute.
    if (t.dernierRappel && String(t.dernierRappel) === aujourdhui) continue;

    const [y, m, d] = String(t.echeance).split("-").map(Number);
    const echeance = new Date(Date.UTC(y, m - 1, d));
    const debutJour = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const joursRestants = Math.round(
      (echeance - debutJour) / (1000 * 60 * 60 * 24),
    );

    // Rappel si l'on est à J-rappelJoursAvant ou le jour J (pas au-delà).
    const doitRappeler =
      joursRestants === (t.rappelJoursAvant || 0) || joursRestants === 0;
    if (!doitRappeler || joursRestants < 0) continue;

    // Destinataires : assignés + créateur.
    const ids = [...new Set([...(t.assignes || []).map(Number), t.createdBy])];
    const users = await Utilisateur.findAll({
      where: { idUtilisateur: { [Op.in]: ids } },
      attributes: ["email"],
    });
    const bcc = users.map((u) => u.email).filter(Boolean);

    await sendMailSafe({
      bcc,
      subject: `Rappel : ${t.titre}`,
      html: taskReminderTemplate({
        titre: t.titre,
        description: t.description,
        echeanceStr: `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`,
        joursRestants,
      }),
    });

    // Push (additif) : rappel aux assignés + créateur.
    await notifierUtilisateurs(ids, {
      titre: `Rappel : ${t.titre}`,
      corps:
        joursRestants === 0
          ? "Échéance aujourd'hui."
          : `Échéance dans ${joursRestants} jour(s).`,
      categorie: "systeme",
      donnees: { type: "tache", id: t.idTache },
    });

    t.dernierRappel = aujourdhui;
    await t.save();
    envoyes += 1;
  }

  return { aujourdhui, tachesTraitees: taches.length, rappelsEnvoyes: envoyes };
};

// Déclenchement manuel (admin) — utile pour tester.
export const declencherRappelsTaches = async (req, res, next) => {
  try {
    const resume = await verifierRappelsTaches();
    return res.status(200).json({ message: "Rappels exécutés", resume });
  } catch (error) {
    console.error("Erreur déclenchement rappels tâches :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
