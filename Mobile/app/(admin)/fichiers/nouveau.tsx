import { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { getCategories } from "@/services/api/categories";
import {
  createFichierResource,
  type FichierStatut,
} from "@/services/api/fichiers";
import { getApiErrorMessage } from "@/services/api/client";
import { formatTaille } from "@/utils/format";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

type ModeAcces = "lecture" | "telechargement";
type PickedFile = { uri: string; name: string; mimeType?: string; size?: number };

const STATUTS: { value: FichierStatut; label: string }[] = [
  { value: "brouillon", label: fr.fichiersAdmin.statutBrouillon },
  { value: "publie", label: fr.fichiersAdmin.statutPublie },
];
const ACCES: { value: ModeAcces; label: string }[] = [
  { value: "telechargement", label: fr.fichiersAdmin.acces_telechargement },
  { value: "lecture", label: fr.fichiersAdmin.acces_lecture },
];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={cn("rounded-full border px-3 py-1.5", active ? "border-primary bg-primary/10" : "border-border")}
    >
      <Text className={cn("text-sm", active && "font-medium text-primary")}>{label}</Text>
    </Pressable>
  );
}

export default function NouveauFichier() {
  const queryClient = useQueryClient();
  const [nomReference, setNomReference] = useState("");
  const [description, setDescription] = useState("");
  const [idCategorie, setIdCategorie] = useState<number | null>(null);
  const [statut, setStatut] = useState<FichierStatut>("brouillon");
  const [modeAcces, setModeAcces] = useState<ModeAcces>("telechargement");
  const [files, setFiles] = useState<PickedFile[]>([]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const pickFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    setFiles(
      result.assets.map((a) => ({
        uri: a.uri,
        name: a.name,
        mimeType: a.mimeType,
        size: a.size ?? undefined,
      })),
    );
  };

  const create = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append("nomReference", nomReference.trim());
      form.append("description", description.trim());
      form.append("statut", statut);
      form.append("modeAcces", modeAcces);
      if (idCategorie != null) form.append("idCategorie", String(idCategorie));
      files.forEach((f) => {
        // React Native FormData accepte { uri, name, type } pour un fichier.
        form.append("fichiers", {
          uri: f.uri,
          name: f.name,
          type: f.mimeType ?? "application/octet-stream",
        } as unknown as Blob);
      });
      return createFichierResource(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "fichiers"] });
      toast.success(fr.fichiersAdmin.created);
      router.back();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const onSubmit = () => {
    if (idCategorie == null) return toast.error(fr.fichiersAdmin.needCategory);
    if (files.length === 0) return toast.error(fr.fichiersAdmin.needFiles);
    create.mutate();
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.fichiersAdmin.new }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }} keyboardShouldPersistTaps="handled">
          <Input label={fr.fichiersAdmin.nomReference} value={nomReference} onChangeText={setNomReference} />
          <Input label={fr.fichiersAdmin.description} value={description} onChangeText={setDescription} multiline numberOfLines={4} />

          <View className="gap-1.5">
            <Text variant="label">{fr.fichiersAdmin.categorie}</Text>
            <View className="flex-row flex-wrap gap-2">
              {(categories ?? []).map((c) => (
                <Chip
                  key={c.idCategorie}
                  label={c.nomCategorie}
                  active={idCategorie === c.idCategorie}
                  onPress={() => setIdCategorie(c.idCategorie)}
                />
              ))}
            </View>
          </View>

          <View className="gap-1.5">
            <Text variant="label">{fr.fichiersAdmin.statut}</Text>
            <View className="flex-row flex-wrap gap-2">
              {STATUTS.map((s) => (
                <Chip key={s.value} label={s.label} active={statut === s.value} onPress={() => setStatut(s.value)} />
              ))}
            </View>
          </View>

          <View className="gap-1.5">
            <Text variant="label">{fr.fichiersAdmin.modeAcces}</Text>
            <View className="flex-row flex-wrap gap-2">
              {ACCES.map((a) => (
                <Chip key={a.value} label={a.label} active={modeAcces === a.value} onPress={() => setModeAcces(a.value)} />
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Button label={fr.fichiersAdmin.pickFiles} variant="outline" onPress={pickFiles} />
            {files.length === 0 ? (
              <Text variant="small">{fr.fichiersAdmin.noFilesYet}</Text>
            ) : (
              <View className="gap-1.5 rounded-xl border border-border bg-card p-3">
                {files.map((f, i) => (
                  <View key={`${f.name}-${i}`} className="flex-row items-center gap-2">
                    <Ionicons name="document-outline" size={16} />
                    <Text className="min-w-0 flex-1 text-sm" numberOfLines={1}>{f.name}</Text>
                    {f.size ? <Text variant="small">{formatTaille(f.size)}</Text> : null}
                  </View>
                ))}
              </View>
            )}
          </View>

          <Button
            label={fr.fichiersAdmin.create}
            loading={create.isPending}
            disabled={!nomReference.trim() || !description.trim()}
            onPress={onSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
