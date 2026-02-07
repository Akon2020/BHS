import { Router } from "express";
import { getAllAbonnes, getAllActifAbonnes, subscribeNewsletter } from "../controllers/abonne.controller.js";

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
abonneRouter.get("/", getAllAbonnes);

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
abonneRouter.get("/actifs", getAllActifAbonnes);

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

export default abonneRouter;
