import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import logger from "morgan";
import { PORT, HOST_URL } from "./config/env.js";
import { syncModels } from "./models/index.model.js";
import errorMiddleware, { errorLogs } from "./middlewares/error.middleware.js";
import { setupSwagger } from "./swagger.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/utilisateur.route.js";
import equipeRouter from "./routes/equipe.route.js";
import contactRouter from "./routes/contact.route.js";
import ficheIdentiteRouter from "./routes/ficheIdentite.route.js";
import categorieRouter from "./routes/categorie.route.js";
import blogRouter from "./routes/blog.route.js";
import commentaireRouter from "./routes/commentaire.route.js";
import evenementRouter from "./routes/evenement.route.js";
import abonneRouter from "./routes/abonne.route.js";
import newsletterRouter from "./routes/newsletter.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import fichierRouter from "./routes/fichier.route.js";
import messageEnvoyeRouter from "./routes/messageEnvoye.route.js";
import pointageRouter from "./routes/pointage.route.js";
import temoignageRouter from "./routes/temoignage.route.js";
import donRouter from "./routes/don.route.js";

const app = express();

// Sécurité des en-têtes HTTP.
// - CSP désactivée (sinon casse l'UI Swagger /api-docs).
// - CORP en "cross-origin" pour autoriser le front (autre sous-domaine) à charger
//   les fichiers servis depuis /uploads (images du blog, des événements, etc.).
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true, limit: "1024mb" }));
app.use(bodyParser.json({ limit: "1024mb" }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://burningheartihs.org",
      "https://api.burningheartihs.org",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

setupSwagger(app);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: `Checking BurningHeart API\n=> Passed successfully at ${new Date().toLocaleString("fr-FR")}`,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/equipes", equipeRouter);
app.use("/api/contacts", contactRouter);
app.use("/api/categories", categorieRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/commentaires", commentaireRouter);
app.use("/api/evenements", evenementRouter);
app.use("/api/abonnes", abonneRouter);
app.use("/api/newsletters", newsletterRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/identites", ficheIdentiteRouter);
app.use("/api/fichiers", fichierRouter);
app.use("/api/messages", messageEnvoyeRouter);
app.use("/api/pointages", pointageRouter);
app.use("/api/temoignages", temoignageRouter);
app.use("/api/dons", donRouter);

app.get("/error", errorLogs);
app.use(errorMiddleware);

app.listen(PORT, async (err) => {
  if (err) {
    console.log(`Une erreur s'est produite: ${err}`);
  } else {
    try {
      await syncModels();
      console.log(`Le serveur est lancé au http://localhost:${PORT}/`);
      console.log(`Documentation Swagger sur ${HOST_URL}/api-docs/`);
    } catch (error) {
      console.error("Erreur lors de la synchronisation des modèles:", error);
    }
  }
});

export default app;
