import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/ui/controlled-input";
import { requestPasswordReset } from "@/services/api/auth";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const schema = z.object({ email: z.email(fr.auth.invalidEmail) });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await requestPasswordReset(values.email);
      toast.success(fr.auth.resetSent);
      router.back();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20, gap: 24, flexGrow: 1 }}>
          <View className="gap-1 pt-6">
            <Heading level={1}>{fr.auth.forgotTitle}</Heading>
            <Text variant="muted">{fr.auth.forgotSubtitle}</Text>
          </View>

          <ControlledInput
            control={control}
            name="email"
            label={fr.auth.email}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />

          <View className="gap-3">
            <Button
              label={fr.auth.sendLink}
              loading={formState.isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
            <Button
              label="Retour"
              variant="ghost"
              onPress={() => router.back()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
