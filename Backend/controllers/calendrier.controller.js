import { EntreeCalendrier } from "../models/index.model.js";

/* -------------------------------- CRUD -------------------------------- */

export const getEntrees = async (req, res, next) => {
  try {
    const entrees = await EntreeCalendrier.findAll({
      order: [
        ["date", "ASC"],
        ["heureDebut", "ASC"],
      ],
    });
    return res.status(200).json({ nombre: entrees.length, entrees });
  } catch (error) {
    console.error("Erreur récupération entrées calendrier :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const createEntree = async (req, res, next) => {
  try {
    const { titre, description, date, heureDebut, heureFin, lieu, journeeEntiere } =
      req.body;

    if (!titre || !titre.trim() || !date) {
      return res
        .status(400)
        .json({ message: "Le titre et la date sont requis." });
    }

    const allDay = journeeEntiere === true || journeeEntiere === "true";

    const entree = await EntreeCalendrier.create({
      titre: titre.trim(),
      description: description?.trim() || null,
      date,
      heureDebut: allDay ? null : heureDebut || null,
      heureFin: allDay ? null : heureFin || null,
      lieu: lieu?.trim() || null,
      journeeEntiere: allDay,
      createdBy: req.user.idUtilisateur,
    });

    return res.status(201).json({ message: "Entrée ajoutée", data: entree });
  } catch (error) {
    console.error("Erreur création entrée calendrier :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updateEntree = async (req, res, next) => {
  try {
    const entree = await EntreeCalendrier.findByPk(req.params.id);
    if (!entree) return res.status(404).json({ message: "Entrée introuvable." });

    const { titre, description, date, heureDebut, heureFin, lieu, journeeEntiere } =
      req.body;

    if (titre !== undefined) entree.titre = titre.trim();
    if (description !== undefined) entree.description = description?.trim() || null;
    if (date !== undefined) entree.date = date;
    if (lieu !== undefined) entree.lieu = lieu?.trim() || null;

    if (journeeEntiere !== undefined) {
      entree.journeeEntiere =
        journeeEntiere === true || journeeEntiere === "true";
    }
    if (entree.journeeEntiere) {
      entree.heureDebut = null;
      entree.heureFin = null;
    } else {
      if (heureDebut !== undefined) entree.heureDebut = heureDebut || null;
      if (heureFin !== undefined) entree.heureFin = heureFin || null;
    }

    await entree.save();
    return res.status(200).json({ message: "Entrée mise à jour", data: entree });
  } catch (error) {
    console.error("Erreur maj entrée calendrier :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteEntree = async (req, res, next) => {
  try {
    const entree = await EntreeCalendrier.findByPk(req.params.id);
    if (!entree) return res.status(404).json({ message: "Entrée introuvable." });
    await entree.destroy();
    return res.status(200).json({ message: "Entrée supprimée" });
  } catch (error) {
    console.error("Erreur suppression entrée calendrier :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
