import { Router } from "express";
import {
  getPrieresDuJour,
  createDemandePriere,
  getDemandesPriere,
  createIntentionEquipe,
  updateDemandePriere,
  deleteDemandePriere,
} from "../controllers/priere.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Prieres
 *   description: Table de prière — intentions du jour et demandes des visiteurs
 */

const priereRouter = Router();

/**
 * @swagger
 * /api/prieres/aujourdhui:
 *   get:
 *     summary: Intentions planifiées pour aujourd'hui (public)
 *     description: N'expose que les intentions partagées (prénom + texte). Les autres sont seulement comptées.
 *     tags: [Prieres]
 *     responses:
 *       200:
 *         description: "{ date, total, confidentielles, intentions: [{ idDemandePriere, prenom, texte, source }] }"
 */
priereRouter.get("/aujourdhui", getPrieresDuJour);

/**
 * @swagger
 * /api/prieres:
 *   post:
 *     summary: Déposer une demande de prière (public)
 *     tags: [Prieres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [intention]
 *             properties:
 *               prenom: { type: string, maxLength: 100 }
 *               email: { type: string, format: email }
 *               intention: { type: string, minLength: 5, maxLength: 2000 }
 *               partagePublic: { type: boolean, description: "Accord pour afficher l'intention sur le site" }
 *     responses:
 *       201: { description: Demande reçue }
 *       400: { description: Données invalides }
 *   get:
 *     summary: Lister les demandes (admin, éditeur)
 *     tags: [Prieres]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: statut, schema: { type: string, enum: [nouvelle, validee, archivee] } }
 *       - { in: query, name: date, schema: { type: string, format: date } }
 *       - { in: query, name: q, schema: { type: string } }
 *     responses:
 *       200: { description: "{ nombre, parStatut, aujourdhui, demandes }" }
 */
priereRouter.post("/", createDemandePriere);
priereRouter.get(
  "/",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  getDemandesPriere,
);

/**
 * @swagger
 * /api/prieres/equipe:
 *   post:
 *     summary: Ajouter une intention de l'équipe (admin, éditeur)
 *     tags: [Prieres]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [intention]
 *             properties:
 *               intention: { type: string }
 *               datePriere: { type: string, format: date, description: "Par défaut : aujourd'hui" }
 *     responses:
 *       201: { description: Intention ajoutée }
 */
priereRouter.post(
  "/equipe",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  createIntentionEquipe,
);

/**
 * @swagger
 * /api/prieres/{id}:
 *   put:
 *     summary: Valider, planifier, reformuler ou archiver une demande
 *     tags: [Prieres]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut: { type: string, enum: [nouvelle, validee, archivee] }
 *               datePriere: { type: string, format: date, nullable: true }
 *               intentionPublique: { type: string, nullable: true }
 *               prenom: { type: string, nullable: true }
 *     responses:
 *       200: { description: Demande mise à jour }
 *   delete:
 *     summary: Supprimer une demande
 *     tags: [Prieres]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Demande supprimée }
 */
priereRouter.put(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  updateDemandePriere,
);
priereRouter.delete(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  deleteDemandePriere,
);

export default priereRouter;
