import { Router } from "express";
import {
  getAnniversaires,
  createAnniversaire,
  updateAnniversaire,
  deleteAnniversaire,
  declencherVerification,
} from "../controllers/anniversaire.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Anniversaires
 *   description: Anniversaires (alertes jour J + rappels)
 */

const anniversaireRouter = Router();
const admin = [authenticationJWT, authorizeRoles("admin", "editeur")];

/**
 * @swagger
 * /api/anniversaires:
 *   get:
 *     summary: Lister les anniversaires (admin)
 *     tags: [Anniversaires]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des anniversaires }
 *   post:
 *     summary: Ajouter un anniversaire (admin)
 *     tags: [Anniversaires]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Anniversaire créé }
 */
anniversaireRouter.get("/", ...admin, getAnniversaires);
anniversaireRouter.post("/", ...admin, createAnniversaire);

/**
 * @swagger
 * /api/anniversaires/verifier:
 *   post:
 *     summary: Déclencher manuellement la vérification des anniversaires (admin)
 *     tags: [Anniversaires]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Vérification exécutée }
 */
anniversaireRouter.post("/verifier", ...admin, declencherVerification);

/**
 * @swagger
 * /api/anniversaires/{id}:
 *   put:
 *     summary: Mettre à jour un anniversaire (admin)
 *     tags: [Anniversaires]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Anniversaire mis à jour }
 *   delete:
 *     summary: Supprimer un anniversaire (admin)
 *     tags: [Anniversaires]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Anniversaire supprimé }
 */
anniversaireRouter.put("/:id", ...admin, updateAnniversaire);
anniversaireRouter.delete("/:id", ...admin, deleteAnniversaire);

export default anniversaireRouter;
