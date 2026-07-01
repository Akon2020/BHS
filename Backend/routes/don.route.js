import { Router } from "express";
import {
  createDon,
  getDons,
  getDonById,
  updateDonStatut,
  deleteDon,
} from "../controllers/don.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Dons
 *   description: Intentions de don (formulaire public + suivi admin)
 */

const donRouter = Router();

/**
 * @swagger
 * /api/dons:
 *   post:
 *     summary: Enregistrer une intention de don (public)
 *     tags: [Dons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, email, moyen]
 *             properties:
 *               nom: { type: string }
 *               email: { type: string, format: email }
 *               montant: { type: number }
 *               devise: { type: string }
 *               moyen: { type: string, enum: [carte, virement, mobile] }
 *               message: { type: string }
 *     responses:
 *       201: { description: Intention enregistrée }
 *   get:
 *     summary: Lister les intentions de don (admin)
 *     tags: [Dons]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des dons }
 */
donRouter.post("/", createDon);
donRouter.get(
  "/",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  getDons,
);

/**
 * @swagger
 * /api/dons/{id}:
 *   get:
 *     summary: Récupérer un don
 *     tags: [Dons]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Don }
 *   patch:
 *     summary: Mettre à jour le statut d'un don (annonce/confirme)
 *     tags: [Dons]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Statut mis à jour }
 *   delete:
 *     summary: Supprimer un don
 *     tags: [Dons]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Don supprimé }
 */
donRouter.get(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  getDonById,
);
donRouter.patch(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  updateDonStatut,
);
donRouter.delete(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin"),
  deleteDon,
);

export default donRouter;
