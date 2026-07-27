import { useMemo, useState } from "react";
import { View, ScrollView, Pressable, Alert, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ManualPointageSheet } from "@/components/features/pointage/manual-sheet";
import { cn } from "@/lib/cn";
import {
  getProfils,
  getPointages,
  getPointageStats,
  pointerMaintenant,
  cloturerPointage,
  deletePointage,
  type PointagePeriode,
  type Pointage,
} from "@/services/api/pointages";
import { getApiErrorMessage } from "@/services/api/client";
import { formatDate } from "@/utils/format";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const PERIODES: { key: PointagePeriode; label: string }[] = [
  { key: "hebdo", label: fr.pointage.periodeHebdo },
  { key: "mensuel", label: fr.pointage.periodeMensuel },
  { key: "annuel", label: fr.pointage.periodeAnnuel },
];

const formatMinutes = (m?: number | null) => {
  if (!m || m <= 0) return "—";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
};

export default function PointageAdmin() {
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();
  const [periode, setPeriode] = useState<PointagePeriode>("mensuel");
  const [manualOpen, setManualOpen] = useState(false);

  const profilsQ = useQuery({ queryKey: ["admin", "pointage", "profils"], queryFn: getProfils });
  const statsQ = useQuery({
    queryKey: ["admin", "pointage", "stats", periode],
    queryFn: () => getPointageStats(periode),
  });
  const pointagesQ = useQuery({
    queryKey: ["admin", "pointage", "liste", periode],
    queryFn: () => getPointages({ periode }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "pointage"] });

  const pointer = useMutation({
    mutationFn: (idProfil: number) => pointerMaintenant(idProfil),
    onSuccess: () => {
      toast.success(fr.pointage.started);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const cloturer = useMutation({
    mutationFn: (id: number) => cloturerPointage(id),
    onSuccess: () => {
      toast.success(fr.pointage.closed);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: deletePointage,
    onSuccess: () => {
      toast.success(fr.common.deleted);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  // Sessions ouvertes (sans heure de fin) indexées par profil.
  const openByProfil = useMemo(() => {
    const map = new Map<number, Pointage>();
    (pointagesQ.data ?? []).forEach((p) => {
      if (!p.heureFin) map.set(p.idProfil, p);
    });
    return map;
  }, [pointagesQ.data]);
  const pointages = pointagesQ.data ?? [];

  const confirmDelete = (p: Pointage) =>
    Alert.alert(fr.common.delete, `${p.profil?.nomComplet ?? ""} · ${formatDate(p.date)}`, [
      { text: fr.common.cancel, style: "cancel" },
      { text: fr.common.delete, style: "destructive", onPress: () => remove.mutate(p.idPointage) },
    ]);

  const isLoading = profilsQ.isLoading || statsQ.isLoading || pointagesQ.isLoading;
  const isError = profilsQ.isError || statsQ.isError || pointagesQ.isError;
  const profils = profilsQ.data ?? [];

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          title: fr.pointage.title,
          headerRight: () => (
            <Pressable
              onPress={() => setManualOpen(true)}
              accessibilityLabel={fr.pointage.manualAdd}
              className="px-2"
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={96} />
          <Skeleton height={120} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.pointage.error}
          action={
            <Button
              label={fr.common.retry}
              variant="outline"
              onPress={() => {
                profilsQ.refetch();
                statsQ.refetch();
                pointagesQ.refetch();
              }}
            />
          }
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          {/* Sélecteur de période */}
          <View className="flex-row gap-1 rounded-lg bg-muted p-1">
            {PERIODES.map((p) => {
              const active = periode === p.key;
              return (
                <Pressable
                  key={p.key}
                  onPress={() => setPeriode(p.key)}
                  className={cn("flex-1 items-center rounded-md px-2 py-1.5", active && "bg-card")}
                >
                  <Text className={cn("text-xs", active ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Statistiques */}
          {statsQ.data ? (
            <View className="flex-row flex-wrap gap-3">
              <Stat label={fr.pointage.statPresences} value={String(statsQ.data.stats.presences)} />
              <Stat label={fr.pointage.statProfils} value={String(statsQ.data.stats.profilsActifs)} />
              <Stat label={fr.pointage.statTemps} value={statsQ.data.stats.tempsCumuleLabel} />
            </View>
          ) : null}

          {/* Profils : pointer / clôturer */}
          <View className="gap-3">
            <Heading level={3}>{fr.pointage.profilsTitle}</Heading>
            {profils.length === 0 ? (
              <Text variant="small">{fr.pointage.noProfils}</Text>
            ) : (
              profils.map((prof) => {
                const open = openByProfil.get(prof.idProfil);
                return (
                  <View key={prof.idProfil} className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <View className="min-w-0 flex-1 gap-0.5">
                      <Text className="font-semibold" numberOfLines={1}>{prof.nomComplet}</Text>
                      {open ? (
                        <Text variant="small" className="text-primary">
                          {fr.pointage.openSession} {open.heureDebut?.slice(0, 5)}
                        </Text>
                      ) : prof.fonction ? (
                        <Text variant="small" numberOfLines={1}>{prof.fonction}</Text>
                      ) : null}
                    </View>
                    {open ? (
                      <Button
                        label={fr.pointage.cloturer}
                        variant="outline"
                        size="md"
                        loading={cloturer.isPending && cloturer.variables === open.idPointage}
                        onPress={() => cloturer.mutate(open.idPointage)}
                      />
                    ) : (
                      <Button
                        label={fr.pointage.pointer}
                        size="md"
                        loading={pointer.isPending && pointer.variables === prof.idProfil}
                        onPress={() => pointer.mutate(prof.idProfil)}
                      />
                    )}
                  </View>
                );
              })
            )}
          </View>

          {/* Pointages récents */}
          <View className="gap-3">
            <Heading level={3}>{fr.pointage.recentTitle}</Heading>
            {pointages.length === 0 ? (
              <Text variant="small">{fr.pointage.noPointages}</Text>
            ) : (
              pointages.map((p) => (
                <View key={p.idPointage} className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <View className="min-w-0 flex-1 gap-0.5">
                    <Text className="font-semibold" numberOfLines={1}>{p.profil?.nomComplet ?? ""}</Text>
                    <Text variant="small">
                      {formatDate(p.date)} · {p.heureDebut?.slice(0, 5)}
                      {p.heureFin ? ` – ${p.heureFin.slice(0, 5)}` : ""}
                    </Text>
                  </View>
                  {p.heureFin ? (
                    <Badge label={formatMinutes(p.dureeMinutes)} tone="muted" />
                  ) : (
                    <Badge label={fr.pointage.inProgress} tone="primary" />
                  )}
                  <Pressable
                    onPress={() => confirmDelete(p)}
                    accessibilityLabel={fr.common.delete}
                    hitSlop={8}
                    className="p-1"
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                  </Pressable>
                </View>
              ))
            )}
          </View>

          <Text variant="small" className="text-center">{fr.pointage.exportNote}</Text>
        </ScrollView>
      )}

      {manualOpen ? (
        <ManualPointageSheet visible onClose={() => setManualOpen(false)} profils={profils} />
      ) : null}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[30%] flex-1 gap-1 rounded-xl border border-border bg-card p-4">
      <Text className="text-xl font-bold tabular-nums">{value}</Text>
      <Text variant="small">{label}</Text>
    </View>
  );
}
