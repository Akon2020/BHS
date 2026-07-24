import type { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heading } from "./text";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** Feuille modale glissant du bas. Fermeture par le fond ou le geste système. */
export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable className="flex-1 bg-black/50" onPress={onClose} />
      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="absolute inset-x-0 bottom-0 gap-4 rounded-t-2xl border-t border-border bg-card px-5 pt-3"
      >
        {/* Poignée */}
        <View className="h-1 w-10 self-center rounded-full bg-muted" />
        {title ? <Heading level={3}>{title}</Heading> : null}
        {children}
      </View>
    </Modal>
  );
}
