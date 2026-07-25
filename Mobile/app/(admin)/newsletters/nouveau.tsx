import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/ui/controlled-input";
import { createNewsletter } from "@/services/api/newsletters";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const schema = z.object({
  titreInterne: z.string().trim().min(1, fr.auth.required),
  objetMail: z.string().trim().min(1, fr.auth.required),
  contenu: z.string().trim().min(1, fr.auth.required),
});
type FormValues = z.infer<typeof schema>;

export default function ComposeNewsletter() {
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { titreInterne: "", objetMail: "", contenu: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const created = await createNewsletter(values);
      await queryClient.invalidateQueries({ queryKey: ["admin", "newsletters"] });
      toast.success(fr.newsletters.created);
      router.replace(`/(admin)/newsletters/${created.idNewsletter}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.newsletters.compose }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View className="gap-4">
            <ControlledInput
              control={control}
              name="titreInterne"
              label={fr.newsletters.titreInterne}
            />
            <ControlledInput
              control={control}
              name="objetMail"
              label={fr.newsletters.objetMail}
            />
            <ControlledInput
              control={control}
              name="contenu"
              label={fr.newsletters.contenu}
              multiline
              numberOfLines={10}
            />
            <Text variant="small">{fr.newsletters.backgroundNote}</Text>
            <Button
              label={fr.newsletters.create}
              loading={formState.isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
