import multer from "multer";
import fs from "fs";
import path from "path";

const dossierMap = {
  avatar: "uploads/avatars",
  image: "uploads/images",
  images: "uploads/galeries",
  autre: "uploads/autres",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dossier = dossierMap[file.fieldname] || "uploads/autres";
    if (!fs.existsSync(dossier)) {
      fs.mkdirSync(dossier, { recursive: true });
    }
    cb(null, dossier);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const IMAGES_AUTORISEES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const filtreImages = (req, file, cb) => {
  if (IMAGES_AUTORISEES.includes(file.mimetype)) return cb(null, true);
  cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
};

/**
 * Enveloppe un middleware Multer d'images : les erreurs de validation
 * renvoient un 400 lisible au lieu d'une erreur serveur.
 */
const avecErreursLisibles = (middleware, { tailleMo, maxFichiers }) => {
  const messages = {
    LIMIT_FILE_SIZE:
      maxFichiers > 1
        ? `Chaque image doit faire ${tailleMo} Mo maximum.`
        : `L'image doit faire ${tailleMo} Mo maximum.`,
    LIMIT_FILE_COUNT: `${maxFichiers} image(s) maximum par envoi.`,
    LIMIT_UNEXPECTED_FILE:
      "Seules les images JPG, PNG, WEBP ou GIF sont acceptées.",
  };
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (!err) return next();
      const message =
        err instanceof multer.MulterError
          ? messages[err.code] || "Fichier refusé."
          : "Erreur lors de l'envoi de l'image.";
      return res.status(400).json({ message });
    });
  };
};

/** Images de galerie (champ `images`) : 10 Mo max par fichier, 30 max. */
export const uploadImagesGalerie = avecErreursLisibles(
  multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024, files: 30 },
    fileFilter: filtreImages,
  }).fields([{ name: "images", maxCount: 30 }]),
  { tailleMo: 10, maxFichiers: 30 },
);

/** Photo de profil (champ `avatar`) : une image, 5 Mo max. */
export const uploadAvatar = avecErreursLisibles(
  multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: filtreImages,
  }).single("avatar"),
  { tailleMo: 5, maxFichiers: 1 },
);

const upload = multer({ storage });

export default upload;
