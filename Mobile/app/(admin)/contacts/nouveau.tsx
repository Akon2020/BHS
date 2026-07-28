import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/ui/controlled-input";
import { sendMessage } from "@/services/api/correspondance";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const schema = z.object({
  destinataireEmail: z.email(fr.auth.invalidEmail),
  destinataireNom: z.string().optional(),
  sujet: z.string().trim().min(1, fr.auth.required),
  message: z.string().trim().min(1, fr.auth.required),
});
type FormValues = z.infer<typeof schema>;

export default function ComposeMessage() {
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { destinataireEmail: "", destinataireNom: "", sujet: "", message: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await sendMessage(values);
      toast.success(fr.correspondance.messageSent);
      router.back();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.correspondance.compose }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View className="gap-4">
            <ControlledInput
              control={control}
              name="destinataireEmail"
              label={fr.correspondance.to}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <ControlledInput
              control={control}
              name="destinataireNom"
              label={fr.correspondance.toName}
              autoCapitalize="words"
            />
            <ControlledInput control={control} name="sujet" label={fr.correspondance.subject} />
            <ControlledInput
              control={control}
              name="message"
              label={fr.correspondance.message}
              multiline
              numberOfLines={6}
            />
            <Button
              label={fr.correspondance.sendMessage}
              loading={formState.isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
