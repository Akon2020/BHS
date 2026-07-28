import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/ui/controlled-input";
import { login as loginApi } from "@/services/api/auth";
import { useSession } from "@/stores/session";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const schema = z.object({
  email: z.email(fr.auth.invalidEmail),
  password: z.string().min(6, fr.auth.passwordTooShort),
});
type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const setSession = useSession((s) => s.setSession);
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { token, user } = await loginApi(values);
      await setSession(token, user);
      toast.success(fr.auth.loginSuccess);
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
            <Heading level={1}>{fr.auth.loginTitle}</Heading>
            <Text variant="muted">{fr.auth.loginSubtitle}</Text>
          </View>

          <View className="gap-4">
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
              autoComplete="password"
              textContentType="password"
            />
            <Link href="/(auth)/mot-de-passe-oublie" asChild>
              <Text className="self-end text-sm text-primary">
                {fr.auth.forgot}
              </Text>
            </Link>
          </View>

          <View className="gap-4">
            <Button
              label={fr.auth.signIn}
              loading={formState.isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
            <View className="flex-row items-center justify-center gap-1">
              <Text variant="muted">{fr.auth.noAccount}</Text>
              <Link href="/(auth)/inscription" asChild>
                <Text className="text-sm font-semibold text-primary">
                  {fr.auth.signUp}
                </Text>
              </Link>
            </View>
            <Button
              label={fr.auth.continueGuest}
              variant="ghost"
              onPress={() => router.replace("/(public)")}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
