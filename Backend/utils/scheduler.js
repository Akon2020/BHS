import cron from "node-cron";
import { verifierAnniversaires } from "../controllers/anniversaire.controller.js";

// Démarre les tâches planifiées (rappels/alertes).
export const startScheduler = () => {
  // Chaque jour à 07:00 (fuseau Africa/Lubumbashi) : vérification des anniversaires.
  cron.schedule(
    "0 7 * * *",
    async () => {
      try {
        const resume = await verifierAnniversaires();
        console.log("Vérification anniversaires :", resume);
      } catch (e) {
        console.error("Erreur planificateur anniversaires :", e.message);
      }
    },
    { timezone: "Africa/Lubumbashi" },
  );

  console.log("Planificateur démarré (anniversaires : 07:00 Africa/Lubumbashi)");
};
