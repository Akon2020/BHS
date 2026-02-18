import { Router } from "express";
import {
  createNewsletter,
  getAllNewsletters,
  updateNewsletter,
  sendNewsletter,
  getNewsletterStats,
  deleteNewsletter,
  getSingleNewsletter,
} from "../controllers/newsletter.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Newsletters
 *   description: API pour la gestion des newsletters
 */

const newsletterRouter = Router();

/**
 * @swagger
 * /api/newsletters:
 *   get:
 *     summary: Récupérer toutes les newsletters
 *     tags: [Newsletters]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [brouillon, programme, envoye]
 *     responses:
 *       200:
 *         description: Liste des newsletters
 */
newsletterRouter.get(
  "/",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getAllNewsletters,
);

/**
 * @swagger
 * /api/newsletters/{id}:
 *   get:
 *     summary: Détails d'une newsletter
 *     tags: [Newsletters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de la newsletter
 *       404:
 *         description: Newsletter introuvable
 */
newsletterRouter.get(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getSingleNewsletter,
);

/**
 * @swagger
 * /api/newsletters/{id}/stats:
 *   get:
 *     summary: Statistiques d'envoi d'une newsletter
 *     tags: [Newsletters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
newsletterRouter.get(
  "/:id/stats",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getNewsletterStats,
);

/**
 * @swagger
 * /api/newsletters:
 *   post:
 *     summary: Créer une nouvelle newsletter
 *     tags: [Newsletters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titreInterne
 *               - objetMail
 *               - contenu
 *               - writedBy
 *             properties:
 *               titreInterne:
 *                 type: string
 *               objetMail:
 *                 type: string
 *               contenu:
 *                 type: string
 *               statut:
 *                 type: string
 *                 enum: [brouillon, programme]
 *               dateProgrammee:
 *                 type: string
 *                 format: date-time
 *               writedBy:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Newsletter créée avec succès
 */
newsletterRouter.post(
  "/",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  createNewsletter,
);

/**
 * @swagger
 * /api/newsletters/{id}/send:
 *   post:
 *     summary: Envoyer une newsletter
 *     tags: [Newsletters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Newsletter envoyée avec succès
 */
newsletterRouter.post(
  "/:id/send",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  sendNewsletter,
);

/**
 * @swagger
 * /api/newsletters/{id}:
 *   put:
 *     summary: Mettre à jour une newsletter
 *     tags: [Newsletters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Newsletter mise à jour
 */
newsletterRouter.put(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  updateNewsletter,
);

/**
 * @swagger
 * /api/newsletters/{id}:
 *   delete:
 *     summary: Supprimer une newsletter
 *     tags: [Newsletters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Newsletter supprimée
 */
newsletterRouter.delete(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  deleteNewsletter,
);

export default newsletterRouter;
