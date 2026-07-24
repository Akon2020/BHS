import { Redirect } from "expo-router";
import { usePreferences } from "@/stores/preferences";

// Point d'entrée : onboarding au premier lancement, puis espace public.
// (La navigation par rôle member/admin se fait depuis l'espace public/profil.)
export default function Index() {
  const onboardingDone = usePreferences((s) => s.onboardingDone);
  return <Redirect href={onboardingDone ? "/(public)" : "/onboarding"} />;
}
