import { View, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/ui/controlled-input";
import { cn } from "@/lib/cn";
import { createUser } from "@/services/api/users";
import type { UserRole } from "@/lib/permissions";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "membre", label: fr.utilisateursAdmin.roleMembre },
  { value: "editeur", label: fr.utilisateursAdmin.roleEditeur },
  { value: "admin", label: fr.utilisateursAdmin.roleAdmin },
];

const schema = z.object({
  nomComplet: z.string().trim().min(1, fr.auth.required),
  email: z.email(fr.auth.invalidEmail),
  role: z.enum(["admin", "editeur", "membre"]),
});
type FormValues = z.infer<typeof schema>;

export default function NouveauUtilisateur() {
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nomComplet: "", email: "", role: "membre" },
  });

  const create = useMutation({
    mutationFn: (values: FormValues) => createUser(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "utilisateurs"] });
      toast.success(fr.utilisateursAdmin.created);
      router.back();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.utilisateursAdmin.new }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }} keyboardShouldPersistTaps="handled">
          <ControlledInput control={control} name="nomComplet" label={fr.utilisateursAdmin.nomComplet} autoCapitalize="words" />
          <ControlledInput
            control={control}
            name="email"
            label={fr.utilisateursAdmin.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Controller
            control={control}
            name="role"
            render={({ field: { value, onChange } }) => (
              <View className="gap-1.5">
                <Text variant="label">{fr.utilisateursAdmin.role}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <Pressable
                      key={r.value}
                      onPress={() => onChange(r.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: value === r.value }}
                      className={cn("rounded-full border px-3 py-1.5", value === r.value ? "border-primary bg-primary/10" : "border-border")}
                    >
                      <Text className={cn("text-sm", value === r.value && "font-medium text-primary")}>{r.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          />
          <Button
            label={fr.utilisateursAdmin.create}
            loading={create.isPending || formState.isSubmitting}
            onPress={handleSubmit((v) => create.mutate(v))}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
