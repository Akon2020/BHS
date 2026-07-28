import { Redirect, Stack } from "expo-router";
import { useSession } from "@/stores/session";

/** Espace membre : réservé aux utilisateurs connectés. */
export default function MemberLayout() {
  const status = useSession((s) => s.status);

  if (status === "guest") {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
