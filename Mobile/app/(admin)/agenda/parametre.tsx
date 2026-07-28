import { useEffect, useState } from "react";
import { View, ScrollView, Switch, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorScreen } from "@/components/ui/error-screen";
import { getParametreAgenda, updateParametreAgenda } from "@/services/api/agenda";
import { getApiErrorMessage } from "@/services/api/client";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

export default function AgendaParametre() {
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "agenda", "parametre"],
    queryFn: getParametreAgenda,
  });

  const [nom, setNom] = useState("");
  const [fonction, setFonction] = useState("");
  const [message, setMessage] = useState("");
  const [actif, setActif] = useState(true);

  useEffect(() => {
    if (data) {
      setNom(data.coordinateurNom ?? "");
      setFonction(data.coordinateurFonction ?? "");
      setMessage(data.message ?? "");
      setActif(data.actif ?? true);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      updateParametreAgenda({
        coordinateurNom: nom,
        coordinateurFonction: fonction || null,
        message: message || null,
        actif,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agenda", "parametre"] });
      toast.success(fr.agendaAdmin.settingsSaved);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.agendaAdmin.settings }} />
      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={56} />
          <Skeleton height={56} />
        </View>
      ) : isError ? (
        <ErrorScreen message={fr.agendaAdmin.error} onRetry={refetch} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <Input label={fr.agendaAdmin.coordinateurNom} value={nom} onChangeText={setNom} />
          <Input label={fr.agendaAdmin.coordinateurFonction} value={fonction} onChangeText={setFonction} />
          <Input label={fr.agendaAdmin.message} value={message} onChangeText={setMessage} multiline numberOfLines={4} />
          <View className="flex-row items-center justify-between rounded-xl border border-border bg-card p-4">
            <Text className="min-w-0 flex-1 pr-3">{fr.agendaAdmin.actif}</Text>
            <Switch
              value={actif}
              onValueChange={setActif}
              trackColor={{ true: colors.primary }}
              accessibilityLabel={fr.agendaAdmin.actif}
            />
          </View>
          <Button
            label={fr.agendaAdmin.save}
            loading={save.isPending}
            disabled={!nom.trim()}
            onPress={() => save.mutate()}
          />
        </ScrollView>
      )}
    </Screen>
  );
}
