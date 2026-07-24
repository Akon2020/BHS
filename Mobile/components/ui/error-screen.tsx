import { View } from "react-native";
import { Screen } from "./screen";
import { Heading, Text } from "./text";
import { Button } from "./button";
import { fr } from "@/i18n/fr";

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Écran d'erreur générique (bornes d'erreur, échecs de rendu). */
export function ErrorScreen({ title, message, onRetry }: ErrorScreenProps) {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Heading level={2} className="text-center">
          {title ?? fr.common.error}
        </Heading>
        {message ? (
          <Text variant="muted" className="text-center">
            {message}
          </Text>
        ) : null}
        {onRetry ? (
          <Button label={fr.common.retry} variant="outline" onPress={onRetry} />
        ) : null}
      </View>
    </Screen>
  );
}
