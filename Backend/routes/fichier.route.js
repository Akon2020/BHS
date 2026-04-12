import { Router } from "express";
import {
  createFichier,
  deleteFichier,
  getAllFichiers,
  getPublicFichierBySlug,
  getPublicFichiers,
  getSingleFichier,
  updateFichier,
} from "../controllers/fichier.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const fichierRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Fichiers
 *   description: API de gestion des fichiers téléchargeables
 */

fichierRouter.get("/public", getPublicFichiers);
fichierRouter.get("/slug/:slug", getPublicFichierBySlug);

fichierRouter.get(
  "/",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getAllFichiers,
);

fichierRouter.get(
  "/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  getSingleFichier,
);

fichierRouter.post(
  "/add",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  upload.array("fichiers", 30),
  createFichier,
);

fichierRouter.patch(
  "/update/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  upload.array("fichiers", 30),
  updateFichier,
);

fichierRouter.delete(
  "/delete/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur"),
  deleteFichier,
);

export default fichierRouter;
