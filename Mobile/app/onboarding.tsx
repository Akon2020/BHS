import { View, ScrollView } from "react-native";
import { router } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePreferences } from "@/stores/preferences";
import { fr } from "@/i18n/fr";

export default function Onboarding() {
  const setOnboardingDone = usePreferences((s) => s.setOnboardingDone);

  const finish = (target: "/(public)" | "/(auth)/login") => {
    setOnboardingDone(true);
    router.replace(target);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32, flexGrow: 1 }}>
        <View className="gap-2 pt-8">
          <Badge label={fr.onboarding.subtitle} tone="primary" />
          <Heading level={1}>{fr.app.name}</Heading>
        </View>

        <View className="flex-1 justify-center gap-6">
          {fr.onboarding.points.map((p, i) => (
            <View key={p.title} className="flex-row gap-4">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                <Text className="font-bold text-primary">{i + 1}</Text>
              </View>
              <View className="flex-1 gap-1">
                <Heading level={3}>{p.title}</Heading>
                <Text variant="muted">{p.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="gap-3">
          <Button
            label={fr.onboarding.start}
            size="lg"
            onPress={() => finish("/(public)")}
          />
          <Button
            label={fr.onboarding.haveAccount}
            variant="ghost"
            onPress={() => finish("/(auth)/login")}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
