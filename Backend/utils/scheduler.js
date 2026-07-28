import cron from "node-cron";
import { verifierAnniversaires } from "../controllers/anniversaire.controller.js";
import { verifierRappelsTaches } from "../controllers/tache.controller.js";

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

  // Chaque jour à 07:30 (Africa/Lubumbashi) : rappels des tâches à échéance.
  cron.schedule(
    "30 7 * * *",
    async () => {
      try {
        const resume = await verifierRappelsTaches();
        console.log("Rappels tâches :", resume);
      } catch (e) {
        console.error("Erreur planificateur tâches :", e.message);
      }
    },
    { timezone: "Africa/Lubumbashi" },
  );

  console.log(
    "Planificateur démarré (anniversaires 07:00 · tâches 07:30 · Africa/Lubumbashi)",
  );
};
