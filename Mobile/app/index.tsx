import { Redirect } from "expo-router";

// Point d'entrée : la navigation par rôle (public / auth / member / admin)
// sera introduite en Phase 1. Pour l'instant, on ouvre l'espace public.
export default function Index() {
  return <Redirect href="/(public)" />;
}
