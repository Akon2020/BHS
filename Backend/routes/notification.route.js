import { Router } from "express";
import {
  getMesNotifications,
  marquerLue,
  marquerToutesLues,
  getPreferences,
  updatePreference,
  diffuser,
} from "../controllers/notification.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Centre de notifications in-app et préférences par catégorie
 */

const notificationRouter = Router();

notificationRouter.use(authenticationJWT);

/**
 * @swagger
 * /api/notifications/mes-notifications:
 *   get:
 *     summary: Lister ses notifications (paginées, filtre lu)
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: lu
 *         schema: { type: string, enum: ["true", "false"] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Liste des notifications }
 */
notificationRouter.get("/mes-notifications", getMesNotifications);

/**
 * @swagger
 * /api/notifications/preferences:
 *   get:
 *     summary: Récupérer ses préférences de notification par catégorie
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Préférences }
 *   patch:
 *     summary: Activer/désactiver une catégorie
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categorie, active]
 *             properties:
 *               categorie: { type: string }
 *               active: { type: boolean }
 *     responses:
 *       200: { description: Préférence mise à jour }
 */
notificationRouter.get("/preferences", getPreferences);
notificationRouter.patch("/preferences", updatePreference);

/**
 * @swagger
 * /api/notifications/lues-toutes:
 *   patch:
 *     summary: Marquer toutes ses notifications comme lues
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Toutes lues }
 */
notificationRouter.patch("/lues-toutes", marquerToutesLues);

/**
 * @swagger
 * /api/notifications/{id}/lue:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Notification lue }
 */
notificationRouter.patch("/:id/lue", marquerLue);

/**
 * @swagger
 * /api/notifications/diffuser:
 *   post:
 *     summary: Diffuser une notification à un segment (admin)
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, corps]
 *             properties:
 *               titre: { type: string }
 *               corps: { type: string }
 *               segment: { type: string, enum: [tous, membres, abonnes] }
 *               donnees: { type: object }
 *     responses:
 *       202: { description: Diffusion lancée }
 */
notificationRouter.post("/diffuser", authorizeRoles("admin"), diffuser);

export default notificationRouter;
