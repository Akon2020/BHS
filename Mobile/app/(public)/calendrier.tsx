import { useMemo, useState } from "react";
import { View, ScrollView, Pressable, useColorScheme } from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getEvenements } from "@/services/api/evenements";
import { suiviRdv } from "@/services/api/agenda";
import { getAnniversairesAVenir } from "@/services/api/anniversaires";
import { useSession } from "@/stores/session";
import { getColors } from "@/theme/colors";
import { googleCalendarUrl, type CalendarItem } from "@/lib/calendar-link";
import { formatHeure } from "@/utils/format";
import { fr } from "@/i18n/fr";

const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

interface Item {
  key: string;
  type: "event" | "rdv" | "anniversaire";
  date: string;
  heureDebut?: string;
  title: string;
  slug?: string;
  cal: CalendarItem;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Calendrier() {
  const colors = getColors(useColorScheme());
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });

  const { data: eventsData, isLoading: loadingEvents } = useQuery({
    queryKey: ["evenements", "public"],
    queryFn: () => getEvenements({ limit: 200 }),
  });
  const { data: rdvs } = useQuery({
    queryKey: ["agenda", "suivi", user?.email],
    queryFn: () => suiviRdv(user!.email),
    enabled: status === "authenticated" && !!user?.email,
  });
  const { data: anniversaires } = useQuery({
    queryKey: ["anniversaires", "a-venir"],
    queryFn: getAnniversairesAVenir,
    enabled: status === "authenticated",
  });

  const items = useMemo<Item[]>(() => {
    const { year, month } = cursor;
    const inMonth = (iso?: string | null) => {
      if (!iso) return false;
      const [y, m] = iso.split("-").map(Number);
      return y === year && m - 1 === month;
    };
    const list: Item[] = [];

    for (const e of eventsData?.events ?? []) {
      if (!inMonth(e.dateEvenement)) continue;
      list.push({
        key: `e-${e.idEvenement}`,
        type: "event",
        date: e.dateEvenement,
        heureDebut: e.heureDebut,
        title: e.titre,
        slug: e.slug,
        cal: {
          title: e.titre,
          location: e.lieu,
          date: e.dateEvenement,
          heureDebut: e.heureDebut,
          heureFin: e.heureFin,
        },
      });
    }
    for (const r of rdvs ?? []) {
      if (r.statut === "refuse" || !inMonth(r.date)) continue;
      list.push({
        key: `r-${r.idRendezVous}`,
        type: "rdv",
        date: r.date,
        heureDebut: r.heureDebut,
        title: `${fr.calendrier.rdv} — ${r.nom}`,
        cal: {
          title: `Rendez-vous — Burning Heart`,
          description: r.motif ?? undefined,
          date: r.date,
          heureDebut: r.heureDebut,
          heureFin: r.heureFin ?? undefined,
        },
      });
    }
    for (const a of anniversaires ?? []) {
      if (a.mois - 1 !== month) continue;
      const date = `${year}-${pad(a.mois)}-${pad(a.jour)}`;
      list.push({
        key: `a-${a.nom}-${a.jour}-${a.mois}`,
        type: "anniversaire",
        date,
        title: `${fr.calendrier.anniversaire} — ${a.nom}`,
        cal: { title: `Anniversaire — ${a.nom}`, date, allDay: true },
      });
    }
    return list.sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.heureDebut ?? "").localeCompare(b.heureDebut ?? ""),
    );
  }, [eventsData, rdvs, anniversaires, cursor]);

  const changeMonth = (delta: number) =>
    setCursor((c) => {
      const dt = new Date(c.year, c.month + delta, 1);
      return { year: dt.getFullYear(), month: dt.getMonth() };
    });

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.calendrier.title }} />

      {/* Navigation mensuelle */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Pressable onPress={() => changeMonth(-1)} accessibilityLabel="Mois précédent" className="p-2">
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text className="text-base font-semibold">
          {MOIS[cursor.month]} {cursor.year}
        </Text>
        <Pressable onPress={() => changeMonth(1)} accessibilityLabel="Mois suivant" className="p-2">
          <Ionicons name="chevron-forward" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        {status !== "authenticated" ? (
          <View className="rounded-lg bg-muted/60 p-3">
            <Text variant="small">{fr.calendrier.loginNeeded}</Text>
          </View>
        ) : null}

        {loadingEvents ? (
          <View className="gap-3">
            <Skeleton height={64} />
            <Skeleton height={64} />
          </View>
        ) : items.length === 0 ? (
          <EmptyState title={fr.calendrier.empty} />
        ) : (
          items.map((it) => (
            <View
              key={it.key}
              className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <View className="w-12 items-center">
                <Text className="text-lg font-bold text-primary">
                  {it.date.slice(8, 10)}
                </Text>
                <Text variant="small">{MOIS[cursor.month].slice(0, 3)}</Text>
              </View>
              <Pressable
                className="min-w-0 flex-1"
                disabled={!it.slug}
                onPress={() =>
                  it.slug && router.push(`/(public)/evenements/${it.slug}`)
                }
              >
                <Text className="text-sm font-medium" numberOfLines={1}>
                  {it.title}
                </Text>
                <View className="mt-0.5 flex-row items-center gap-2">
                  <Badge
                    label={
                      it.type === "event"
                        ? fr.calendrier.event
                        : it.type === "rdv"
                          ? fr.calendrier.rdv
                          : fr.calendrier.anniversaire
                    }
                    tone={
                      it.type === "event"
                        ? "primary"
                        : it.type === "rdv"
                          ? "success"
                          : "warning"
                    }
                  />
                  {it.heureDebut ? (
                    <Text variant="small">{formatHeure(it.heureDebut)}</Text>
                  ) : null}
                </View>
              </Pressable>
              <Pressable
                accessibilityLabel={fr.calendrier.addToCalendar}
                onPress={() => WebBrowser.openBrowserAsync(googleCalendarUrl(it.cal))}
                className="p-2"
              >
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
