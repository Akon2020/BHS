import { Op } from "sequelize";
import {
  ProfilPointage,
  Pointage,
  Utilisateur,
} from "../models/index.model.js";
import {
  getPeriodeRange,
  formatDuree,
  formatPeriodeLabel,
} from "../utils/pointage.utils.js";
import { generatePointagePdf } from "../utils/pointage-pdf.js";

const profilInclude = {
  model: ProfilPointage,
  as: "profil",
  attributes: ["idProfil", "nomComplet", "fonction", "source"],
};

/* ------------------------------- PROFILS ------------------------------- */

export const getProfils = async (req, res, next) => {
  try {
    const profils = await ProfilPointage.findAll({
      where: { actif: true },
      include: [
        {
          model: Utilisateur,
          as: "utilisateur",
          attributes: ["idUtilisateur", "nomComplet", "email", "avatar"],
        },
      ],
      order: [["nomComplet", "ASC"]],
    });

    return res.status(200).json({ nombre: profils.length, profils });
  } catch (error) {
    console.error("Erreur lors de la récupération des profils :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const createProfil = async (req, res, next) => {
  try {
    const { nomComplet, fonction, source, idUtilisateur } = req.body;

    if (!nomComplet && !idUtilisateur) {
      return res
        .status(400)
        .json({ message: "Le nom complet du profil est requis." });
    }

    // Profil issu d'un utilisateur système : éviter les doublons.
    if (source === "systeme" && idUtilisateur) {
      const existant = await ProfilPointage.findOne({
        where: { idUtilisateur },
      });
      if (existant) {
        return res.status(200).json({
          message: "Ce profil existe déjà.",
          data: existant,
        });
      }

      const utilisateur = await Utilisateur.findByPk(idUtilisateur);
      if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur introuvable." });
      }

      const profil = await ProfilPointage.create({
        nomComplet: nomComplet || utilisateur.nomComplet,
        fonction: fonction || null,
        source: "systeme",
        idUtilisateur,
      });
      return res
        .status(201)
        .json({ message: "Profil ajouté avec succès", data: profil });
    }

    const profil = await ProfilPointage.create({
      nomComplet,
      fonction: fonction || null,
      source: "manuel",
    });

    return res
      .status(201)
      .json({ message: "Profil créé avec succès", data: profil });
  } catch (error) {
    console.error("Erreur lors de la création du profil :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updateProfil = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nomComplet, fonction, actif } = req.body;

    const profil = await ProfilPointage.findByPk(id);
    if (!profil) {
      return res.status(404).json({ message: "Profil introuvable." });
    }

    if (nomComplet !== undefined) profil.nomComplet = nomComplet;
    if (fonction !== undefined) profil.fonction = fonction;
    if (actif !== undefined) profil.actif = actif;
    await profil.save();

    return res
      .status(200)
      .json({ message: "Profil mis à jour", data: profil });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteProfil = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profil = await ProfilPointage.findByPk(id);
    if (!profil) {
      return res.status(404).json({ message: "Profil introuvable." });
    }
    await profil.destroy();
    return res.status(200).json({ message: "Profil supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du profil :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/* ------------------------------ POINTAGES ------------------------------ */

const buildDateWhere = ({ periode, anchor, start, end, idProfil }) => {
  const where = {};
  if (idProfil) where.idProfil = idProfil;

  if (start && end) {
    where.date = { [Op.between]: [start, end] };
  } else if (periode) {
    const range = getPeriodeRange(periode, anchor);
    where.date = { [Op.between]: [range.start, range.end] };
  }
  return where;
};

export const getPointages = async (req, res, next) => {
  try {
    const { idProfil, periode, anchor, start, end } = req.query;
    const where = buildDateWhere({ periode, anchor, start, end, idProfil });

    const pointages = await Pointage.findAll({
      where,
      include: [profilInclude],
      order: [
        ["date", "DESC"],
        ["heureDebut", "DESC"],
      ],
    });

    return res.status(200).json({ nombre: pointages.length, pointages });
  } catch (error) {
    console.error("Erreur lors de la récupération des pointages :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const createPointage = async (req, res, next) => {
  try {
    const { idProfil, date, heureDebut, heureFin, note } = req.body;

    if (!idProfil || !date || !heureDebut) {
      return res.status(400).json({
        message: "Le profil, la date et l'heure de début sont requis.",
      });
    }

    const profil = await ProfilPointage.findByPk(idProfil);
    if (!profil) {
      return res.status(404).json({ message: "Profil introuvable." });
    }

    const pointage = await Pointage.create({
      idProfil,
      date,
      heureDebut,
      heureFin: heureFin || null,
      note: note || null,
      createdBy: req.user?.idUtilisateur || null,
    });

    const created = await Pointage.findByPk(pointage.idPointage, {
      include: [profilInclude],
    });

    return res
      .status(201)
      .json({ message: "Pointage enregistré avec succès", data: created });
  } catch (error) {
    console.error("Erreur lors de la création du pointage :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updatePointage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, heureDebut, heureFin, note } = req.body;

    const pointage = await Pointage.findByPk(id);
    if (!pointage) {
      return res.status(404).json({ message: "Pointage introuvable." });
    }

    if (date !== undefined) pointage.date = date;
    if (heureDebut !== undefined) pointage.heureDebut = heureDebut;
    // Permet la clôture a posteriori (ajout de l'heure de fin).
    if (heureFin !== undefined) pointage.heureFin = heureFin || null;
    if (note !== undefined) pointage.note = note;
    await pointage.save();

    const updated = await Pointage.findByPk(id, { include: [profilInclude] });

    return res
      .status(200)
      .json({ message: "Pointage mis à jour", data: updated });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du pointage :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deletePointage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pointage = await Pointage.findByPk(id);
    if (!pointage) {
      return res.status(404).json({ message: "Pointage introuvable." });
    }
    await pointage.destroy();
    return res.status(200).json({ message: "Pointage supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du pointage :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/* -------------------------------- STATS -------------------------------- */

const computeStats = async ({ periode = "mensuel", anchor }) => {
  const range = getPeriodeRange(periode, anchor);

  const pointages = await Pointage.findAll({
    where: { date: { [Op.between]: [range.start, range.end] } },
    include: [profilInclude],
  });

  const parProfil = new Map();
  let tempsCumuleMinutes = 0;

  for (const p of pointages) {
    if (p.dureeMinutes) tempsCumuleMinutes += p.dureeMinutes;

    const key = p.idProfil;
    if (!parProfil.has(key)) {
      parProfil.set(key, {
        idProfil: p.idProfil,
        nomComplet: p.profil?.nomComplet || "—",
        fonction: p.profil?.fonction || "",
        presences: 0,
        tempsMinutes: 0,
      });
    }
    const agg = parProfil.get(key);
    agg.presences += 1;
    agg.tempsMinutes += p.dureeMinutes || 0;
  }

  const recap = Array.from(parProfil.values()).sort(
    (a, b) => b.tempsMinutes - a.tempsMinutes,
  );

  return {
    range,
    stats: {
      profilsActifs: parProfil.size,
      presences: pointages.length,
      tempsCumuleMinutes,
    },
    recap,
  };
};

export const getStats = async (req, res, next) => {
  try {
    const { periode = "mensuel", anchor } = req.query;
    const { range, stats, recap } = await computeStats({ periode, anchor });

    return res.status(200).json({
      periode: range,
      stats: {
        ...stats,
        tempsCumuleLabel: formatDuree(stats.tempsCumuleMinutes),
      },
      // Données graphique : profils les plus actifs (en heures)
      graph: recap.slice(0, 10).map((r) => ({
        nomComplet: r.nomComplet,
        heures: Math.round((r.tempsMinutes / 60) * 100) / 100,
        minutes: r.tempsMinutes,
      })),
      recap: recap.map((r) => ({
        ...r,
        tempsLabel: formatDuree(r.tempsMinutes),
      })),
    });
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/* ------------------------------- EXPORT -------------------------------- */

export const exportPdf = async (req, res, next) => {
  try {
    const { periode = "mensuel", anchor, scope = "global", idProfil } = req.query;
    const range = getPeriodeRange(periode, anchor);
    const periodeLabel = formatPeriodeLabel(range);
    const generatedAt = new Date().toLocaleString("fr-FR");

    if (scope === "individuel") {
      if (!idProfil) {
        return res
          .status(400)
          .json({ message: "Un profil est requis pour l'export individuel." });
      }
      const profil = await ProfilPointage.findByPk(idProfil);
      if (!profil) {
        return res.status(404).json({ message: "Profil introuvable." });
      }

      const pointages = await Pointage.findAll({
        where: {
          idProfil,
          date: { [Op.between]: [range.start, range.end] },
        },
        order: [
          ["date", "ASC"],
          ["heureDebut", "ASC"],
        ],
      });

      const tempsMinutes = pointages.reduce(
        (acc, p) => acc + (p.dureeMinutes || 0),
        0,
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="pointage-${profil.nomComplet}-${range.start}.pdf"`,
      );

      return generatePointagePdf(res, {
        scope: "individuel",
        periodeLabel,
        generatedAt,
        profil: { nomComplet: profil.nomComplet, fonction: profil.fonction },
        summary: {
          presences: pointages.length,
          tempsCumule: formatDuree(tempsMinutes),
        },
        sessions: pointages.map((p) => ({
          date: p.date,
          heureDebut: p.heureDebut,
          heureFin: p.heureFin || "—",
          duree: p.dureeMinutes ? formatDuree(p.dureeMinutes) : "—",
          note: p.note || "",
        })),
      });
    }

    // Export global
    const { stats, recap } = await computeStats({ periode, anchor });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="pointage-global-${range.start}.pdf"`,
    );

    return generatePointagePdf(res, {
      scope: "global",
      periodeLabel,
      generatedAt,
      summary: {
        profilsActifs: stats.profilsActifs,
        presences: stats.presences,
        tempsCumule: formatDuree(stats.tempsCumuleMinutes),
      },
      recap: recap.map((r) => ({
        nomComplet: r.nomComplet,
        fonction: r.fonction || "—",
        presences: r.presences,
        temps: formatDuree(r.tempsMinutes),
      })),
    });
  } catch (error) {
    console.error("Erreur lors de l'export PDF du pointage :", error);
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
