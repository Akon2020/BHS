import { Router } from "express";
import {
  getTemoignages,
  getTemoignagesPublic,
  getTemoignageById,
  createTemoignage,
  updateTemoignage,
  deleteTemoignage,
} from "../controllers/temoignage.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { normalizeUploadPaths } from "../utils/normalizeUploadPaths.js";

/**
 * @swagger
 * tags:
 *   name: Temoignages
 *   description: Témoignages affichés sur le site public
 */

const temoignageRouter = Router();

/**
 * @swagger
 * /api/temoignages/public:
 *   get:
 *     summary: Lister les témoignages publiés (public)
 *     tags: [Temoignages]
 *     responses:
 *       200: { description: Liste des témoignages publiés }
 */
temoignageRouter.get("/public", getTemoignagesPublic);

/**
 * @swagger
 * /api/temoignages:
 *   get:
 *     summary: Lister tous les témoignages (admin)
 *     tags: [Temoignages]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des témoignages }
 *   post:
 *     summary: Créer un témoignage
 *     tags: [Temoignages]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Témoignage créé }
 */
temoignageRouter.get(
  "/",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  getTemoignages,
);
temoignageRouter.post(
  "/",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  upload.single("image"),
  normalizeUploadPaths,
  createTemoignage,
);

/**
 * @swagger
 * /api/temoignages/{id}:
 *   get:
 *     summary: Récupérer un témoignage
 *     tags: [Temoignages]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Témoignage }
 *   put:
 *     summary: Mettre à jour un témoignage
 *     tags: [Temoignages]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Témoignage mis à jour }
 *   delete:
 *     summary: Supprimer un témoignage
 *     tags: [Temoignages]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Témoignage supprimé }
 */
temoignageRouter.get(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  getTemoignageById,
);
temoignageRouter.put(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  upload.single("image"),
  normalizeUploadPaths,
  updateTemoignage,
);
temoignageRouter.delete(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  deleteTemoignage,
);

export default temoignageRouter;
