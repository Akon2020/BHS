import { Temoignage } from "../models/index.model.js";

// Liste publique : témoignages publiés uniquement, triés par ordre puis date.
export const getTemoignagesPublic = async (req, res, next) => {
  try {
    const temoignages = await Temoignage.findAll({
      where: { statut: "publie" },
      order: [
        ["ordre", "ASC"],
        ["createdAt", "DESC"],
      ],
    });
    return res.status(200).json({ nombre: temoignages.length, temoignages });
  } catch (error) {
    console.error("Erreur lors de la récupération des témoignages :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Liste admin : tous les témoignages.
export const getTemoignages = async (req, res, next) => {
  try {
    const temoignages = await Temoignage.findAll({
      order: [
        ["ordre", "ASC"],
        ["createdAt", "DESC"],
      ],
    });
    return res.status(200).json({ nombre: temoignages.length, temoignages });
  } catch (error) {
    console.error("Erreur lors de la récupération des témoignages :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getTemoignageById = async (req, res, next) => {
  try {
    const temoignage = await Temoignage.findByPk(req.params.id);
    if (!temoignage) {
      return res.status(404).json({ message: "Témoignage introuvable" });
    }
    return res.status(200).json({ temoignage });
  } catch (error) {
    console.error("Erreur lors de la récupération du témoignage :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const createTemoignage = async (req, res, next) => {
  try {
    const { auteur, fonction, contenu, statut, ordre } = req.body;

    if (!auteur || !contenu) {
      return res
        .status(400)
        .json({ message: "L'auteur et le contenu sont requis." });
    }

    const temoignage = await Temoignage.create({
      auteur,
      fonction: fonction || null,
      contenu,
      photo: req.file ? req.file.path : null,
      statut: statut === "publie" ? "publie" : "brouillon",
      ordre: Number(ordre) || 0,
      createdBy: req.user?.idUtilisateur || null,
    });

    return res
      .status(201)
      .json({ message: "Témoignage créé avec succès", data: temoignage });
  } catch (error) {
    console.error("Erreur lors de la création du témoignage :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updateTemoignage = async (req, res, next) => {
  try {
    const temoignage = await Temoignage.findByPk(req.params.id);
    if (!temoignage) {
      return res.status(404).json({ message: "Témoignage introuvable" });
    }

    const { auteur, fonction, contenu, statut, ordre } = req.body;

    if (auteur !== undefined) temoignage.auteur = auteur;
    if (fonction !== undefined) temoignage.fonction = fonction || null;
    if (contenu !== undefined) temoignage.contenu = contenu;
    if (statut !== undefined)
      temoignage.statut = statut === "publie" ? "publie" : "brouillon";
    if (ordre !== undefined) temoignage.ordre = Number(ordre) || 0;
    if (req.file) temoignage.photo = req.file.path;

    await temoignage.save();

    return res
      .status(200)
      .json({ message: "Témoignage mis à jour", data: temoignage });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du témoignage :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteTemoignage = async (req, res, next) => {
  try {
    const temoignage = await Temoignage.findByPk(req.params.id);
    if (!temoignage) {
      return res.status(404).json({ message: "Témoignage introuvable" });
    }
    await temoignage.destroy();
    return res.status(200).json({ message: "Témoignage supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du témoignage :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
