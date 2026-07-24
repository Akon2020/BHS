import * as LocalAuthentication from "expo-local-authentication";

/** Vrai si l'appareil dispose d'une biométrie configurée (empreinte / visage). */
export const isBiometricAvailable = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && enrolled;
};

/** Déclenche une authentification biométrique ; renvoie true si réussie. */
export const authenticateBiometric = async (
  reason = "Confirmez votre identité",
): Promise<boolean> => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    cancelLabel: "Annuler",
  });
  return result.success;
};
