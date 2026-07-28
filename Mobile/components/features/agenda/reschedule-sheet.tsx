import { useState } from "react";
import { View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateStatutRdv } from "@/services/api/agenda";
import type { RendezVous } from "@/services/api/agenda/types";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

export function RescheduleSheet({
  visible,
  onClose,
  rdv,
}: {
  visible: boolean;
  onClose: () => void;
  rdv: RendezVous;
}) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(rdv.date?.slice(0, 10) ?? "");
  const [heureDebut, setHeureDebut] = useState(rdv.heureDebut ?? "");
  const [heureFin, setHeureFin] = useState(rdv.heureFin ?? "");

  const mutation = useMutation({
    mutationFn: () =>
      updateStatutRdv(rdv.idRendezVous, {
        statut: "reprogramme",
        date,
        heureDebut,
        heureFin: heureFin || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rendez-vous"] });
      toast.success(fr.agendaAdmin.rescheduled);
      onClose();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <Sheet visible={visible} onClose={onClose} title={fr.agendaAdmin.reschedule}>
      <View className="gap-4">
        <Input
          label={fr.agendaAdmin.date}
          value={date}
          onChangeText={setDate}
          placeholder="2026-01-15"
          autoCapitalize="none"
        />
        <Input
          label={fr.agendaAdmin.heureDebut}
          value={heureDebut}
          onChangeText={setHeureDebut}
          placeholder="09:00"
        />
        <Input
          label={fr.agendaAdmin.heureFin}
          value={heureFin}
          onChangeText={setHeureFin}
          placeholder="09:30"
        />
        <Button
          label={fr.agendaAdmin.reschedule}
          loading={mutation.isPending}
          disabled={!date || !heureDebut}
          onPress={() => mutation.mutate()}
        />
      </View>
    </Sheet>
  );
}
