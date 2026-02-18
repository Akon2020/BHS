import { Router } from "express";
import {
  getAllCommentaires,
  getCommentairesParBlog,
  createCommentaire,
  deleteCommentaire,
  modererCommentaire,
  getReponses,
} from "../controllers/commentaire.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const commentaireRouter = Router();

commentaireRouter.get("/", getAllCommentaires);
commentaireRouter.get("/blog/:idBlog", getCommentairesParBlog);
commentaireRouter.get("/reponses/:id", getReponses);
commentaireRouter.post("/add", createCommentaire);
commentaireRouter.patch(
  "/moderate/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  modererCommentaire,
);
commentaireRouter.delete(
  "/delete/:id",
  authenticationJWT,
  authorizeRoles("admin", "editeur", "membre"),
  deleteCommentaire,
);

export default commentaireRouter;
