import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Sheet } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { createPointage, type ProfilPointage } from "@/services/api/pointages";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

export function ManualPointageSheet({
  visible,
  onClose,
  profils,
}: {
  visible: boolean;
  onClose: () => void;
  profils: ProfilPointage[];
}) {
  const queryClient = useQueryClient();
  const [idProfil, setIdProfil] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [note, setNote] = useState("");

  const create = useMutation({
    mutationFn: () =>
      createPointage({
        idProfil: idProfil as number,
        date,
        heureDebut,
        heureFin: heureFin || null,
        note: note || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pointage"] });
      toast.success(fr.pointage.saved);
      onClose();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <Sheet visible={visible} onClose={onClose} title={fr.pointage.manualAdd}>
      <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
        <View className="gap-1.5">
          <Text variant="label">{fr.pointage.profil}</Text>
          <View className="flex-row flex-wrap gap-2">
            {profils.map((p) => (
              <Pressable
                key={p.idProfil}
                onPress={() => setIdProfil(p.idProfil)}
                accessibilityRole="button"
                accessibilityState={{ selected: idProfil === p.idProfil }}
                className={cn("rounded-full border px-3 py-1.5", idProfil === p.idProfil ? "border-primary bg-primary/10" : "border-border")}
              >
                <Text className={cn("text-sm", idProfil === p.idProfil && "font-medium text-primary")}>{p.nomComplet}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Input label={fr.pointage.date} value={date} onChangeText={setDate} placeholder="2026-01-15" autoCapitalize="none" />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label={fr.pointage.heureDebut} value={heureDebut} onChangeText={setHeureDebut} placeholder="08:00" />
          </View>
          <View className="flex-1">
            <Input label={fr.pointage.heureFin} value={heureFin} onChangeText={setHeureFin} placeholder="12:00" />
          </View>
        </View>
        <Input label={fr.pointage.note} value={note} onChangeText={setNote} multiline numberOfLines={2} />
        <Button
          label={fr.pointage.save}
          loading={create.isPending}
          disabled={idProfil == null || !date || !heureDebut}
          onPress={() => create.mutate()}
        />
      </ScrollView>
    </Sheet>
  );
}
