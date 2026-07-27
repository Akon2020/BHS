import { Router } from "express";
import {
  enregistrerDispositif,
  desenregistrerDispositif,
} from "../controllers/dispositif.controller.js";
import { optionalAuthJWT } from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Dispositifs
 *   description: Enregistrement des dispositifs mobiles pour les notifications push
 */

const dispositifRouter = Router();

/**
 * @swagger
 * /api/dispositifs/enregistrer:
 *   post:
 *     summary: Enregistrer un dispositif pour les notifications push (Expo)
 *     tags: [Dispositifs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, plateforme]
 *             properties:
 *               token: { type: string, example: "ExponentPushToken[xxxx]" }
 *               plateforme: { type: string, enum: [ios, android] }
 *     responses:
 *       201: { description: Dispositif enregistré }
 *       200: { description: Dispositif mis à jour }
 */
dispositifRouter.post("/enregistrer", optionalAuthJWT, enregistrerDispositif);

/**
 * @swagger
 * /api/dispositifs/desenregistrer:
 *   delete:
 *     summary: Désactiver un dispositif (déconnexion / arrêt des push)
 *     tags: [Dispositifs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200: { description: Dispositif désenregistré }
 */
dispositifRouter.delete("/desenregistrer", desenregistrerDispositif);

export default dispositifRouter;
