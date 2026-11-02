import slugify from "slugify";
import { Galerie, PhotoGalerie, Utilisateur } from "../models/index.model.js";
import db from "../database/db.js";
import { deleteFile } from "../utils/deletefile.js";

const nombrePhotosAttr = [
  db.literal(
    "(SELECT COUNT(*) FROM photos_galerie AS p WHERE p.idGalerie = Galerie.idGalerie)",
  ),
  "nombrePhotos",
];

const fichiersEnvoyes = (req) => req.files?.images || [];

const dateValide = (valeur) =>
  typeof valeur === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valeur);

// Slug unique : suffixe numérique si le titre existe déjà.
const genererSlug = async (titre, idIgnore = null) => {
  const base = slugify(titre, { lower: true, strict: true }) || "galerie";
  for (let n = 1; ; n += 1) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const existant = await Galerie.findOne({
      where: { slug },
      attributes: ["idGalerie"],
    });
    if (!existant || existant.idGalerie === idIgnore) return slug;
  }
};

const ajouterPhotos = async (idGalerie, fichiers, ordreDepart = 0) =>
  PhotoGalerie.bulkCreate(
    fichiers.map((f, i) => ({
      idGalerie,
      chemin: f.path,
      ordre: ordreDepart + i,
    })),
  );

// Public : albums publiés, du plus récent au plus ancien.
export const getGaleriesPublic = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const { count, rows } = await Galerie.findAndCountAll({
      where: { statut: "publie" },
      attributes: { include: [nombrePhotosAttr] },
      order: [
        ["dateActivite", "DESC"],
        ["createdAt", "DESC"],
      ],
      limit,
      offset: (page - 1) * limit,
    });

    return res.status(200).json({
      total: count,
      page,
      pages: Math.ceil(count / limit),
      galeries: rows,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des galeries :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Public : un album publié avec ses photos.
export const getGalerieBySlug = async (req, res, next) => {
  try {
    const galerie = await Galerie.findOne({
      where: { slug: req.params.slug, statut: "publie" },
      include: [{ model: PhotoGalerie, as: "photos" }],
      order: [
        [{ model: PhotoGalerie, as: "photos" }, "ordre", "ASC"],
        [{ model: PhotoGalerie, as: "photos" }, "idPhoto", "ASC"],
      ],
    });
    if (!galerie) {
      return res.status(404).json({ message: "Galerie introuvable" });
    }
    return res.status(200).json({ galerie });
  } catch (error) {
    console.error("Erreur lors de la récupération de la galerie :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Admin : tous les albums.
export const getGaleries = async (req, res, next) => {
  try {
    const galeries = await Galerie.findAll({
      attributes: { include: [nombrePhotosAttr] },
      include: [
        {
          model: Utilisateur,
          as: "createur",
          attributes: ["idUtilisateur", "nomComplet"],
        },
      ],
      order: [
        ["dateActivite", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
    return res.status(200).json({ nombre: galeries.length, galeries });
  } catch (error) {
    console.error("Erreur lors de la récupération des galeries :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getGalerieById = async (req, res, next) => {
  try {
    const galerie = await Galerie.findByPk(req.params.id, {
      include: [{ model: PhotoGalerie, as: "photos" }],
      order: [
        [{ model: PhotoGalerie, as: "photos" }, "ordre", "ASC"],
        [{ model: PhotoGalerie, as: "photos" }, "idPhoto", "ASC"],
      ],
    });
    if (!galerie) {
      return res.status(404).json({ message: "Galerie introuvable" });
    }
    return res.status(200).json({ galerie });
  } catch (error) {
    console.error("Erreur lors de la récupération de la galerie :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const createGalerie = async (req, res, next) => {
  const fichiers = fichiersEnvoyes(req);
  try {
    const { titre, description, dateActivite, lieu, statut } = req.body;

    if (!titre || !titre.trim()) {
      await Promise.all(fichiers.map((f) => deleteFile(f.path)));
      return res.status(400).json({ message: "Le titre est requis." });
    }

    const galerie = await Galerie.create({
      titre: titre.trim(),
      slug: await genererSlug(titre),
      description: description?.trim() || null,
      dateActivite: dateValide(dateActivite) ? dateActivite : null,
      lieu: lieu?.trim() || null,
      imageCouverture: fichiers[0]?.path || null,
      statut: statut === "publie" ? "publie" : "brouillon",
      createdBy: req.user?.idUtilisateur || null,
    });

    if (fichiers.length) await ajouterPhotos(galerie.idGalerie, fichiers);

    return res
      .status(201)
      .json({ message: "Galerie créée avec succès", data: galerie });
  } catch (error) {
    await Promise.all(fichiers.map((f) => deleteFile(f.path)));
    console.error("Erreur lors de la création de la galerie :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

/**
 * Mise à jour des infos + ajout de nouvelles photos (champ `images`).
 * `couverture` = idPhoto à utiliser comme image de couverture.
 */
export const updateGalerie = async (req, res, next) => {
  const fichiers = fichiersEnvoyes(req);
  try {
    const galerie = await Galerie.findByPk(req.params.id);
    if (!galerie) {
      await Promise.all(fichiers.map((f) => deleteFile(f.path)));
      return res.status(404).json({ message: "Galerie introuvable" });
    }

    const { titre, description, dateActivite, lieu, statut, couverture } =
      req.body;

    if (titre !== undefined && titre.trim() && titre.trim() !== galerie.titre) {
      galerie.titre = titre.trim();
      galerie.slug = await genererSlug(titre, galerie.idGalerie);
    }
    if (description !== undefined)
      galerie.description = description.trim() || null;
    if (dateActivite !== undefined)
      galerie.dateActivite = dateValide(dateActivite) ? dateActivite : null;
    if (lieu !== undefined) galerie.lieu = lieu.trim() || null;
    if (statut !== undefined)
      galerie.statut = statut === "publie" ? "publie" : "brouillon";

    if (fichiers.length) {
      const dernier = await PhotoGalerie.max("ordre", {
        where: { idGalerie: galerie.idGalerie },
      });
      await ajouterPhotos(galerie.idGalerie, fichiers, (dernier ?? -1) + 1);
      if (!galerie.imageCouverture) galerie.imageCouverture = fichiers[0].path;
    }

    if (couverture) {
      const photo = await PhotoGalerie.findOne({
        where: { idPhoto: couverture, idGalerie: galerie.idGalerie },
      });
      if (photo) galerie.imageCouverture = photo.chemin;
    }

    await galerie.save();

    return res
      .status(200)
      .json({ message: "Galerie mise à jour", data: galerie });
  } catch (error) {
    await Promise.all(fichiers.map((f) => deleteFile(f.path)));
    console.error("Erreur lors de la mise à jour de la galerie :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteGalerie = async (req, res, next) => {
  try {
    const galerie = await Galerie.findByPk(req.params.id, {
      include: [{ model: PhotoGalerie, as: "photos" }],
    });
    if (!galerie) {
      return res.status(404).json({ message: "Galerie introuvable" });
    }
    const chemins = galerie.photos.map((p) => p.chemin);
    await galerie.destroy();
    await Promise.all(chemins.map(deleteFile));
    return res.status(200).json({ message: "Galerie supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la galerie :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const updatePhotoGalerie = async (req, res, next) => {
  try {
    const photo = await PhotoGalerie.findOne({
      where: { idPhoto: req.params.idPhoto, idGalerie: req.params.id },
    });
    if (!photo) {
      return res.status(404).json({ message: "Photo introuvable" });
    }
    const { legende, ordre } = req.body;
    if (legende !== undefined)
      photo.legende = String(legende).trim().slice(0, 255) || null;
    if (ordre !== undefined) photo.ordre = Number(ordre) || 0;
    await photo.save();
    return res.status(200).json({ message: "Photo mise à jour", data: photo });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la photo :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deletePhotoGalerie = async (req, res, next) => {
  try {
    const galerie = await Galerie.findByPk(req.params.id);
    const photo = await PhotoGalerie.findOne({
      where: { idPhoto: req.params.idPhoto, idGalerie: req.params.id },
    });
    if (!galerie || !photo) {
      return res.status(404).json({ message: "Photo introuvable" });
    }

    await photo.destroy();
    await deleteFile(photo.chemin);

    // La couverture supprimée est remplacée par la première photo restante.
    if (galerie.imageCouverture === photo.chemin) {
      const suivante = await PhotoGalerie.findOne({
        where: { idGalerie: galerie.idGalerie },
        order: [
          ["ordre", "ASC"],
          ["idPhoto", "ASC"],
        ],
      });
      galerie.imageCouverture = suivante?.chemin || null;
      await galerie.save();
    }

    return res.status(200).json({ message: "Photo supprimée" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la photo :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
