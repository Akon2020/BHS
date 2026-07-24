import { Stack } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { EmptyState } from "@/components/ui/empty-state";

// Espace admin — les modules de gestion arrivent aux phases 4 et 5.
export default function AdminHome() {
  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: "Administration" }} />
      <EmptyState
        title="Espace administration"
        description="Les modules de gestion seront disponibles prochainement."
      />
    </Screen>
  );
}
