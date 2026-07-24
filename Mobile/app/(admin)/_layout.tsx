import { Redirect, Stack } from "expo-router";
import { useSession } from "@/stores/session";

/**
 * Espace administration (contenu). Réservé aux rôles editeur/admin.
 * Le rôle est revalidé via /api/auth/profile au démarrage (jamais de confiance
 * aveugle en un état local) et l'accès s'appuie sur la matrice partagée.
 */
export default function AdminLayout() {
  const status = useSession((s) => s.status);
  const can = useSession((s) => s.can);

  if (status === "guest") {
    return <Redirect href="/(auth)/login" />;
  }
  // "/admin/blog" est réservé editeur/admin dans la matrice → filtre les membres.
  if (!can("/admin/blog")) {
    return <Redirect href="/(public)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
