import { DispositifPush } from "../models/index.model.js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const CHUNK = 100;

const isExpoToken = (t) =>
  typeof t === "string" &&
  (t.startsWith("ExponentPushToken[") || t.startsWith("ExpoPushToken["));

/**
 * Envoie un lot de notifications via le service Expo Push.
 * Désactive les tokens signalés comme non enregistrés (DeviceNotRegistered).
 * Non bloquant : les erreurs sont journalisées, jamais propagées.
 * @param {string[]} tokens
 * @param {{ titre: string, corps: string, donnees?: object }} payload
 */
export const envoyerPush = async (tokens, payload) => {
  const valides = [...new Set((tokens || []).filter(isExpoToken))];
  if (valides.length === 0) return;

  const messages = valides.map((to) => ({
    to,
    title: payload.titre,
    body: payload.corps,
    sound: "default",
    data: payload.donnees || {},
  }));

  for (let i = 0; i < messages.length; i += CHUNK) {
    const lot = messages.slice(i, i + CHUNK);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lot),
      });
      const json = await res.json().catch(() => null);
      const data = json?.data;
      if (Array.isArray(data)) {
        await Promise.all(
          data.map((ticket, idx) => {
            if (
              ticket?.status === "error" &&
              ticket?.details?.error === "DeviceNotRegistered"
            ) {
              return DispositifPush.update(
                { actif: false },
                { where: { token: lot[idx].to } },
              );
            }
            return null;
          }),
        );
      }
    } catch (err) {
      console.error("Erreur envoi Expo Push :", err.message);
    }
  }
};
