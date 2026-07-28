import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/ui/controlled-input";
import { inscription as inscriptionApi } from "@/services/api/auth";
import { useSession } from "@/stores/session";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const schema = z.object({
  nomComplet: z.string().min(2, fr.auth.required),
  email: z.email(fr.auth.invalidEmail),
  password: z.string().min(6, fr.auth.passwordTooShort),
});
type FormValues = z.infer<typeof schema>;

export default function InscriptionScreen() {
  const setSession = useSession((s) => s.setSession);
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nomComplet: "", email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { token, user } = await inscriptionApi(values);
      await setSession(token, user);
      toast.success(fr.auth.registerSuccess);
      router.replace("/(public)");
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
            <Heading level={1}>{fr.auth.registerTitle}</Heading>
            <Text variant="muted">{fr.auth.registerSubtitle}</Text>
          </View>

          <View className="gap-4">
            <ControlledInput
              control={control}
              name="nomComplet"
              label={fr.auth.nomComplet}
              autoCapitalize="words"
              textContentType="name"
            />
            <ControlledInput
              control={control}
              name="email"
              label={fr.auth.email}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <ControlledInput
              control={control}
              name="password"
              label={fr.auth.password}
              secureTextEntry
              textContentType="newPassword"
              hint={fr.auth.passwordTooShort}
            />
          </View>

          <View className="gap-4">
            <Button
              label={fr.auth.signUp}
              loading={formState.isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
            <Text variant="small" className="text-center">
              {fr.auth.legalPrefix}{" "}
              <Link href="/(public)/conditions" asChild>
                <Text className="text-xs font-semibold text-primary">{fr.compte.terms}</Text>
              </Link>{" "}
              {fr.auth.legalAnd}{" "}
              <Link href="/(public)/confidentialite" asChild>
                <Text className="text-xs font-semibold text-primary">{fr.compte.privacy}</Text>
              </Link>
              .
            </Text>
            <View className="flex-row items-center justify-center gap-1">
              <Text variant="muted">{fr.auth.hasAccount}</Text>
              <Link href="/(auth)/login" asChild>
                <Text className="text-sm font-semibold text-primary">
                  {fr.auth.signIn}
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
