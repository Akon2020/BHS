import { View } from "react-native";
import type { ReactNode } from "react";
import { Heading, Text } from "./text";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/** État vide parlant : titre + explication + action optionnelle. */
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <View className="items-center justify-center gap-3 px-8 py-12">
      {icon}
      <Heading level={3} className="text-center">
        {title}
      </Heading>
      {description ? (
        <Text variant="muted" className="text-center">
          {description}
        </Text>
      ) : null}
      {action ? <View className="mt-2">{action}</View> : null}
    </View>
  );
}
