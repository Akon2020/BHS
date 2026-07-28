import { Router } from "express";
import {
  getTaches,
  getTacheById,
  createTache,
  updateTache,
  deleteTache,
  addCommentaire,
  deleteCommentaire,
  declencherRappelsTaches,
} from "../controllers/tache.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Taches
 *   description: Tâches / Kanban (staff interne)
 */

const tacheRouter = Router();
const staff = [authenticationJWT, authorizeRoles("admin", "editeur", "membre")];

/**
 * @swagger
 * /api/taches:
 *   get:
 *     summary: Lister les tâches (staff)
 *     tags: [Taches]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema: { type: string, enum: [a_faire, en_cours, fait] }
 *       - in: query
 *         name: assigne
 *         schema: { type: string, enum: [me] }
 *     responses:
 *       200: { description: Liste des tâches }
 *   post:
 *     summary: Créer une tâche (staff)
 *     tags: [Taches]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Tâche créée }
 */
tacheRouter.get("/", ...staff, getTaches);
tacheRouter.post("/", ...staff, createTache);

/**
 * @swagger
 * /api/taches/rappels:
 *   post:
 *     summary: Déclencher manuellement les rappels de tâches (admin)
 *     tags: [Taches]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Rappels exécutés }
 */
tacheRouter.post(
  "/rappels",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  declencherRappelsTaches,
);

/**
 * @swagger
 * /api/taches/{id}:
 *   get:
 *     summary: Détail d'une tâche avec commentaires (staff)
 *     tags: [Taches]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Détail de la tâche }
 *   put:
 *     summary: Mettre à jour une tâche (staff)
 *     tags: [Taches]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Tâche mise à jour }
 *   delete:
 *     summary: Supprimer une tâche (staff)
 *     tags: [Taches]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Tâche supprimée }
 */
tacheRouter.get("/:id", ...staff, getTacheById);
tacheRouter.put("/:id", ...staff, updateTache);
tacheRouter.delete("/:id", ...staff, deleteTache);

/**
 * @swagger
 * /api/taches/{id}/commentaires:
 *   post:
 *     summary: Ajouter un commentaire à une tâche (staff)
 *     tags: [Taches]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       201: { description: Commentaire ajouté }
 */
tacheRouter.post("/:id/commentaires", ...staff, addCommentaire);

/**
 * @swagger
 * /api/taches/{id}/commentaires/{commentaireId}:
 *   delete:
 *     summary: Supprimer un commentaire de tâche (auteur ou admin)
 *     tags: [Taches]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *       - { in: path, name: commentaireId, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Commentaire supprimé }
 */
tacheRouter.delete("/:id/commentaires/:commentaireId", ...staff, deleteCommentaire);

export default tacheRouter;
