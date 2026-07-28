import { Redirect, Stack } from "expo-router";
import { useSession } from "@/stores/session";

export default function AuthLayout() {
  const status = useSession((s) => s.status);

  // Déjà connecté → on ne montre pas les écrans d'auth.
  if (status === "authenticated") return <Redirect href="/(public)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
