import { Router } from "express";
import {
  envoyerMessage,
  getMessagesEnvoyes,
  getMessageEnvoyeById,
  deleteMessageEnvoye,
} from "../controllers/messageEnvoye.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Boîte d'envoi admin (messages composés et envoyés par email)
 */

const messageEnvoyeRouter = Router();

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Lister les messages envoyés
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des messages envoyés
 */
messageEnvoyeRouter.get(
  "/",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  getMessagesEnvoyes,
);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Récupérer un message envoyé par ID
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message trouvé
 *       404:
 *         description: Message non trouvé
 */
messageEnvoyeRouter.get(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  getMessageEnvoyeById,
);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Composer et envoyer un nouveau message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destinataireEmail
 *               - sujet
 *               - message
 *             properties:
 *               destinataireEmail:
 *                 type: string
 *                 format: email
 *               destinataireNom:
 *                 type: string
 *               sujet:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message envoyé avec succès
 *       400:
 *         description: Champs manquants ou email invalide
 *       502:
 *         description: Échec de l'envoi de l'email
 */
messageEnvoyeRouter.post(
  "/",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  envoyerMessage,
);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Supprimer un message envoyé
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message supprimé
 *       404:
 *         description: Message non trouvé
 */
messageEnvoyeRouter.delete(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin"),
  deleteMessageEnvoye,
);

export default messageEnvoyeRouter;
