import { Router } from "express";
import {
  getEntrees,
  createEntree,
  updateEntree,
  deleteEntree,
} from "../controllers/calendrier.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Calendrier
 *   description: Entrées de calendrier saisies manuellement
 */

const calendrierRouter = Router();
const staff = [authenticationJWT, authorizeRoles("admin", "editeur")];

/**
 * @swagger
 * /api/calendrier:
 *   get:
 *     summary: Lister les entrées de calendrier (admin/éditeur)
 *     tags: [Calendrier]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des entrées }
 *   post:
 *     summary: Ajouter une entrée de calendrier (admin/éditeur)
 *     tags: [Calendrier]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Entrée créée }
 */
calendrierRouter.get("/", ...staff, getEntrees);
calendrierRouter.post("/", ...staff, createEntree);

/**
 * @swagger
 * /api/calendrier/{id}:
 *   put:
 *     summary: Mettre à jour une entrée de calendrier (admin/éditeur)
 *     tags: [Calendrier]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Entrée mise à jour }
 *   delete:
 *     summary: Supprimer une entrée de calendrier (admin/éditeur)
 *     tags: [Calendrier]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Entrée supprimée }
 */
calendrierRouter.put("/:id", ...staff, updateEntree);
calendrierRouter.delete("/:id", ...staff, deleteEntree);

export default calendrierRouter;
