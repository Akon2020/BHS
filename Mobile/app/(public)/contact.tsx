import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/ui/controlled-input";
import { sendContact } from "@/services/api/contact";
import { useSession } from "@/stores/session";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const schema = z.object({
  nomComplet: z.string().trim().min(1, fr.auth.required),
  email: z.email(fr.auth.invalidEmail),
  sujet: z.string().trim().min(1, fr.auth.required),
  message: z.string().trim().min(1, fr.auth.required),
});
type FormValues = z.infer<typeof schema>;

export default function Contact() {
  const user = useSession((s) => s.user);
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomComplet: user?.nomComplet ?? "",
      email: user?.email ?? "",
      sujet: "",
      message: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await sendContact(values);
      toast.success(fr.contact.success);
      router.back();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.contact.title }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          <Text variant="muted">{fr.contact.subtitle}</Text>
          <View className="gap-4">
            <ControlledInput
              control={control}
              name="nomComplet"
              label={fr.contact.nomComplet}
              autoCapitalize="words"
            />
            <ControlledInput
              control={control}
              name="email"
              label={fr.contact.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <ControlledInput
              control={control}
              name="sujet"
              label={fr.contact.sujet}
            />
            <ControlledInput
              control={control}
              name="message"
              label={fr.contact.message}
              multiline
              numberOfLines={5}
            />
            <Button
              label={fr.contact.send}
              loading={formState.isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
