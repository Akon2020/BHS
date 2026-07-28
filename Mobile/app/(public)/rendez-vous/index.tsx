import { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import {
  getParametreAgenda,
  getCreneauxDisponibles,
  reserverRdv,
  suiviRdv,
} from "@/services/api/agenda";
import type { RdvStatut } from "@/services/api/agenda/types";
import { useSession } from "@/stores/session";
import { getApiErrorMessage } from "@/services/api/client";
import { formatDate, formatHeure } from "@/utils/format";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const STATUT: Record<RdvStatut, { label: string; tone: "warning" | "success" | "destructive" | "muted" }> = {
  en_attente: { label: fr.rdv.statutEnAttente, tone: "warning" },
  approuve: { label: fr.rdv.statutApprouve, tone: "success" },
  refuse: { label: fr.rdv.statutRefuse, tone: "destructive" },
  reprogramme: { label: fr.rdv.statutReprogramme, tone: "muted" },
};

export default function RendezVous() {
  const user = useSession((s) => s.user);

  const { data: parametre } = useQuery({
    queryKey: ["agenda", "parametre"],
    queryFn: getParametreAgenda,
  });
  const { data: creneaux, isLoading: loadingCreneaux, refetch: refetchCreneaux } =
    useQuery({
      queryKey: ["agenda", "creneaux"],
      queryFn: getCreneauxDisponibles,
    });

  const [idCreneau, setIdCreneau] = useState<number | null>(null);
  const [form, setForm] = useState({
    nom: user?.nomComplet ?? "",
    email: user?.email ?? "",
    telephone: "",
    motif: "",
  });

  const [suiviEmail, setSuiviEmail] = useState(user?.email ?? "");
  const [searchedEmail, setSearchedEmail] = useState("");
  const { data: mesRdv, isFetching: loadingSuivi } = useQuery({
    queryKey: ["agenda", "suivi", searchedEmail],
    queryFn: () => suiviRdv(searchedEmail),
    enabled: !!searchedEmail,
  });

  const booking = useMutation({
    mutationFn: () =>
      reserverRdv({
        idCreneau: idCreneau as number,
        nom: form.nom.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim(),
        motif: form.motif.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success(fr.rdv.bookSuccess);
      setIdCreneau(null);
      setForm((f) => ({ ...f, telephone: "", motif: "" }));
      refetchCreneaux();
      if (form.email.trim()) setSearchedEmail(form.email.trim());
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const book = () => {
    if (!idCreneau) return toast.error(fr.rdv.selectSlotFirst);
    if (!form.nom.trim() || !form.email.trim() || !form.telephone.trim()) {
      return toast.error(fr.auth.required);
    }
    booking.mutate();
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.rdv.title }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          {/* Coordinateur */}
          <View className="gap-1">
            <Text variant="muted">{fr.rdv.withCoordinator}</Text>
            <Heading level={2}>
              {parametre?.coordinateurNom ?? "…"}
            </Heading>
            {parametre?.coordinateurFonction ? (
              <Text variant="muted">{parametre.coordinateurFonction}</Text>
            ) : null}
            {parametre?.message ? (
              <Text className="mt-2 text-sm text-foreground">{parametre.message}</Text>
            ) : null}
          </View>

          {/* Réservation */}
          <Card className="gap-4">
            <Text variant="label">{fr.rdv.chooseSlot}</Text>
            {loadingCreneaux ? (
              <Skeleton height={60} />
            ) : !creneaux || creneaux.length === 0 ? (
              <Text variant="muted">{fr.rdv.noSlots}</Text>
            ) : (
              <View className="gap-2">
                {creneaux.map((c) => {
                  const active = idCreneau === c.idCreneau;
                  return (
                    <Pressable
                      key={c.idCreneau}
                      onPress={() => setIdCreneau(c.idCreneau)}
                      className={cn(
                        "flex-row items-center justify-between rounded-lg border px-3 py-2.5",
                        active ? "border-primary bg-primary/10" : "border-border",
                      )}
                    >
                      <Text className={cn("text-sm", active && "text-primary")}>
                        {formatDate(c.date)} · {formatHeure(c.heureDebut)}–{formatHeure(c.heureFin)}
                      </Text>
                      {typeof c.reste === "number" ? (
                        <Text variant="small">
                          {c.reste} {fr.rdv.places}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Input
              label={fr.rdv.nomComplet}
              value={form.nom}
              onChangeText={(v) => setForm((f) => ({ ...f, nom: v }))}
              autoCapitalize="words"
            />
            <Input
              label={fr.rdv.email}
              value={form.email}
              onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label={fr.rdv.telephone}
              value={form.telephone}
              onChangeText={(v) => setForm((f) => ({ ...f, telephone: v }))}
              keyboardType="phone-pad"
            />
            <Input
              label={fr.rdv.motif}
              value={form.motif}
              onChangeText={(v) => setForm((f) => ({ ...f, motif: v }))}
              multiline
              numberOfLines={3}
            />
            <Button label={fr.rdv.book} loading={booking.isPending} onPress={book} />
          </Card>

          {/* Suivi */}
          <Card className="gap-3">
            <Text variant="label">{fr.rdv.trackTitle}</Text>
            <View className="flex-row items-end gap-2">
              <View className="flex-1">
                <Input
                  value={suiviEmail}
                  onChangeText={setSuiviEmail}
                  placeholder={fr.rdv.trackEmailPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <Button
                label={fr.rdv.track}
                variant="outline"
                onPress={() => setSearchedEmail(suiviEmail.trim())}
              />
            </View>

            {loadingSuivi ? (
              <Skeleton height={48} />
            ) : !searchedEmail ? (
              <Text variant="muted">{fr.rdv.trackPrompt}</Text>
            ) : !mesRdv || mesRdv.length === 0 ? (
              <Text variant="muted">{fr.rdv.trackEmpty}</Text>
            ) : (
              <View className="gap-2">
                {mesRdv.map((r) => (
                  <View
                    key={r.idRendezVous}
                    className="flex-row items-center justify-between gap-2 rounded-lg border border-border p-3"
                  >
                    <View className="min-w-0 flex-1">
                      <Text className="text-sm font-medium">
                        {formatDate(r.date)} · {formatHeure(r.heureDebut)}
                      </Text>
                      {r.motif ? (
                        <Text variant="small" numberOfLines={1}>
                          {r.motif}
                        </Text>
                      ) : null}
                    </View>
                    <Badge label={STATUT[r.statut].label} tone={STATUT[r.statut].tone} />
                  </View>
                ))}
              </View>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
