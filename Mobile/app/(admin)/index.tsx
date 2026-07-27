import { View, ScrollView, useColorScheme } from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsGroup, SettingsRow } from "@/components/ui/settings-row";
import { getDashboard } from "@/services/api/dashboard";
import { useSession } from "@/stores/session";
import { getColors } from "@/theme/colors";
import { fr } from "@/i18n/fr";

function Kpi({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View className="min-w-[45%] flex-1 gap-2 rounded-xl border border-border bg-card p-4">
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="text-2xl font-bold tabular-nums">{value}</Text>
      <Text variant="small">{label}</Text>
    </View>
  );
}

export default function AdminHome() {
  const colors = getColors(useColorScheme());
  const isAdmin = useSession((s) => s.user?.role === "admin");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getDashboard,
  });

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.admin.title }} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <Heading level={2}>{fr.admin.dashboard}</Heading>

        {isLoading || !data ? (
          <View className="gap-3">
            <Skeleton height={96} />
            <Skeleton height={96} />
          </View>
        ) : (
          <>
            <View className="flex-row flex-wrap gap-3">
              <Kpi label={fr.admin.users} value={data.users.nombre} icon="people-outline" color={colors.primary} />
              <Kpi label={fr.admin.articles} value={data.blogs.nombre} icon="document-text-outline" color={colors.primary} />
              <Kpi label={fr.admin.events} value={data.evenements.nombre} icon="calendar-outline" color={colors.primary} />
              <Kpi label={fr.admin.subscribers} value={data.abonnes.nombre} icon="mail-outline" color={colors.primary} />
            </View>

            <View className="gap-2 rounded-xl border border-border bg-card p-4">
              <Row label={fr.admin.pendingRdv} value={data.rendezVous?.enAttente ?? 0} />
              <Row
                label={fr.admin.activeTasks}
                value={(data.taches?.aFaire ?? 0) + (data.taches?.enCours ?? 0)}
              />
              <Row label={fr.admin.hoursMonth} value={`${data.pointage?.heuresMois ?? 0} h`} />
              <Row label={fr.admin.inscriptions} value={data.finances?.nbInscrits ?? 0} />
            </View>
          </>
        )}

        <SettingsGroup title={fr.admin.sections}>
          <SettingsRow
            label={fr.admin.events}
            onPress={() => router.push("/(admin)/evenements")}
          />
          <SettingsRow
            label={fr.agendaAdmin.title}
            onPress={() => router.push("/(admin)/agenda")}
          />
          <SettingsRow
            label={fr.newsletters.title}
            onPress={() => router.push("/(admin)/newsletters")}
          />
          <SettingsRow
            label={fr.abonnes.title}
            onPress={() => router.push("/(admin)/abonnes")}
          />
          <SettingsRow
            label={fr.anniversairesAdmin.title}
            onPress={() => router.push("/(admin)/anniversaires")}
          />
          <SettingsRow
            label={fr.taches.title}
            onPress={() => router.push("/(admin)/taches")}
          />
          <SettingsRow
            label={fr.pointage.title}
            onPress={() => router.push("/(admin)/pointage")}
          />
          <SettingsRow
            label={fr.calendrierAdmin.title}
            onPress={() => router.push("/(admin)/calendrier")}
          />
          <SettingsRow
            label={fr.fichiersAdmin.title}
            onPress={() => router.push("/(admin)/fichiers")}
          />
          {isAdmin ? (
            <SettingsRow
              label={fr.utilisateursAdmin.title}
              onPress={() => router.push("/(admin)/utilisateurs")}
            />
          ) : null}
          <SettingsRow
            label={fr.admin.comments}
            onPress={() => router.push("/(admin)/commentaires")}
          />
          <SettingsRow
            label={fr.admin.contacts}
            onPress={() => router.push("/(admin)/contacts")}
          />
          <SettingsRow
            label={fr.admin.dons}
            onPress={() => router.push("/(admin)/dons")}
          />
        </SettingsGroup>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text variant="muted">{label}</Text>
      <Text className="font-semibold tabular-nums">{value}</Text>
    </View>
  );
}
