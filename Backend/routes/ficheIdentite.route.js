import { Router } from "express";
import {
  approuverFicheIdentite,
  createFicheIdentite,
  deleteFicheIdentite,
  getAllFichesIdentites,
  getFicheIdentiteById,
  updateFicheIdentite,
} from "../controllers/ficheIdentite.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Identites
 *   description: API pour gérer les fiches d'identité
 */

const ficheIdentiteRouter = Router();

/**
 * @swagger
 * /api/identites:
 *   get:
 *     summary: Récupérer toutes les fiches d'identité
 *     tags: [Identites]
 *     responses:
 *       200:
 *         description: Liste des fiches d'identité récupérée avec succès
 */
ficheIdentiteRouter.get(
  "/",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getAllFichesIdentites,
);

/**
 * @swagger
 * /api/identites/{id}:
 *   get:
 *     summary: Récupérer une fiche d'identité par ID
 *     tags: [Identites]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la fiche d'identité
 *     responses:
 *       200:
 *         description: Fiche trouvée
 *       404:
 *         description: Fiche non trouvée
 */
ficheIdentiteRouter.get(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getFicheIdentiteById,
);

/**
 * @swagger
 * /api/identites/add:
 *   post:
 *     summary: Soumettre une fiche d'identité
 *     tags: [Identites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Fiche d'identité soumise avec succès
 *       400:
 *         description: Données invalides ou incomplètes
 */
ficheIdentiteRouter.post("/add", createFicheIdentite);

/**
 * @swagger
 * /api/identites/update/{id}:
 *   patch:
 *     summary: Mettre à jour une fiche d'identité
 *     tags: [Identites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la fiche d'identité
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fiche mise à jour avec succès
 *       404:
 *         description: Fiche non trouvée
 */
ficheIdentiteRouter.patch(
  "/update/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  updateFicheIdentite,
);

/**
 * @swagger
 * /api/identites/approuver/{id}:
 *   patch:
 *     summary: Approuver une fiche d'identité
 *     tags: [Identites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la fiche d'identité
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fiche approuvée avec succès
 */
ficheIdentiteRouter.patch(
  "/approuver/:id",
  authenticationJWT,
  authorizeRoles("admin"),
  approuverFicheIdentite,
);

/**
 * @swagger
 * /api/identites/delete/{id}:
 *   delete:
 *     summary: Supprimer une fiche d'identité
 *     tags: [Identites]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la fiche d'identité à supprimer
 *     responses:
 *       200:
 *         description: Fiche supprimée avec succès
 *       404:
 *         description: Fiche non trouvée
 */
ficheIdentiteRouter.delete(
  "/delete/:id",
  authenticationJWT,
  authorizeRoles("admin"),
  deleteFicheIdentite,
);

export default ficheIdentiteRouter;
