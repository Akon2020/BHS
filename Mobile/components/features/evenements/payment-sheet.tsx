import { useState } from "react";
import { View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChipSelect } from "@/components/ui/chip-select";
import { Text } from "@/components/ui/text";
import { updatePaiement } from "@/services/api/evenements";
import type {
  InscriptionEvenement,
  StatutPaiement,
} from "@/services/api/evenements/types";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const STATUTS: StatutPaiement[] = ["non_paye", "partiel", "paye", "accepte_non_paye"];
const LABELS: Record<StatutPaiement, string> = {
  non_paye: fr.adminEvents.nonPaye,
  partiel: fr.adminEvents.partiel,
  paye: fr.adminEvents.paye,
  accepte_non_paye: fr.adminEvents.accepteNonPaye,
};

export function PaymentSheet({
  visible,
  onClose,
  eventId,
  inscription,
}: {
  visible: boolean;
  onClose: () => void;
  eventId: number;
  inscription: InscriptionEvenement;
}) {
  const queryClient = useQueryClient();
  const [statut, setStatut] = useState<string>(inscription.statutPaiement);
  const [montant, setMontant] = useState(String(inscription.montantPaye ?? ""));

  const mutation = useMutation({
    mutationFn: () =>
      updatePaiement(
        eventId,
        inscription.idInscription,
        statut as StatutPaiement,
        statut === "partiel" ? Number(montant) || 0 : undefined,
      ),
    onSuccess: () => {
      toast.success(fr.adminEvents.paymentUpdated);
      queryClient.invalidateQueries({ queryKey: ["admin", "evenement", eventId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "finances", eventId] });
      onClose();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const options = STATUTS.map((s) => LABELS[s]);
  const currentLabel = LABELS[statut as StatutPaiement];

  return (
    <Sheet visible={visible} onClose={onClose} title={fr.adminEvents.updatePayment}>
      <View className="gap-4">
        <Text variant="label">{inscription.nomComplet}</Text>
        <ChipSelect
          options={options}
          value={currentLabel}
          onChange={(label) => {
            const key = STATUTS.find((s) => LABELS[s] === label);
            if (key) setStatut(key);
          }}
        />
        {statut === "partiel" ? (
          <Input
            label={fr.adminEvents.amountReceived}
            value={montant}
            onChangeText={setMontant}
            keyboardType="numeric"
          />
        ) : null}
        <Button
          label={fr.adminEvents.save}
          loading={mutation.isPending}
          onPress={() => mutation.mutate()}
        />
      </View>
    </Sheet>
  );
}
