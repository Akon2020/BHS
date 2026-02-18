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
