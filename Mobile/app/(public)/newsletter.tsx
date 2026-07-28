import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/ui/controlled-input";
import { subscribeNewsletter } from "@/services/api/abonnes";
import { useSession } from "@/stores/session";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const schema = z.object({
  nomComplet: z.string().trim().min(1, fr.auth.required),
  email: z.email(fr.auth.invalidEmail),
});
type FormValues = z.infer<typeof schema>;

export default function Newsletter() {
  const user = useSession((s) => s.user);
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomComplet: user?.nomComplet ?? "",
      email: user?.email ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await subscribeNewsletter(values);
      toast.success(fr.newsletter.success);
      router.back();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.newsletter.title }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
          <View className="items-center gap-3 py-4">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="mail-outline" size={28} color="#900d30" />
            </View>
            <Heading level={2} className="text-center">
              {fr.newsletter.title}
            </Heading>
            <Text variant="muted" className="text-center">
              {fr.newsletter.subtitle}
            </Text>
          </View>
          <View className="gap-4">
            <ControlledInput
              control={control}
              name="nomComplet"
              label={fr.newsletter.nomComplet}
              autoCapitalize="words"
            />
            <ControlledInput
              control={control}
              name="email"
              label={fr.newsletter.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              label={fr.newsletter.subscribe}
              loading={formState.isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
