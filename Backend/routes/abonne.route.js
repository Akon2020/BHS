import { Router } from "express";
import {
  deleteAbonne,
  getAllAbonnes,
  getAllActifAbonnes,
  getSingleAbonne,
  subscribeNewsletter,
  updateAbonne,
} from "../controllers/abonne.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Abonnes
 *   description: API pour gérer les abonnées à la newsletter
 */

const abonneRouter = Router();

/**
 * @swagger
 * /api/abonnes:
 *   get:
 *     summary: Récupérer tous les abonnés à la newsletter
 *     tags: [Abonnes]
 *     responses:
 *       200:
 *         description: Liste des abonnés récupérée avec succès
 */
abonneRouter.get(
  "/",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getAllAbonnes,
);

/**
 * @swagger
 * /api/abonnes/actifs:
 *   get:
 *     summary: Récupérer tous les abonnés actifs à la newsletter
 *     tags: [Abonnes]
 *     responses:
 *       200:
 *         description: Liste des abonnés récupérée avec succès
 */
abonneRouter.get(
  "/actifs",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getAllActifAbonnes,
);

/**
 * @swagger
 * /api/abonnes/{id}:
 *   get:
 *     summary: Récupérer un abonné et son historique de réceptions
 *     tags: [Abonnes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Abonné récupéré avec succès
 *       404:
 *         description: Abonné introuvable
 */
abonneRouter.get(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getSingleAbonne,
);

/**
 * @swagger
 * /api/abonnes/subscribe:
 *   post:
 *     summary: Envoyer un nouveau message de contact
 *     tags: [Abonnes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomComplet
 *               - email
 *             properties:
 *               nomComplet:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Abonné(e) enregisté(e) avec succès
 */
abonneRouter.post("/subscribe", subscribeNewsletter);

/**
 * @swagger
 * /api/abonnes/update/{id}:
 *   patch:
 *     summary: Modifier un abonné
 *     tags: [Abonnes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Abonné mis à jour avec succès
 *       404:
 *         description: Abonné introuvable
 */
abonneRouter.patch(
  "/update/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  updateAbonne,
);

/**
 * @swagger
 * /api/abonnes/delete/{id}:
 *   delete:
 *     summary: Supprimer un abonné
 *     tags: [Abonnes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Abonné supprimé avec succès
 *       404:
 *         description: Abonné introuvable
 */
abonneRouter.delete(
  "/delete/:id",
  authenticationJWT,
  authorizeRoles("admin"),
  deleteAbonne,
);

export default abonneRouter;
