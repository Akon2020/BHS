import { useState } from "react";
import { View, ScrollView } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createAnniversaire,
  updateAnniversaire,
  type Anniversaire,
} from "@/services/api/anniversaires";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

export function AnniversaireSheet({
  visible,
  onClose,
  existing,
}: {
  visible: boolean;
  onClose: () => void;
  existing?: Anniversaire | null;
}) {
  const queryClient = useQueryClient();
  const [nom, setNom] = useState(existing?.nom ?? "");
  const [jour, setJour] = useState(existing ? String(existing.jour) : "");
  const [mois, setMois] = useState(existing ? String(existing.mois) : "");
  const [annee, setAnnee] = useState(existing?.annee ? String(existing.annee) : "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [delai, setDelai] = useState(
    existing?.delaiRappelJours != null ? String(existing.delaiRappelJours) : "",
  );

  const mutation = useMutation({
    mutationFn: () => {
      const j = Number(jour);
      const m = Number(mois);
      if (!(j >= 1 && j <= 31) || !(m >= 1 && m <= 12)) {
        throw new Error(fr.anniversairesAdmin.invalidDate);
      }
      const payload = {
        nom: nom.trim(),
        jour: j,
        mois: m,
        annee: annee ? Number(annee) : null,
        email: email.trim() || null,
        note: note.trim() || null,
        ...(delai ? { delaiRappelJours: Number(delai) } : {}),
      };
      return existing
        ? updateAnniversaire(existing.idAnniversaire, payload)
        : createAnniversaire(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "anniversaires"] });
      toast.success(existing ? fr.anniversairesAdmin.updated : fr.anniversairesAdmin.created);
      onClose();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={existing ? fr.anniversairesAdmin.edit : fr.anniversairesAdmin.new}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
        <Input label={fr.anniversairesAdmin.nom} value={nom} onChangeText={setNom} />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label={fr.anniversairesAdmin.jour} value={jour} onChangeText={setJour} keyboardType="number-pad" />
          </View>
          <View className="flex-1">
            <Input label={fr.anniversairesAdmin.mois} value={mois} onChangeText={setMois} keyboardType="number-pad" />
          </View>
        </View>
        <Input label={fr.anniversairesAdmin.annee} value={annee} onChangeText={setAnnee} keyboardType="number-pad" />
        <Input label={fr.anniversairesAdmin.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label={fr.anniversairesAdmin.note} value={note} onChangeText={setNote} multiline numberOfLines={3} />
        <Input label={fr.anniversairesAdmin.delai} value={delai} onChangeText={setDelai} keyboardType="number-pad" />
        <Button
          label={fr.anniversairesAdmin.save}
          loading={mutation.isPending}
          disabled={!nom.trim() || !jour || !mois}
          onPress={() => mutation.mutate()}
        />
      </ScrollView>
    </Sheet>
  );
}
