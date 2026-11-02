import { Router } from "express";
import {
  getGaleriesPublic,
  getGalerieBySlug,
  getGaleries,
  getGalerieById,
  createGalerie,
  updateGalerie,
  deleteGalerie,
  updatePhotoGalerie,
  deletePhotoGalerie,
} from "../controllers/galerie.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { uploadImagesGalerie } from "../middlewares/upload.middleware.js";
import { normalizeUploadPaths } from "../utils/normalizeUploadPaths.js";

/**
 * @swagger
 * tags:
 *   name: Galeries
 *   description: Albums photo des activités de Burning Heart
 */

const galerieRouter = Router();
const editeurs = [authenticationJWT, authorizeRoles("admin", "editeur")];

/**
 * @swagger
 * /api/galeries/public:
 *   get:
 *     summary: Albums publiés, du plus récent au plus ancien (public)
 *     tags: [Galeries]
 *     parameters:
 *       - { in: query, name: limit, schema: { type: integer, default: 12, maximum: 50 } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *     responses:
 *       200: { description: "{ total, page, pages, galeries: [... nombrePhotos] }" }
 */
galerieRouter.get("/public", getGaleriesPublic);

/**
 * @swagger
 * /api/galeries/public/{slug}:
 *   get:
 *     summary: Album publié avec ses photos (public)
 *     tags: [Galeries]
 *     parameters: [{ in: path, name: slug, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: "{ galerie: { ..., photos } }" }
 *       404: { description: Galerie introuvable }
 */
galerieRouter.get("/public/:slug", getGalerieBySlug);

/**
 * @swagger
 * /api/galeries:
 *   get:
 *     summary: Lister tous les albums (admin, éditeur)
 *     tags: [Galeries]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des albums }
 *   post:
 *     summary: Créer un album avec ses photos
 *     tags: [Galeries]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [titre]
 *             properties:
 *               titre: { type: string }
 *               description: { type: string }
 *               dateActivite: { type: string, format: date }
 *               lieu: { type: string }
 *               statut: { type: string, enum: [brouillon, publie] }
 *               images: { type: array, items: { type: string, format: binary }, description: "JPG/PNG/WEBP/GIF, 10 Mo max, 30 max" }
 *     responses:
 *       201: { description: Album créé }
 *       400: { description: Données ou fichiers invalides }
 */
galerieRouter.get("/", ...editeurs, getGaleries);
galerieRouter.post(
  "/",
  ...editeurs,
  uploadImagesGalerie,
  normalizeUploadPaths,
  createGalerie,
);

/**
 * @swagger
 * /api/galeries/{id}:
 *   get:
 *     summary: Récupérer un album avec ses photos (admin, éditeur)
 *     tags: [Galeries]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Album }
 *   put:
 *     summary: Modifier un album et/ou ajouter des photos
 *     tags: [Galeries]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titre: { type: string }
 *               description: { type: string }
 *               dateActivite: { type: string, format: date }
 *               lieu: { type: string }
 *               statut: { type: string, enum: [brouillon, publie] }
 *               couverture: { type: integer, description: "idPhoto à utiliser comme couverture" }
 *               images: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       200: { description: Album mis à jour }
 *   delete:
 *     summary: Supprimer un album et ses photos
 *     tags: [Galeries]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Album supprimé }
 */
galerieRouter.get("/:id", ...editeurs, getGalerieById);
galerieRouter.put(
  "/:id",
  ...editeurs,
  uploadImagesGalerie,
  normalizeUploadPaths,
  updateGalerie,
);
galerieRouter.delete("/:id", ...editeurs, deleteGalerie);

/**
 * @swagger
 * /api/galeries/{id}/photos/{idPhoto}:
 *   put:
 *     summary: Modifier la légende ou l'ordre d'une photo
 *     tags: [Galeries]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *       - { in: path, name: idPhoto, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               legende: { type: string }
 *               ordre: { type: integer }
 *     responses:
 *       200: { description: Photo mise à jour }
 *   delete:
 *     summary: Supprimer une photo d'un album
 *     tags: [Galeries]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *       - { in: path, name: idPhoto, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Photo supprimée }
 */
galerieRouter.put("/:id/photos/:idPhoto", ...editeurs, updatePhotoGalerie);
galerieRouter.delete("/:id/photos/:idPhoto", ...editeurs, deletePhotoGalerie);

export default galerieRouter;
