import { useState } from "react";
import { View, ScrollView, Switch, useColorScheme } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Sheet } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createEntreeCalendrier,
  updateEntreeCalendrier,
  type EntreeCalendrier,
} from "@/services/api/calendrier";
import { getApiErrorMessage } from "@/services/api/client";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

export function EntreeSheet({
  visible,
  onClose,
  existing,
}: {
  visible: boolean;
  onClose: () => void;
  existing?: EntreeCalendrier | null;
}) {
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();
  const [titre, setTitre] = useState(existing?.titre ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [date, setDate] = useState(existing?.date?.slice(0, 10) ?? "");
  const [heureDebut, setHeureDebut] = useState(existing?.heureDebut ?? "");
  const [heureFin, setHeureFin] = useState(existing?.heureFin ?? "");
  const [lieu, setLieu] = useState(existing?.lieu ?? "");
  const [journeeEntiere, setJourneeEntiere] = useState(existing?.journeeEntiere ?? false);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        titre: titre.trim(),
        description: description.trim() || null,
        date,
        heureDebut: journeeEntiere ? null : heureDebut || null,
        heureFin: journeeEntiere ? null : heureFin || null,
        lieu: lieu.trim() || null,
        journeeEntiere,
      };
      return existing
        ? updateEntreeCalendrier(existing.idEntree, payload)
        : createEntreeCalendrier(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "calendrier"] });
      toast.success(existing ? fr.calendrierAdmin.updated : fr.calendrierAdmin.created);
      onClose();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={existing ? fr.calendrierAdmin.edit : fr.calendrierAdmin.new}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
        <Input label={fr.calendrierAdmin.titre} value={titre} onChangeText={setTitre} />
        <Input label={fr.calendrierAdmin.date} value={date} onChangeText={setDate} placeholder="2026-01-15" autoCapitalize="none" />
        <View className="flex-row items-center justify-between rounded-xl border border-border bg-card p-3">
          <Text className="min-w-0 flex-1 pr-3">{fr.calendrierAdmin.allDay}</Text>
          <Switch
            value={journeeEntiere}
            onValueChange={setJourneeEntiere}
            trackColor={{ true: colors.primary }}
            accessibilityLabel={fr.calendrierAdmin.allDay}
          />
        </View>
        {!journeeEntiere ? (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label={fr.calendrierAdmin.heureDebut} value={heureDebut} onChangeText={setHeureDebut} placeholder="09:00" />
            </View>
            <View className="flex-1">
              <Input label={fr.calendrierAdmin.heureFin} value={heureFin} onChangeText={setHeureFin} placeholder="10:00" />
            </View>
          </View>
        ) : null}
        <Input label={fr.calendrierAdmin.lieu} value={lieu} onChangeText={setLieu} />
        <Input label={fr.calendrierAdmin.description} value={description} onChangeText={setDescription} multiline numberOfLines={3} />
        <Button
          label={fr.calendrierAdmin.save}
          loading={mutation.isPending}
          disabled={!titre.trim() || !date}
          onPress={() => mutation.mutate()}
        />
      </ScrollView>
    </Sheet>
  );
}
