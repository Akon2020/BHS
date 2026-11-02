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

/**
 * Upload d'images de galerie (champ `images`) : formats image uniquement,
 * 10 Mo max par fichier, 30 fichiers max par requête. Les erreurs de
 * validation renvoient un 400 lisible au lieu d'une erreur serveur.
 */
const uploadImagesMulter = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 30 },
  fileFilter: (req, file, cb) => {
    if (IMAGES_AUTORISEES.includes(file.mimetype)) return cb(null, true);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  },
}).fields([{ name: "images", maxCount: 30 }]);

const MESSAGES_UPLOAD = {
  LIMIT_FILE_SIZE: "Chaque image doit faire 10 Mo maximum.",
  LIMIT_FILE_COUNT: "30 images maximum par envoi.",
  LIMIT_UNEXPECTED_FILE: "Seules les images JPG, PNG, WEBP ou GIF sont acceptées.",
};

export const uploadImagesGalerie = (req, res, next) => {
  uploadImagesMulter(req, res, (err) => {
    if (!err) return next();
    const message =
      err instanceof multer.MulterError
        ? MESSAGES_UPLOAD[err.code] || "Fichier refusé."
        : "Erreur lors de l'envoi des images.";
    return res.status(400).json({ message });
  });
};

const upload = multer({ storage });

export default upload;