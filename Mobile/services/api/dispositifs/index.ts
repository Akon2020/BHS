import { api } from "../client";

export type Plateforme = "ios" | "android";

/** Enregistre le dispositif courant pour les notifications push. */
export const enregistrerDispositif = async (
  token: string,
  plateforme: Plateforme,
): Promise<void> => {
  await api.post("/api/dispositifs/enregistrer", { token, plateforme });
};

/** Désactive le dispositif (déconnexion / arrêt des push). */
export const desenregistrerDispositif = async (token: string): Promise<void> => {
  await api.delete("/api/dispositifs/desenregistrer", { data: { token } });
};
