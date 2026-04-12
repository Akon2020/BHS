import { Op } from "sequelize";
import { Fichier, Utilisateur } from "../models/index.model.js";
import { deleteFile } from "../utils/deletefile.js";

const allowedStatuts = ["brouillon", "publie", "programme", "archive"];

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : value;

const normalizeSlug = (value) =>
  normalizeText(value)
    ?.toLowerCase()
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const normalizeUploadedFiles = (files) =>
  (files || []).map((file) => ({
    nomOriginal: file.originalname,
    nomStocke: file.filename,
    chemin: file.path.replace(/\\/g, "/"),
    typeMime: file.mimetype,
    taille: file.size,
  }));

const getTotalSize = (files) =>
  (files || []).reduce((acc, file) => acc + (Number(file.taille) || 0), 0);

const isPubliclyAvailable = (fichier) => {
  if (!fichier) return false;
  if (fichier.statut === "publie") return true;
  if (fichier.statut === "programme") {
    return Boolean(
      fichier.datePublication &&
      new Date(fichier.datePublication) <= new Date(),
    );
  }
  return false;
};

export const getAllFichiers = async (req, res, next) => {
  try {
    const { search = "", statut } = req.query;

    const where = {};
    if (search?.trim()) {
      where[Op.or] = [
        { nomReference: { [Op.like]: `%${search.trim()}%` } },
        { slug: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    if (statut && allowedStatuts.includes(statut)) {
      where.statut = statut;
    }

    const fichiers = await Fichier.findAll({
      where,
      include: [
        {
          model: Utilisateur,
          as: "createur",
          attributes: ["idUtilisateur", "nomComplet", "email"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      nombre: fichiers.length,
      fichiers,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getSingleFichier = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fichier = await Fichier.findByPk(id, {
      include: [
        {
          model: Utilisateur,
          as: "createur",
          attributes: ["idUtilisateur", "nomComplet", "email"],
          required: false,
        },
      ],
    });

    if (!fichier) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }

    return res.status(200).json({ fichier });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getPublicFichiers = async (req, res, next) => {
  try {
    const { search = "" } = req.query;

    const where = {
      statut: {
        [Op.in]: ["publie", "programme"],
      },
    };

    if (search?.trim()) {
      where[Op.or] = [
        { nomReference: { [Op.like]: `%${search.trim()}%` } },
        { slug: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    const fichiers = await Fichier.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    const fichiersPublics = fichiers.filter(isPubliclyAvailable);

    return res.status(200).json({
      nombre: fichiersPublics.length,
      fichiers: fichiersPublics,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getPublicFichierBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const fichier = await Fichier.findOne({ where: { slug } });

    if (!fichier || !isPubliclyAvailable(fichier)) {
      return res.status(404).json({ message: "Ressource introuvable" });
    }

    return res.status(200).json({ fichier });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const createFichier = async (req, res, next) => {
  try {
    const nomReference = normalizeText(req.body?.nomReference);
    const description = normalizeText(req.body?.description);
    const statut = normalizeText(req.body?.statut) || "brouillon";
    const slug = normalizeSlug(req.body?.slug || nomReference);

    if (!nomReference || !description || !slug) {
      return res.status(400).json({
        message: "Le nom de référence, la description et le slug sont requis.",
      });
    }

    if (!allowedStatuts.includes(statut)) {
      return res.status(400).json({ message: "Statut de fichier invalide." });
    }

    const uploadedFiles = normalizeUploadedFiles(req.files);

    if (!uploadedFiles.length) {
      return res
        .status(400)
        .json({ message: "Veuillez uploader au moins un fichier." });
    }

    const datePublication = req.body?.datePublication
      ? new Date(req.body.datePublication)
      : null;

    if (statut === "programme" && !datePublication) {
      return res.status(400).json({
        message:
          "La date de publication est requise pour un fichier programmé.",
      });
    }

    const slugExists = await Fichier.findOne({ where: { slug } });
    if (slugExists) {
      return res.status(400).json({ message: "Ce slug est déjà utilisé." });
    }

    const fichier = await Fichier.create({
      nomReference,
      slug,
      description,
      statut,
      datePublication,
      fichiers: uploadedFiles,
      nombreFichiers: uploadedFiles.length,
      tailleTotale: getTotalSize(uploadedFiles),
      createdBy: req.user?.idUtilisateur || null,
    });

    return res.status(201).json({
      message: "Fichiers ajoutés avec succès",
      data: fichier,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updateFichier = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fichier = await Fichier.findByPk(id);
    if (!fichier) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }

    const patch = {};

    if (req.body?.nomReference !== undefined) {
      const nomReference = normalizeText(req.body.nomReference);
      if (!nomReference) {
        return res
          .status(400)
          .json({ message: "Le nom de référence est requis." });
      }
      patch.nomReference = nomReference;
    }

    if (req.body?.description !== undefined) {
      const description = normalizeText(req.body.description);
      if (!description) {
        return res.status(400).json({ message: "La description est requise." });
      }
      patch.description = description;
    }

    if (req.body?.slug !== undefined) {
      const slug = normalizeSlug(req.body.slug);
      if (!slug) {
        return res.status(400).json({ message: "Slug invalide." });
      }
      const slugExists = await Fichier.findOne({ where: { slug } });
      if (slugExists && slugExists.idFichier !== fichier.idFichier) {
        return res.status(400).json({ message: "Ce slug est déjà utilisé." });
      }
      patch.slug = slug;
    }

    const nextStatut =
      req.body?.statut !== undefined
        ? normalizeText(req.body.statut)
        : fichier.statut;
    if (req.body?.statut !== undefined) {
      if (!allowedStatuts.includes(nextStatut)) {
        return res.status(400).json({ message: "Statut de fichier invalide." });
      }
      patch.statut = nextStatut;
    }

    if (req.body?.datePublication !== undefined) {
      patch.datePublication = req.body.datePublication
        ? new Date(req.body.datePublication)
        : null;
    }

    const datePublicationFinale =
      patch.datePublication !== undefined
        ? patch.datePublication
        : fichier.datePublication;

    if (nextStatut === "programme" && !datePublicationFinale) {
      return res.status(400).json({
        message:
          "La date de publication est requise pour un fichier programmé.",
      });
    }

    const uploadedFiles = normalizeUploadedFiles(req.files);
    if (uploadedFiles.length) {
      for (const oldFile of fichier.fichiers || []) {
        await deleteFile(oldFile.chemin);
      }

      patch.fichiers = uploadedFiles;
      patch.nombreFichiers = uploadedFiles.length;
      patch.tailleTotale = getTotalSize(uploadedFiles);
    }

    await fichier.update(patch);

    return res.status(200).json({
      message: "Fichier mis à jour avec succès",
      data: fichier,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteFichier = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fichier = await Fichier.findByPk(id);
    if (!fichier) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }

    for (const file of fichier.fichiers || []) {
      await deleteFile(file.chemin);
    }

    await fichier.destroy();

    return res.status(200).json({ message: "Fichier supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
