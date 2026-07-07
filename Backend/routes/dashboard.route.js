import { Router } from "express";
import { dashboard } from "../controllers/dashboard.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: API pour le tableau de bord administrateur
 */

const dashboardRouter = Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Récupérer les statistiques du tableau de bord
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques du dashboard récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: number
 *                     data:
 *                       type: array
 *                 abonnes:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: number
 *                     data:
 *                       type: array
 *                 evenements:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: number
 *                     data:
 *                       type: array
 *                 blogs:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: number
 *                     data:
 *                       type: array
 *                 rendezVous:
 *                   type: object
 *                   description: Prochains rendez-vous + nombre en attente
 *                 anniversaires:
 *                   type: object
 *                   description: Anniversaires à venir (prochaine occurrence)
 *                 taches:
 *                   type: object
 *                   description: Compteurs (à faire / en cours) + prochaines échéances
 *                 pointage:
 *                   type: object
 *                   description: Sessions et heures pointées du mois en cours
 *                 dons:
 *                   type: object
 *                   description: Dons récents + total confirmé par devise
 *                 finances:
 *                   type: object
 *                   description: Inscriptions événements + encaissé par devise
 *       500:
 *         description: Erreur serveur
 */
dashboardRouter.get(
  "/",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  dashboard,
);

export default dashboardRouter;
