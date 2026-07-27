import { ScrollView, View } from "react-native";
import { Stack } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";

export interface LegalSection {
  heading: string;
  body: string[];
}

/** Écran légal générique (confidentialité / CGU) — texte structuré en sections. */
export function LegalScreen({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title }} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <View className="gap-2">
          <Heading level={2}>{title}</Heading>
          <Text variant="small">{updated}</Text>
          <Text className="text-[15px] leading-6">{intro}</Text>
        </View>
        {sections.map((s, i) => (
          <View key={i} className="gap-2">
            <Heading level={3}>{s.heading}</Heading>
            {s.body.map((p, j) => (
              <Text key={j} className="text-[15px] leading-6 text-muted-foreground">
                {p}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
