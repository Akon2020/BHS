import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PaymentSheet } from "@/components/features/evenements/payment-sheet";
import {
  getEvenementAdmin,
  getFinances,
  resendTicket,
} from "@/services/api/evenements";
import type {
  InscriptionEvenement,
  StatutPaiement,
} from "@/services/api/evenements/types";
import { getApiErrorMessage } from "@/services/api/client";
import { formatMontant } from "@/utils/format";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const PAY: Record<StatutPaiement, { label: string; tone: "success" | "warning" | "destructive" | "muted" }> = {
  paye: { label: fr.adminEvents.paye, tone: "success" },
  partiel: { label: fr.adminEvents.partiel, tone: "warning" },
  non_paye: { label: fr.adminEvents.nonPaye, tone: "destructive" },
  accepte_non_paye: { label: fr.adminEvents.accepteNonPaye, tone: "muted" },
};

export default function AdminEvenementDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const [selected, setSelected] = useState<InscriptionEvenement | null>(null);

  const { data: event, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "evenement", eventId],
    queryFn: () => getEvenementAdmin(eventId),
    enabled: !!eventId,
  });
  const { data: finances } = useQuery({
    queryKey: ["admin", "finances", eventId],
    queryFn: () => getFinances(eventId),
    enabled: !!eventId && !!event?.estPayant,
  });

  const resend = useMutation({
    mutationFn: (inscriptionId: number) => resendTicket(eventId, inscriptionId),
    onSuccess: () => toast.success(fr.adminEvents.resendSuccess),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.adminEvents.title }} />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={28} width="70%" />
          <Skeleton height={120} />
        </View>
      ) : isError || !event ? (
        <EmptyState
          title={fr.common.error}
          description={fr.adminEvents.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          <Heading level={2}>{event.titre}</Heading>

          {event.estPayant && finances ? (
            <Card className="gap-2">
              <Text variant="label">{fr.adminEvents.finances}</Text>
              <Stat label={fr.adminEvents.expected} value={formatMontant(finances.attendu, finances.evenement.devise)} />
              <Stat label={fr.adminEvents.collected} value={formatMontant(finances.encaisse, finances.evenement.devise)} />
              <Stat label={fr.adminEvents.remaining} value={formatMontant(finances.reste, finances.evenement.devise)} />
              <Stat label={fr.adminEvents.registrants} value={String(finances.nbInscrits)} />
            </Card>
          ) : null}

          <Text variant="label">
            {fr.adminEvents.registrants} ({event.inscriptions?.length ?? 0})
          </Text>

          {(event.inscriptions ?? []).length === 0 ? (
            <Text variant="muted">—</Text>
          ) : (
            <View className="gap-3">
              {event.inscriptions.map((ins) => (
                <View key={ins.idInscription} className="gap-2 rounded-xl border border-border bg-card p-4">
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="min-w-0 flex-1">
                      <Text className="text-sm font-semibold" numberOfLines={1}>
                        {ins.nomComplet}
                      </Text>
                      <Text variant="small" numberOfLines={1}>
                        {ins.email} · {ins.telephone}
                      </Text>
                    </View>
                    {event.estPayant ? (
                      <Badge label={PAY[ins.statutPaiement].label} tone={PAY[ins.statutPaiement].tone} />
                    ) : null}
                  </View>
                  {event.estPayant && Number(ins.montantPaye) > 0 ? (
                    <Text variant="small">
                      {formatMontant(ins.montantPaye, event.devise)}
                    </Text>
                  ) : null}
                  <View className="flex-row flex-wrap gap-2 pt-1">
                    {event.estPayant ? (
                      <Button
                        label={fr.adminEvents.updatePayment}
                        size="md"
                        variant="outline"
                        onPress={() => setSelected(ins)}
                      />
                    ) : null}
                    <Button
                      label={fr.adminEvents.resend}
                      size="md"
                      variant="ghost"
                      loading={resend.isPending && resend.variables === ins.idInscription}
                      onPress={() => resend.mutate(ins.idInscription)}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {selected ? (
        <PaymentSheet
          visible={!!selected}
          onClose={() => setSelected(null)}
          eventId={eventId}
          inscription={selected}
        />
      ) : null}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text variant="muted">{label}</Text>
      <Text className="font-semibold tabular-nums">{value || "—"}</Text>
    </View>
  );
}
