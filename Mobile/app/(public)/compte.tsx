import { View, ScrollView } from "react-native";
import { router } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SettingsGroup, SettingsRow } from "@/components/ui/settings-row";
import { useSession } from "@/stores/session";
import { fr } from "@/i18n/fr";

const ROLE_LABEL: Record<string, string> = {
  admin: fr.profil.roleAdmin,
  editeur: fr.profil.roleEditeur,
  membre: fr.profil.roleMembre,
};

export default function Compte() {
  const status = useSession((s) => s.status);
  const user = useSession((s) => s.user);
  const logout = useSession((s) => s.logout);

  return (
    <Screen>
      <View className="px-5 pb-3 pt-2">
        <Heading level={1}>{fr.compte.title}</Heading>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {status === "authenticated" && user ? (
          <>
            <Card className="items-center gap-3 py-6">
              <Avatar uri={user.avatar} name={user.nomComplet} size={72} />
              <View className="items-center gap-1">
                <Heading level={3}>{user.nomComplet}</Heading>
                <Text variant="muted">{user.email}</Text>
                <Badge label={ROLE_LABEL[user.role] ?? user.role} tone="primary" />
              </View>
            </Card>

            <Button
              label={fr.compte.myProfile}
              onPress={() => router.push("/(member)/profil")}
            />
            <Button
              label={fr.compte.logout}
              variant="outline"
              onPress={() => logout()}
            />
          </>
        ) : (
          <EmptyState
            title={fr.compte.guestTitle}
            description={fr.compte.guestBody}
            action={
              <View className="w-full gap-3">
                <Button
                  label={fr.compte.login}
                  onPress={() => router.push("/(auth)/login")}
                />
                <Button
                  label={fr.compte.register}
                  variant="outline"
                  onPress={() => router.push("/(auth)/inscription")}
                />
              </View>
            }
          />
        )}

        {/* Services accessibles à tous */}
        <SettingsGroup title={fr.compte.services}>
          <SettingsRow
            label={fr.rdv.title}
            onPress={() => router.push("/(public)/rendez-vous")}
          />
          <SettingsRow
            label={fr.compte.resources}
            onPress={() => router.push("/(public)/fichiers")}
          />
          <SettingsRow
            label={fr.identite.title}
            onPress={() => router.push("/(public)/identite")}
          />
          <SettingsRow
            label={fr.compte.contact}
            onPress={() => router.push("/(public)/contact")}
          />
          <SettingsRow
            label={fr.compte.newsletter}
            onPress={() => router.push("/(public)/newsletter")}
          />
        </SettingsGroup>
      </ScrollView>
    </Screen>
  );
}
