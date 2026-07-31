import { Router } from "express";
import {
  getAllEvents,
  getSingleEvent,
  getEventBySlug,
  getEventsByDate,
  getAllEventsAdmin,
  getSingleEventAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
  inscrireAUnEvenement,
  registerToEvent,
  inscrireVisiteurParAdmin,
  renvoyerTicketInscription,
  supprimerDoublonsInscriptions,
  supprimerDoublonsSelectionnes,
  mettreAJourPaiement,
  getStatsFinancieresEvenement,
  exporterFinancesEvenement,
} from "../controllers/evenement.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
  optionalAuthJWT,
} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { normalizeUploadPaths } from "../utils/normalizeUploadPaths.js";

const evenementRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Événements
 *   description: API pour gérer les événements
 */

/**
 * @swagger
 * /api/evenements:
 *   get:
 *     summary: Récupérer tous les événements publiés (pagination)
 *     tags: [Événements]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Numéro de la page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des événements récupérée avec succès
 */
evenementRouter.get("/", getAllEvents);

/**
 * @swagger
 * /api/evenements/admin:
 *   get:
 *     summary: Récupérer tous les événements (admin, tous statuts)
 *     tags: [Événements]
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrer par statut (publie, brouillon, annule, etc.)
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Recherche par titre ou lieu
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Date de début
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Date de fin
 *     responses:
 *       200:
 *         description: Liste des événements (admin) récupérée
 */
evenementRouter.get(
  "/admin",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getAllEventsAdmin,
);

/**
 * @swagger
 * /api/evenements/{id}:
 *   get:
 *     summary: Récupérer un événement par ID
 *     tags: [Événements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Événement trouvé
 *       404:
 *         description: Événement non trouvé
 */
evenementRouter.get(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getSingleEvent,
);

/**
 * @swagger
 * /api/evenements/slug/{slug}:
 *   get:
 *     summary: Récupérer un événement par son slug
 *     tags: [Événements]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug de l'événement
 *     responses:
 *       200:
 *         description: Événement trouvé
 *       404:
 *         description: Événement non trouvé
 */
evenementRouter.get("/slug/:slug", getEventBySlug);

/**
 * @swagger
 * /api/evenements/date/{date}:
 *   get:
 *     summary: Récupérer les événements à une date donnée
 *     tags: [Événements]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de l'événement (format AAAA-MM-JJ)
 *     responses:
 *       200:
 *         description: Événements trouvés
 */
evenementRouter.get("/date/:date", getEventsByDate);

/**
 * @swagger
 * /api/evenements/admin/{id}:
 *   get:
 *     summary: Récupérer un événement avec la liste complète des inscrits (admin)
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 */
evenementRouter.get(
  "/admin/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getSingleEventAdmin,
);

/**
 * @swagger
 * /api/evenements/add:
 *   post:
 *     summary: Créer un nouvel événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - description
 *               - dateEvenement
 *               - heureDebut
 *               - heureFin
 *               - lieu
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               dateEvenement:
 *                 type: string
 *                 format: date
 *               heureDebut:
 *                 type: string
 *               heureFin:
 *                 type: string
 *               lieu:
 *                 type: string
 *               dateLimiteInscription:
 *                 type: string
 *                 format: date-time
 *                 description: Date/heure limite d'inscription (ISO). Passé ce délai, les inscriptions publiques sont fermées.
 *               nombrePlaces:
 *                 type: integer
 *               statut:
 *                 type: string
 *               imageEvenement:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Événement créé avec succès
 */
evenementRouter.post(
  "/add",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  upload.single("imageEvenement"),
  normalizeUploadPaths,
  createEvent,
);

/**
 * @swagger
 * /api/evenements/update/{id}:
 *   patch:
 *     summary: Mettre à jour un événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               dateEvenement:
 *                 type: string
 *                 format: date
 *               heureDebut:
 *                 type: string
 *               heureFin:
 *                 type: string
 *               lieu:
 *                 type: string
 *               dateLimiteInscription:
 *                 type: string
 *                 format: date-time
 *                 description: Date/heure limite d'inscription (ISO). Chaîne vide pour effacer.
 *               nombrePlaces:
 *                 type: integer
 *               statut:
 *                 type: string
 *               imageEvenement:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Événement mis à jour avec succès
 *       404:
 *         description: Événement non trouvé
 */
evenementRouter.patch(
  "/update/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  upload.single("imageEvenement"),
  normalizeUploadPaths,
  updateEvent,
);

/**
 * @swagger
 * /api/evenements/delete/{id}:
 *   delete:
 *     summary: Supprimer un événement
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement à supprimer
 *     responses:
 *       200:
 *         description: Événement supprimé/annulé avec succès
 *       404:
 *         description: Événement non trouvé
 */
evenementRouter.delete(
  "/delete/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  deleteEvent,
);

/**
 * @swagger
 * /api/evenements/{id}/inscription:
 *   post:
 *     summary: S'inscrire à un événement (connecté ou visiteur)
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomComplet:
 *                 type: string
 *               email:
 *                 type: string
 *               sexe:
 *                 type: string
 *               telephone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inscription réussie
 */
evenementRouter.post(
  "/:id/inscription",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  inscrireAUnEvenement,
);

/**
 * @swagger
 * /api/evenements/{id}/inscription/visiteur:
 *   post:
 *     summary: Ajouter un visiteur à un événement (admin)
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 */
evenementRouter.post(
  "/:id/inscription/visiteur",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  inscrireVisiteurParAdmin,
);

/**
 * @swagger
 * /api/evenements/{id}/inscriptions/{inscriptionId}/renvoyer-ticket:
 *   post:
 *     summary: Renvoyer le ticket PDF d'une inscription
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 */
evenementRouter.post(
  "/:id/inscriptions/:inscriptionId/renvoyer-ticket",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  renvoyerTicketInscription,
);

/**
 * @swagger
 * /api/evenements/{id}/inscriptions/doublons:
 *   delete:
 *     summary: Supprimer les inscriptions en doublon par email
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 */
evenementRouter.delete(
  "/:id/inscriptions/doublons",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  supprimerDoublonsInscriptions,
);

evenementRouter.post(
  "/:id/inscriptions/doublons/supprimer-selection",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  supprimerDoublonsSelectionnes,
);

/**
 * @swagger
 * /api/evenements/slug/{slug}/inscription:
 *   post:
 *     summary: S'inscrire à un événement (connecté ou visiteur)
 *     tags: [Événements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomComplet:
 *                 type: string
 *               email:
 *                 type: string
 *               sexe:
 *                 type: string
 *               telephone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inscription réussie
 */
evenementRouter.post(
  "/slug/:slug/inscription",
  optionalAuthJWT,
  upload.any(),
  registerToEvent,
);

/**
 * @swagger
 * /api/evenements/{id}/inscriptions/{inscriptionId}/paiement:
 *   patch:
 *     summary: Mettre à jour le statut de paiement d'une inscription (admin)
 *     tags: [Evenements]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: inscriptionId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statutPaiement: { type: string, enum: [non_paye, partiel, paye, accepte_non_paye] }
 *               montantPaye: { type: number }
 *     responses:
 *       200: { description: Paiement mis à jour (billet + reçu envoyés si payé) }
 */
evenementRouter.patch(
  "/:id/inscriptions/:inscriptionId/paiement",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  mettreAJourPaiement,
);

/**
 * @swagger
 * /api/evenements/{id}/finances:
 *   get:
 *     summary: Statistiques financières d'un événement (admin)
 *     tags: [Evenements]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Attendu, encaissé, reste, répartition par statut }
 */
evenementRouter.get(
  "/:id/finances",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  getStatsFinancieresEvenement,
);

/**
 * @swagger
 * /api/evenements/{id}/finances/export:
 *   get:
 *     summary: Export PDF du rapport financier d'un événement (admin)
 *     tags: [Evenements]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Fichier PDF }
 */
evenementRouter.get(
  "/:id/finances/export",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  exporterFinancesEvenement,
);

export default evenementRouter;
